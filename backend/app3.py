import json
from pathlib import Path
from typing import Any, Dict, List, Tuple
from fastapi import Body

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from jsonschema import Draft202012Validator

from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

from openai import OpenAI
import os

from dotenv import load_dotenv
import os

load_dotenv()  # read .env file for environment variables

deepseek_client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)

BASE_DIR = Path(__file__).parent


def load_schema(filename: str) -> Dict[str, Any]:
    with open(BASE_DIR / "schemas" / filename, "r", encoding="utf-8") as f:
        return json.load(f)


# ===== Load MOM-only schemas =====
UI_SCHEMA = load_schema("ui-config-v3.json")
QUERY_SCHEMA = load_schema("query-mom-v1.json")

# Register local schemas so $ref won't try to fetch from network
registry = Registry().with_resources(
    [
        (
            UI_SCHEMA["$id"],
            Resource.from_contents(UI_SCHEMA, default_specification=DRAFT202012),
        ),
        (
            QUERY_SCHEMA["$id"],
            Resource.from_contents(QUERY_SCHEMA, default_specification=DRAFT202012),
        ),
    ]
)

ui_validator = Draft202012Validator(UI_SCHEMA, registry=registry)
query_validator = Draft202012Validator(QUERY_SCHEMA, registry=registry)


def validate_with(validator: Draft202012Validator, data: Any) -> Tuple[bool, List[Dict[str, Any]]]:
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    if not errors:
        return True, []
    return False, [{"path": list(e.path), "message": e.message} for e in errors]


try:
    import mysql.connector
    from mysql.connector import Error as MySQLError
except ModuleNotFoundError:
    mysql = None
    MySQLError = Exception

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "wip_dashboard"),
}


def get_db_connection():
    if mysql is None:
        raise RuntimeError("mysql-connector-python is not installed.")
    return mysql.connector.connect(**DB_CONFIG)


def parse_custom_date(value: str) -> str:
    return value[:10]


def build_record_date_filter(time_range: str, table: str, start: str | None, end: str | None) -> Tuple[str, List[Any]]:
    if time_range == "today":
        return f"record_date = (SELECT MAX(record_date) FROM {table})", []
    if time_range == "7d":
        return (
            f"record_date BETWEEN (SELECT DATE_SUB(MAX(record_date), INTERVAL 6 DAY) FROM {table}) "
            f"AND (SELECT MAX(record_date) FROM {table})",
            [],
        )
    if time_range == "30d":
        return (
            f"record_date BETWEEN (SELECT DATE_SUB(MAX(record_date), INTERVAL 29 DAY) FROM {table}) "
            f"AND (SELECT MAX(record_date) FROM {table})",
            [],
        )
    if time_range == "90d":
        return (
            f"record_date BETWEEN (SELECT DATE_SUB(MAX(record_date), INTERVAL 89 DAY) FROM {table}) "
            f"AND (SELECT MAX(record_date) FROM {table})",
            [],
        )
    if time_range == "custom" and start and end:
        return "record_date BETWEEN %s AND %s", [parse_custom_date(start), parse_custom_date(end)]
    raise ValueError(f"Unsupported timeRange: {time_range}")


def fetch_scrap_rate(time_range: str, start: str | None, end: str | None) -> Dict[str, Any]:
    filter_map = {"7d": "7days", "30d": "30days", "90d": "90days"}
    filter_type = filter_map.get(time_range)
    if filter_type is None:
        raise ValueError("ScrapRate only supports 7d, 30d, 90d, or custom.")

    clause, params = build_record_date_filter(time_range, "wip_scrap_rate", start, end)
    sql = f"""
        SELECT scrap AS value, wip_count AS wipCount, record_date
        FROM wip_scrap_rate
        WHERE filter_type = %s AND {clause}
        ORDER BY record_date DESC
        LIMIT 1
    """
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(sql, [filter_type, *params])
            row = cursor.fetchone()
    if not row:
        raise ValueError("No ScrapRate data found for the requested time range.")
    row.pop("record_date", None)
    return row


def fetch_rework_rate(time_range: str, start: str | None, end: str | None) -> Dict[str, Any]:
    filter_map = {"today": "today", "7d": "7days", "30d": "30days"}
    if time_range == "custom":
        filter_type = "30days"
    else:
        filter_type = filter_map.get(time_range)
    if filter_type is None:
        raise ValueError("ReworkRate only supports today, 7d, 30d, or custom.")

    clause, params = build_record_date_filter(time_range, "wip_rework_rate", start, end)
    sql = f"""
        SELECT rework AS value, wip, record_date
        FROM wip_rework_rate
        WHERE filter_type = %s AND {clause}
        ORDER BY record_date DESC
        LIMIT 1
    """
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(sql, [filter_type, *params])
            row = cursor.fetchone()
    if not row:
        raise ValueError("No ReworkRate data found for the requested time range.")
    row.pop("record_date", None)
    return row


def fetch_wip_aging_distribution(time_range: str, start: str | None, end: str | None) -> List[Dict[str, Any]]:
    clause, params = build_record_date_filter(time_range, "wip_aging_bucket", start, end)
    sql = f"""
        SELECT
            aging_bucket AS agingBucket,
            SUM(lot_count) AS lotCount
        FROM wip_aging_bucket
        WHERE filter_type = 'InProgress' AND {clause}
        GROUP BY aging_bucket
        ORDER BY CAST(SUBSTRING_INDEX(aging_bucket, '-', 1) AS UNSIGNED)
    """
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(sql, params)
            rows = cursor.fetchall()
    if not rows:
        raise ValueError("No WipAgingDistribution data found for the requested time range.")
    return rows


def fetch_yield_rate(
    time_range: str, dimension: str | None, start: str | None, end: str | None
) -> Dict[str, Any] | List[Dict[str, Any]]:
    filter_map = {"today": "today", "7d": "weeks", "30d": "months", "90d": "months"}
    if time_range == "custom":
        filter_type = "months"
    else:
        filter_type = filter_map.get(time_range)
    if filter_type is None:
        raise ValueError("YieldRate only supports today, 7d, 30d, 90d, or custom.")

    clause, params = build_record_date_filter(time_range, "wip_yield_summary", start, end)

    if dimension == "line":
        sql = f"""
            SELECT
                production_line_code AS line,
                ROUND(AVG(total_yield), 2) AS yield
            FROM wip_yield_summary
            WHERE filter_type = %s AND {clause}
            GROUP BY production_line_code
            ORDER BY production_line_code
        """
        query_params = [filter_type, *params]
    elif dimension == "date":
        sql = f"""
            SELECT
                CAST(record_date AS CHAR) AS date,
                ROUND(AVG(total_yield), 2) AS yield
            FROM wip_yield_summary
            WHERE filter_type = %s AND {clause}
            GROUP BY record_date
            ORDER BY record_date
        """
        query_params = [filter_type, *params]
    elif dimension is None:
        sql = f"""
            SELECT ROUND(AVG(total_yield), 2) AS value
            FROM wip_yield_summary
            WHERE filter_type = %s AND {clause}
        """
        query_params = [filter_type, *params]
    else:
        raise ValueError("YieldRate only supports dimension 'line' or 'date'.")

    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(sql, query_params)
            if dimension in ("line", "date"):
                rows = cursor.fetchall()
                if not rows:
                    raise ValueError("No YieldRate data found for the requested time range.")
                return rows
            row = cursor.fetchone()

    if not row or row["value"] is None:
        raise ValueError("No YieldRate data found for the requested time range.")
    return row


def fetch_defect_distribution(time_range: str, start: str | None, end: str | None) -> List[Dict[str, Any]]:
    filter_map = {"today": "today", "7d": "7days", "30d": "30days"}
    if time_range == "custom":
        filter_type = "30days"
    else:
        filter_type = filter_map.get(time_range)
    if filter_type is None:
        raise ValueError("DefectDistribution only supports today, 7d, 30d, or custom.")

    clause, params = build_record_date_filter(time_range, "wip_defect_rate", start, end)
    sql = f"""
        SELECT
            defect_code AS defectCode,
            SUM(defect_count) AS defectCount,
            ROUND(AVG(total_defect_percentage), 2) AS totalDefectPercentage
        FROM wip_defect_rate
        WHERE filter_type = %s AND {clause}
        GROUP BY defect_code
        ORDER BY defectCount DESC, defectCode ASC
    """
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(sql, [filter_type, *params])
            rows = cursor.fetchall()
    if not rows:
        raise ValueError("No DefectDistribution data found for the requested time range.")
    return rows


def fetch_lot_status_distribution(time_range: str, start: str | None, end: str | None) -> List[Dict[str, Any]]:
    clause, params = build_record_date_filter(time_range, "wip_lot_status", start, end)
    sql = f"""
        SELECT
            CAST(date AS CHAR) AS date,
            CAST(week_start_date AS CHAR) AS weekStartDate,
            CAST(month_start_date AS CHAR) AS monthStartDate,
            status,
            SUM(lot_count) AS lotCount
        FROM wip_lot_status
        WHERE filter_type = 'today' AND {clause}
        GROUP BY date, week_start_date, month_start_date, status
        ORDER BY date ASC, status ASC
    """
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(sql, params)
            rows = cursor.fetchall()
    if not rows:
        raise ValueError("No LotStatusDistribution data found for the requested time range.")
    return rows


app = FastAPI(title="MOM Demo Backend (MOM-only)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


# =========================
# Validate UI JSON
# =========================
@app.post("/validate/ui")
def validate_ui(payload: Any = Body(...)):
    ok, errors = validate_with(ui_validator, payload)
    return {"ok": ok, "errors": errors}


# =========================
# Run MOM Query
# =========================
@app.post("/query")
def run_query(query: Dict[str, Any]):
    """
    Response convention (match frontend resolver paths):
    - KPI-like: {"data": {"value": ...}}
    - Grid-like: {"data": {"rows": [...]}}
    - Distribution-like: {"data": {"rows": [...]}}  (front-end can map chart to rows)
    """
    ok, errors = validate_with(query_validator, query)
    if not ok:
        return {"ok": False, "errors": errors, "data": None}

    metric = query["metric"]
    time_range = query["timeRange"]
    dimension = query.get("dimension")
    start = query.get("start")
    end = query.get("end")

    if metric == "ScrapRate":
        try:
            data = fetch_scrap_rate(time_range, start, end)
        except (RuntimeError, ValueError, MySQLError) as exc:
            return {"ok": False, "errors": [str(exc)], "data": None}
        return {"ok": True, "data": data, "meta": {"timeRange": time_range}}

    if metric == "ReworkRate":
        try:
            data = fetch_rework_rate(time_range, start, end)
        except (RuntimeError, ValueError, MySQLError) as exc:
            return {"ok": False, "errors": [str(exc)], "data": None}
        return {"ok": True, "data": data, "meta": {"timeRange": time_range}}

    if metric == "YieldRate":
        try:
            result = fetch_yield_rate(time_range, dimension, start, end)
        except (RuntimeError, ValueError, MySQLError) as exc:
            return {"ok": False, "errors": [str(exc)], "data": None}
        if dimension in ("line", "date"):
            return {"ok": True, "data": {"rows": result}, "meta": {"timeRange": time_range, "dimension": dimension}}
        return {"ok": True, "data": result, "meta": {"timeRange": time_range}}

    if metric == "DefectDistribution":
        try:
            rows = fetch_defect_distribution(time_range, start, end)
        except (RuntimeError, ValueError, MySQLError) as exc:
            return {"ok": False, "errors": [str(exc)], "data": None}
        return {"ok": True, "data": {"rows": rows}, "meta": {"timeRange": time_range, "dimension": "defect_type"}}

    if metric == "WipAgingDistribution":
        try:
            rows = fetch_wip_aging_distribution(time_range, start, end)
        except (RuntimeError, ValueError, MySQLError) as exc:
            return {"ok": False, "errors": [str(exc)], "data": None}
        return {"ok": True, "data": {"rows": rows}, "meta": {"timeRange": time_range, "dimension": "aging_bucket"}}

    if metric == "LotStatusDistribution":
        try:
            rows = fetch_lot_status_distribution(time_range, start, end)
        except (RuntimeError, ValueError, MySQLError) as exc:
            return {"ok": False, "errors": [str(exc)], "data": None}
        return {"ok": True, "data": {"rows": rows}, "meta": {"timeRange": time_range, "dimension": "lot_status"}}

    return {"ok": True, "data": {"note": f"mock not implemented for {metric}"}, "meta": {"timeRange": time_range}}


# =========================
# Generate UI (LLM-generated)
# =========================
def call_llm_generate_ui(prompt: str) -> Dict[str, Any]:
    SYSTEM_PROMPT = """
You are a backend JSON generator for a Manufacturing MOM dashboard system.

Your task:
Convert the user's natural language request into a valid UIConfigV3 JSON object.

UI COMPLETENESS RULES:
- Every query in top-level "queries" MUST be referenced by at least one UI component in "children".
- Do NOT include unused queries.
COMPONENT MAPPING RULE (CRITICAL):

There are only two response shapes:
- KPI shape → data.value
- Distribution/Table shape → data.rows

Use components strictly as follows:

1) KPI metrics:
   YieldRate, ScrapRate, ReworkRate
   → Use CantierDashBoardCard
   → Use path = "data.value"

2) Distribution metrics:
   DefectDistribution,
   WipAgingDistribution,
   LotStatusDistribution
   → Use CantierDataGrid
   → Use dataPath = "data.rows"
   → NEVER use data.value for these metrics
   → you MUST include a non-empty "columns" array.
for CantierDataGrid,each column MUST be { "header": "...", "key": "...", "type": "text|number|date|datetime|enum" },
NEVER use "field" or "headerName"

Every query MUST be used by at least one component.
Do NOT include unused queries.

SORTING RULE:
If sorting is requested, "orderBy" MUST be an array of objects:
"orderBy": [ { "field": "<response field>", "direction": "asc|desc" } ]
Do NOT use strings like "defectCount desc".

OUTPUT RULES:
- Output STRICTLY valid JSON.
- No explanations.
- No markdown.
- Do not wrap JSON in code blocks.
- Only output raw JSON.

========================
TOP LEVEL STRUCTURE
========================

The top-level JSON MUST be an object with these fields:
- type (must be "MesPage")
- title (string)
- queries (object)
- children (array)

Do NOT generate any other top-level fields (e.g., layout, widgets, components).

========================
MINIMAL EXAMPLE (VALID)
========================

{
  "type": "MesPage",
  "title": "Example Dashboard",
  "queries": {
    "q_scrap": {
      "metric": "ScrapRate",
      "timeRange": "30d"
    }
  },
  "children": [
    {
      "type": "CantierDashBoardCard",
      "dashboardItems": [
        {
          "label": "Scrap Rate",
          "amount": {
            "queryKey": "q_scrap",
            "path": "data.value",
            "fallback": 0
          },
          "colorCode": "red",
          "iconName": "Warning"
        }
      ]
    }
  ]
}

Follow this structure exactly.

========================================
QUERY CONTRACT (VERY IMPORTANT)
========================================

Each object inside "queries" MUST follow QueryMOMV1 and use ONLY these fields:
- metric (required)
- timeRange (required)
- dimension (optional, only when allowed/required)
- start (required only when timeRange="custom", format YYYY-MM-DD)
- end (required only when timeRange="custom", format YYYY-MM-DD)
- filters (optional)
- limit OR (page + pageSize) (optional)
- orderBy (optional)

DO NOT generate these fields inside any query:
- query
- params
- type
- sql
- any unknown fields

========================================
ALLOWED METRIC VALUES
========================================

YieldRate
ScrapRate
ReworkRate
DefectDistribution
WipAgingDistribution
LotStatusDistribution

========================================
TIME RANGE RULES
========================================

Allowed timeRange values:
today
7d
30d
90d
custom

If timeRange = "custom":
- MUST include start and end
- start/end format: YYYY-MM-DD

If timeRange != "custom":
- MUST NOT include start or end

========================================
DIMENSION RULES (CRITICAL)
========================================

If metric = "DefectDistribution":
- dimension MUST be "defect_type"

If metric = "WipAgingDistribution":
- dimension MUST be "aging_bucket"

If metric = "LotStatusDistribution":
- dimension MUST be "lot_status"

If metric in ["YieldRate", "ScrapRate", "ReworkRate"]:
- dimension is OPTIONAL
- If present, it MUST be either "line" or "date"
- Do not use any other dimension values for these metrics

========================================
UI CONSISTENCY RULES
========================================

- Every UI component must reference an existing queryKey in top-level "queries".
- Do not reference a queryKey that is not defined.
- Use meaningful query keys (e.g., q_yield, q_scrap, q_defects).

REMEMBER:
This is NOT a SQL system and NOT a GraphQL system.
It is a semantic metric query contract system.
"""

    response = deepseek_client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
        max_tokens=2000
    )

    content = response.choices[0].message.content

    return json.loads(content)

@app.post("/generate-ui")
def generate_ui(req: Dict[str, Any] = Body(...)):
    # Get user input prompt (from frontend)
    user_prompt = req.get("prompt")
    if not user_prompt or not isinstance(user_prompt, str) or not user_prompt.strip():
        return {"ok": False, "errors": ["Prompt is required"]}

    # Sanitize user input
    user_prompt = user_prompt.strip()
    
    # Limit: 2000 char max for user input (from frontend) to prevent excessive API token waste
    max_user_input_len = int(os.getenv("PROMPT_MAX_LENGTH", "2000"))
    if len(user_prompt) > max_user_input_len:
        return {
            "ok": False, 
            "errors": [f"User prompt too long (max {max_user_input_len} chars, got {len(user_prompt)})"]
        }

    try:
        ui_config = call_llm_generate_ui(user_prompt)
    except Exception as e:
        return {"ok": False, "errors": [f"LLM error: {str(e)}"]}

    # Schema validation
    ok, errors = validate_with(ui_validator, ui_config)
    if not ok:
        return {"ok": False, "errors": errors}

    return {"ok": True, "uiConfig": ui_config}

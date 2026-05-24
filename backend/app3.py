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
from orchestrator.service import handle_chat_ui

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
UI_SCHEMA = load_schema("ui-config-v4.json")
QUERY_SCHEMA = load_schema("query-api-v1.json")

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
    if time_range == "custom":
        filter_type = "30days"
    else:
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
            status,
            SUM(lot_count) AS lotCount
        FROM wip_lot_status
        WHERE filter_type = 'today' AND {clause}
        GROUP BY status
        ORDER BY lotCount DESC, status ASC
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
    # LLM prompt for generating modern dashboard UI config.
    SYSTEM_PROMPT = """
PROMPT VERSION: MODERN_UI_COMPONENTS_V2

You are a backend JSON generator for a Manufacturing MOM dashboard system.

Your task:
Convert the user's natural language request into one valid UIConfig JSON object.
Return only JSON. The JSON will be validated by a strict schema.

OUTPUT RULES:
- Output strictly valid JSON.
- No explanations.
- No markdown.
- Do not wrap JSON in code blocks.
- Do not include comments.
- Do not include unknown fields.

TOP LEVEL STRUCTURE:
- The top-level object MUST contain: type, title, queries, children.
- type MUST be "MesPage".
- queries MUST be an object keyed by meaningful query keys.
- children MUST be an array of UI components.
- Do NOT generate other top-level fields such as layout, widgets, or components.

QUERY CONTRACT:
Each object inside "queries" MUST use only these fields:
- metric (required)
- timeRange (required)
- dimension (optional, only when allowed or required below)
- start (required only when timeRange is "custom")
- end (required only when timeRange is "custom")
- filters, limit, page, pageSize, and orderBy are schema-supported but currently not applied by the backend query functions. Do not generate them unless the user explicitly asks and understands the backend may ignore them.

Do NOT generate these fields inside any query:
- query
- params
- type
- sql
- dataset
- time
- unknown fields

Allowed metric values:
- YieldRate
- ScrapRate
- ReworkRate
- DefectDistribution
- WipAgingDistribution
- LotStatusDistribution

Allowed timeRange values:
- today
- 7d
- 30d
- 90d
- custom

Time range rules:
- If timeRange is "custom", include both start and end as ISO date-time strings, for example "2026-05-01T00:00:00Z".
- If timeRange is not "custom", do not include start or end.

Dimension rules:
- DefectDistribution MUST use dimension = "defect_type".
- WipAgingDistribution MUST use dimension = "aging_bucket".
- LotStatusDistribution MUST use dimension = "lot_status".
- YieldRate may use dimension = "line" or "date" when the user asks for a trend or grouping.
- ScrapRate and ReworkRate should not include dimension unless the user explicitly asks for grouped data.

Optional query controls:
- Prefer not to generate filters, limit, page, pageSize, or orderBy.
- Backend query functions currently apply metric-specific default filtering and sorting.
- If the user explicitly asks for orderBy, it MUST be an array of objects, never a string.
- If the user explicitly asks for pagination, use either limit OR both page and pageSize.
- Never use limit together with page or pageSize.

BACKEND RESPONSE DATA SHAPES:
- ScrapRate returns data.value and data.wipCount.
- ReworkRate returns data.value and data.wip.
- YieldRate without dimension returns data.value.
- YieldRate with dimension returns data.rows.
- DefectDistribution returns data.rows.
- WipAgingDistribution returns data.rows.
- LotStatusDistribution returns data.rows.

REFERENCE RULES:
- Every child component must reference at least one existing queryKey.
- Every query must be referenced by at least one child component.
- Do not include unused queries.
- Do not reference a queryKey that is not defined.

MODERN COMPONENT TYPES:
Use only these modern component type values:
- ScrapRateDonut
- ReworkRateDonut
- LineChart
- PieChart
- BarChart
- ComboChart
- DataTable

Do NOT use DataTable unless QueryAPIV1 adds a production status metric later.

Metric-to-component mapping:
- ScrapRate -> ScrapRateDonut.
- ReworkRate -> ReworkRateDonut.
- YieldRate with dimension "line" or "date" -> LineChart.
- LotStatusDistribution -> PieChart.
- WipAgingDistribution -> BarChart.
- DefectDistribution -> ComboChart.

Value bindings:
- ScrapRateDonut.rate = { "queryKey": "...", "path": "data.value", "fallback": 0 }
- ScrapRateDonut.count = { "queryKey": "...", "path": "data.wipCount", "fallback": 0 }
- ReworkRateDonut.rate = { "queryKey": "...", "path": "data.value", "fallback": 0 }
- ReworkRateDonut.count = { "queryKey": "...", "path": "data.wip", "fallback": 0 }
- Chart data refs must use path = "data.rows".
- Data fields are required: chart components must include chartData, donut components must include rate and count, and DataTable must include values.

Chart field bindings:
- PieChart.chartData uses queryKey, path, labelField, valueField, optional colorField.
- BarChart.chartData uses queryKey, path, nameField, valueField.
- LineChart.chartData uses queryKey, path, nameField, yieldField.
- ComboChart.chartData uses queryKey, path, nameField, barField, lineField.

Visual styling:
- Color fields are optional visual overrides.
- Only include color fields when the user explicitly asks for specific colors or the source data provides meaningful color values.
- If the user does not mention colors or styling, omit color fields and let the frontend use its default theme.

Known response fields:
- LotStatusDistribution rows: status, lotCount.
- WipAgingDistribution rows: agingBucket, lotCount.
- DefectDistribution rows: defectCode, defectCount, totalDefectPercentage.
- YieldRate rows grouped by line: line, yield.
- YieldRate rows grouped by date: date, yield.

VALID EXAMPLE - ScrapRateDonut:
{
  "type": "MesPage",
  "title": "Scrap Rate Dashboard",
  "queries": {
    "q_scrap": {
      "metric": "ScrapRate",
      "timeRange": "30d"
    }
  },
  "children": [
    {
      "type": "ScrapRateDonut",
      "headerText": "Scrap Rate",
      "description": "Scrap rate and affected WIP count",
      "rate": { "queryKey": "q_scrap", "path": "data.value", "fallback": 0 },
      "count": { "queryKey": "q_scrap", "path": "data.wipCount", "fallback": 0 },
      "totalValue": 100,
      "legendNames": ["Scrap Rate", "WIP Count"]
    }
  ]
}

VALID EXAMPLE - PieChart:
{
  "type": "MesPage",
  "title": "Lot Status Dashboard",
  "queries": {
    "q_lot_status": {
      "metric": "LotStatusDistribution",
      "timeRange": "today",
      "dimension": "lot_status"
    }
  },
  "children": [
    {
      "type": "PieChart",
      "headerText": "Lot Status",
      "description": "Lot count by current status",
      "chartData": {
        "queryKey": "q_lot_status",
        "path": "data.rows",
        "labelField": "status",
        "valueField": "lotCount"
      }
    }
  ]
}

VALID EXAMPLE - ComboChart:
{
  "type": "MesPage",
  "title": "Defect Distribution",
  "queries": {
    "q_defects": {
      "metric": "DefectDistribution",
      "timeRange": "7d",
      "dimension": "defect_type"
    }
  },
  "children": [
    {
      "type": "ComboChart",
      "headerText": "Defects",
      "description": "Defect count and percentage by defect type",
      "lineTotalValue": 100,
      "chartData": {
        "queryKey": "q_defects",
        "path": "data.rows",
        "nameField": "defectCode",
        "barField": "defectCount",
        "lineField": "totalDefectPercentage"
      }
    }
  ]
}
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


def _is_object(value: Any) -> bool:
    return isinstance(value, dict)


def _resolve_child_query_key(child: dict[str, Any], queries: dict[str, Any]) -> str | None:
    for field_name in ("rate", "count", "chartData"):
        field_value = child.get(field_name)
        if isinstance(field_value, dict):
            query_key = field_value.get("queryKey")
            if isinstance(query_key, str) and query_key in queries:
                return query_key

    for query_key in queries:
        return query_key

    return None


def _normalize_query_for_child(query: dict[str, Any], child_type: str) -> None:
    metric = query.get("metric")
    if metric == "DefectDistribution":
        query["dimension"] = "defect_type"
    elif metric == "WipAgingDistribution":
        query["dimension"] = "aging_bucket"
    elif metric == "LotStatusDistribution":
        query["dimension"] = "lot_status"
    elif metric == "YieldRate":
        existing_dimension = query.get("dimension")
        if existing_dimension not in ("line", "date"):
            query["dimension"] = "date" if child_type == "LineChart" else "line"
    else:
        query.pop("dimension", None)


def _normalize_child_bindings(child: dict[str, Any], query_key: str, query: dict[str, Any]) -> None:
    child_type = child.get("type")
    metric = query.get("metric")

    if child_type == "ScrapRateDonut" and metric == "ScrapRate":
        child["rate"] = {"queryKey": query_key, "path": "data.value", "fallback": 0}
        child["count"] = {"queryKey": query_key, "path": "data.wipCount", "fallback": 0}
        child["totalValue"] = child.get("totalValue", 100)
        child["legendNames"] = child.get("legendNames") or ["Scrap Rate", "WIP Count"]
        return

    if child_type == "ReworkRateDonut" and metric == "ReworkRate":
        child["rate"] = {"queryKey": query_key, "path": "data.value", "fallback": 0}
        child["count"] = {"queryKey": query_key, "path": "data.wip", "fallback": 0}
        child["totalValue"] = child.get("totalValue", 100)
        child["legendNames"] = child.get("legendNames") or ["Rework Rate", "WIP Count"]
        return

    if child_type == "LineChart" and metric == "YieldRate":
        dimension = query.get("dimension", "date")
        child["chartData"] = {
            "queryKey": query_key,
            "path": "data.rows",
            "nameField": "date" if dimension == "date" else "line",
            "yieldField": "yield",
        }
        return

    if child_type == "BarChart":
        if metric == "YieldRate":
            dimension = query.get("dimension", "line")
            child["chartData"] = {
                "queryKey": query_key,
                "path": "data.rows",
                "nameField": "date" if dimension == "date" else "line",
                "valueField": "yield",
            }
            return
        if metric == "LotStatusDistribution":
            child["chartData"] = {
                "queryKey": query_key,
                "path": "data.rows",
                "nameField": "status",
                "valueField": "lotCount",
            }
            return
        if metric == "WipAgingDistribution":
            child["chartData"] = {
                "queryKey": query_key,
                "path": "data.rows",
                "nameField": "agingBucket",
                "valueField": "lotCount",
            }
            return
        if metric == "DefectDistribution":
            child["chartData"] = {
                "queryKey": query_key,
                "path": "data.rows",
                "nameField": "defectCode",
                "valueField": "defectCount",
            }
            return

    if child_type == "PieChart":
        if metric == "LotStatusDistribution":
            child["chartData"] = {
                "queryKey": query_key,
                "path": "data.rows",
                "labelField": "status",
                "valueField": "lotCount",
            }
            return
        if metric == "WipAgingDistribution":
            child["chartData"] = {
                "queryKey": query_key,
                "path": "data.rows",
                "labelField": "agingBucket",
                "valueField": "lotCount",
            }
            return
        if metric == "DefectDistribution":
            child["chartData"] = {
                "queryKey": query_key,
                "path": "data.rows",
                "labelField": "defectCode",
                "valueField": "defectCount",
            }
            return

    if child_type == "ComboChart" and metric == "DefectDistribution":
        child["lineTotalValue"] = child.get("lineTotalValue", 100)
        child["chartData"] = {
            "queryKey": query_key,
            "path": "data.rows",
            "nameField": "defectCode",
            "barField": "defectCount",
            "lineField": "totalDefectPercentage",
        }


def normalize_generated_ui_config(ui_config: dict[str, Any]) -> dict[str, Any]:
    if not _is_object(ui_config):
        return ui_config

    queries = ui_config.get("queries")
    children = ui_config.get("children")
    if not isinstance(queries, dict) or not isinstance(children, list):
        return ui_config

    normalized_queries: dict[str, Any] = {}
    for query_key, query in queries.items():
        if isinstance(query_key, str) and isinstance(query, dict):
            normalized_queries[query_key] = dict(query)

    normalized_children: list[dict[str, Any]] = []
    for child in children:
        if not isinstance(child, dict):
            continue
        normalized_child = dict(child)
        child_type = normalized_child.get("type")
        if not isinstance(child_type, str):
            normalized_children.append(normalized_child)
            continue

        query_key = _resolve_child_query_key(normalized_child, normalized_queries)
        if not query_key:
            normalized_children.append(normalized_child)
            continue

        query = normalized_queries.get(query_key)
        if not isinstance(query, dict):
            normalized_children.append(normalized_child)
            continue

        _normalize_query_for_child(query, child_type)
        _normalize_child_bindings(normalized_child, query_key, query)
        normalized_children.append(normalized_child)

    normalized_config = dict(ui_config)
    normalized_config["queries"] = normalized_queries
    normalized_config["children"] = normalized_children
    return normalized_config

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

    ui_config = normalize_generated_ui_config(ui_config)

    # Schema validation
    ok, errors = validate_with(ui_validator, ui_config)
    if not ok:
        return {"ok": False, "errors": errors}

    return {"ok": True, "uiConfig": ui_config}


@app.post("/chat-ui")
def chat_ui(req: Dict[str, Any] = Body(...)):
    user_message = req.get("message") or req.get("prompt")
    if not user_message or not isinstance(user_message, str) or not user_message.strip():
        return {"ok": False, "errors": ["Message is required"]}

    user_message = user_message.strip()
    max_user_input_len = int(os.getenv("PROMPT_MAX_LENGTH", "2000"))
    if len(user_message) > max_user_input_len:
        return {
            "ok": False,
            "errors": [f"User message too long (max {max_user_input_len} chars, got {len(user_message)})"],
        }

    session_id = req.get("sessionId")
    if session_id is not None and not isinstance(session_id, str):
        return {"ok": False, "errors": ["sessionId must be a string when provided"]}

    return handle_chat_ui(
        client=deepseek_client,
        session_id=session_id,
        message=user_message,
        validate_ui_schema=lambda ui_config: validate_with(ui_validator, ui_config),
    )

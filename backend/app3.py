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

    # ---- KPI: ScrapRate ----
    if metric == "ScrapRate":
        # Doc: scrap = (SUM(scrap_qty)/SUM(total_output))*100, wipCount = SUM(total_output)
        # Mock numbers
        return {
            "ok": True,
            "data": {
                "value": 2.8,          # scrap %
                "wipCount": 12840      # total_output within window
            },
            "meta": {"timeRange": time_range},
        }

    # ---- KPI: ReworkRate ----
    if metric == "ReworkRate":
        return {
            "ok": True,
            "data": {
                "value": 3.6,      # rework %
                "wip": 12840       # total_output within window
            },
            "meta": {"timeRange": time_range},
        }

    # ---- KPI: YieldRate ----
    if metric == "YieldRate":
        # If grouped by line/date you can return rows; otherwise value.
        if dimension in ("line", "date"):
            return {
                "ok": True,
                "data": {
                    "rows": [
                        {"line": "Line A", "yield": 93.2},
                        {"line": "Line B", "yield": 91.8},
                        {"line": "Line C", "yield": 94.1},
                        {"line": "Line D", "yield": 95.0},
                        {"line": "Line E", "yield": 92.4},
                    ]
                },
                "meta": {"timeRange": time_range, "dimension": dimension},
            }
        return {
            "ok": True,
            "data": {"value": 93.6},
            "meta": {"timeRange": time_range},
        }

    # ---- Distribution: DefectDistribution ----
    if metric == "DefectDistribution":
        # Doc contract: defectCode, defectCount, totalDefectPercentage
        return {
            "ok": True,
            "data": {
                "rows": [
                    {"defectCode": "Scratch", "defectCount": 250, "totalDefectPercentage": 25.0},
                    {"defectCode": "Crack", "defectCount": 200, "totalDefectPercentage": 20.0},
                    {"defectCode": "Discolor", "defectCount": 150, "totalDefectPercentage": 15.0},
                    {"defectCode": "Burr", "defectCount": 250, "totalDefectPercentage": 25.0},
                    {"defectCode": "Warp", "defectCount": 150, "totalDefectPercentage": 15.0}
                ]
            },
            "meta": {"timeRange": time_range, "dimension": "defect_type"},
        }

    # ---- Distribution: WipAgingDistribution ----
    if metric == "WipAgingDistribution":
        # Doc contract: agingBucket, lotCount
        return {
            "ok": True,
            "data": {
                "rows": [
                    {"agingBucket": "1-3", "lotCount": 12},
                    {"agingBucket": "4-7", "lotCount": 18},
                    {"agingBucket": "8-11", "lotCount": 9},
                    {"agingBucket": "12-15", "lotCount": 6},
                    {"agingBucket": "16-19", "lotCount": 4},
                    {"agingBucket": "20-23", "lotCount": 2},
                    {"agingBucket": "24-27", "lotCount": 1}
                ]
            },
            "meta": {"timeRange": time_range, "dimension": "aging_bucket"},
        }

    # ---- Distribution: LotStatusDistribution ----
    if metric == "LotStatusDistribution":
        # Doc contract example: date/weekStartDate/monthStartDate/status/lotCount
        return {
            "ok": True,
            "data": {
                "rows": [
                    {
                        "date": "2026-02-28",
                        "weekStartDate": "2026-02-23",
                        "monthStartDate": "2026-02-01",
                        "status": "NotStarted",
                        "lotCount": 5
                    },
                    {
                        "date": "2026-02-28",
                        "weekStartDate": "2026-02-23",
                        "monthStartDate": "2026-02-01",
                        "status": "WIP",
                        "lotCount": 11
                    },
                    {
                        "date": "2026-02-28",
                        "weekStartDate": "2026-02-23",
                        "monthStartDate": "2026-02-01",
                        "status": "Finished",
                        "lotCount": 7
                    }
                ]
            },
            "meta": {"timeRange": time_range, "dimension": "lot_status"},
        }

    # Default response
    return {
        "ok": True,
        "data": {"value": None, "note": f"mock not implemented for {metric}"},
        "meta": {"timeRange": time_range},
    }


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
    prompt = req.get("prompt")
    if not prompt:
        return {"ok": False, "errors": ["Prompt is required"]}

    try:
        ui_config = call_llm_generate_ui(prompt)
    except Exception as e:
        return {"ok": False, "errors": [f"LLM error: {str(e)}"]}

    # Schema validation
    ok, errors = validate_with(ui_validator, ui_config)
    if not ok:
        return {"ok": False, "errors": errors}

    return {"ok": True, "uiConfig": ui_config}

# =========================
# Generate UI (rule-based)
# =========================

# @app.post("/generate-ui")
# def generate_ui(req: Dict[str, Any]):
#     """
#     req: { "prompt": "..." }
#     Demo rule mapping -> outputs UIConfigV3 (MOM only)
#     """
#     prompt = (req.get("prompt") or "").lower()

#     queries: Dict[str, Dict[str, Any]] = {}
#     children: List[Dict[str, Any]] = []

#     def put_query(key: str, metric: str, time_range: str = "7d", dimension: str | None = None) -> str:
#         q: Dict[str, Any] = {"metric": metric, "timeRange": time_range}
#         if dimension:
#             q["dimension"] = dimension
#         queries[key] = q
#         return key

#     dashboard_items: List[Dict[str, Any]] = []

#     # Cards
#     if "scrap" in prompt:
#         qk = put_query("q_scrap", "ScrapRate", "30d")
#         dashboard_items.append(
#             {
#                 "label": "Scrap Rate (%)",
#                 "amount": {"queryKey": qk, "path": "data.value", "fallback": 0},
#                 "colorCode": "red",
#                 "iconName": "Warning",
#             }
#         )

#     if "yield" in prompt:
#         qk = put_query("q_yield", "YieldRate", "30d")
#         dashboard_items.append(
#             {
#                 "label": "Yield Rate (%)",
#                 "amount": {"queryKey": qk, "path": "data.value", "fallback": 0},
#                 "colorCode": "green",
#                 "iconName": "TrendUp",
#             }
#         )

#     if "rework" in prompt:
#         qk = put_query("q_rework", "ReworkRate", "30d")
#         dashboard_items.append(
#             {
#                 "label": "Rework Rate (%)",
#                 "amount": {"queryKey": qk, "path": "data.value", "fallback": 0},
#                 "colorCode": "orange",
#                 "iconName": "Tool",
#             }
#         )

#     # Grids (distribution tables)
#     if "defect" in prompt:
#         qk = put_query("q_defects", "DefectDistribution", "30d", dimension="defect_type")
#         children.append(
#             {
#                 "type": "CantierDataGrid",
#                 "id": "defect-grid",
#                 "title": "Defect Distribution",
#                 "queryKey": qk,
#                 "dataPath": "data.rows",
#                 "columns": [
#                     {"header": "Defect", "key": "defectCode", "type": "text"},
#                     {"header": "Count", "key": "defectCount", "type": "number"},
#                     {"header": "%", "key": "totalDefectPercentage", "type": "number"}
#                 ],
#             }
#         )

#     if "wip" in prompt and "aging" in prompt:
#         qk = put_query("q_wip_aging", "WipAgingDistribution", "today", dimension="aging_bucket")
#         children.append(
#             {
#                 "type": "CantierDataGrid",
#                 "id": "wip-aging-grid",
#                 "title": "WIP Aging",
#                 "queryKey": qk,
#                 "dataPath": "data.rows",
#                 "columns": [
#                     {"header": "Aging Bucket", "key": "agingBucket", "type": "text"},
#                     {"header": "Lot Count", "key": "lotCount", "type": "number"}
#                 ],
#             }
#         )

#     if "lot" in prompt and "status" in prompt:
#         qk = put_query("q_lot_status", "LotStatusDistribution", "7d", dimension="lot_status")
#         children.append(
#             {
#                 "type": "CantierDataGrid",
#                 "id": "lot-status-grid",
#                 "title": "Lot Status",
#                 "queryKey": qk,
#                 "dataPath": "data.rows",
#                 "columns": [
#                     {"header": "Date", "key": "date", "type": "date"},
#                     {"header": "Week Start", "key": "weekStartDate", "type": "date"},
#                     {"header": "Month Start", "key": "monthStartDate", "type": "date"},
#                     {"header": "Status", "key": "status", "type": "text"},
#                     {"header": "Lot Count", "key": "lotCount", "type": "number"}
#                 ],
#             }
#         )

#     if not dashboard_items and not children:
#         return {"ok": False, "errors": ["Unsupported request in demo"]}

#     if dashboard_items:
#         children.insert(
#             0,
#             {
#                 "type": "CantierDashBoardCard",
#                 "dashboardItems": dashboard_items,
#             },
#         )

#     ui_config = {
#         "type": "MesPage",
#         "title": "MOM Test Dashboard",
#         "queries": queries,
#         "children": children,
#     }

#     ok, errors = validate_with(ui_validator, ui_config)
#     if not ok:
#         return {"ok": False, "errors": errors}

#     return {"ok": True, "uiConfig": ui_config}
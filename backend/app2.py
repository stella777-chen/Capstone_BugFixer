import json
from pathlib import Path
from typing import Any, Dict, List, Tuple

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from jsonschema import Draft202012Validator

BASE_DIR = Path(__file__).parent


def load_schema(filename: str) -> Dict[str, Any]:
    with open(BASE_DIR / "schemas" / filename, "r", encoding="utf-8") as f:
        return json.load(f)


UI_SCHEMA = load_schema("ui-config-v2.json")
QUERY_SCHEMA = load_schema("query-v2.json")

ui_validator = Draft202012Validator(UI_SCHEMA)
query_validator = Draft202012Validator(QUERY_SCHEMA)


def validate_with(validator: Draft202012Validator, data: Any) -> Tuple[bool, List[Dict[str, Any]]]:
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    if not errors:
        return True, []
    return False, [{"path": list(e.path), "message": e.message} for e in errors]


app = FastAPI(title="MOM Demo Backend")

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


@app.post("/validate/ui")
def validate_ui(payload: Any):
    ok, errors = validate_with(ui_validator, payload)
    return {"ok": ok, "errors": errors}


@app.post("/query")
def run_query(query: Dict[str, Any]):
    """
    Convention: For the ValueRefV1 and DataGrid default dataPath
    - KPI type: returns {"value": ...}
    - Table type: returns {"rows": [...]}
    - Series type: returns {"series": [...]}
    """
    ok, errors = validate_with(query_validator, query)
    if not ok:
        return {"ok": False, "errors": errors, "data": None}

    metric = query["metric"]
    time_range = query["timeRange"]

    # ===== KPI: OEE =====
    if metric == "OEE":
        return {
            "ok": True,
            "data": {
                "value": 0.74,
                "series": [
                    {"t": "2026-02-01T00:00:00Z", "v": 0.72},
                    {"t": "2026-02-02T00:00:00Z", "v": 0.75},
                    {"t": "2026-02-03T00:00:00Z", "v": 0.71},
                ],
            },
            "meta": {"timeRange": time_range},
        }

    # ===== TABLE: DowntimeMinutes =====
    if metric == "DowntimeMinutes":
        return {
            "ok": True,
            "data": {
                "value": 52,  # Total downtime minutes (for the card)
                "rows": [
                    {"machine": "M1", "reason": "Jam", "minutes": 34},
                    {"machine": "M2", "reason": "Maintenance", "minutes": 18},
                ],
            },
            "meta": {"timeRange": time_range},
        }

    # ===== KPI: OutputQty =====
    if metric == "OutputQty":
        return {
            "ok": True,
            "data": {"value": 12840, "unit": "pcs"},
            "meta": {"timeRange": time_range},
        }

    # Default response for unsupported metric
    return {"ok": True, "data": {"value": None, "note": f"mock not implemented for {metric}"}, "meta": {"timeRange": time_range}}


@app.post("/generate-ui")
def generate_ui(req: Dict[str, Any]):
    """
    req: { "prompt": "..." }
    In demo phase, rules/fixed mapping is used instead of real LLM to generate UIConfigV1 that conforms to the schema.
    """
    prompt = (req.get("prompt") or "").lower()

    # ---- 1) Generate queries (UI schema requires this) ----
    queries: Dict[str, Dict[str, Any]] = {}

    def put_query(key: str, metric: str, time_range: str = "24h") -> str:
        # Additional defaults can be added here, like dimension/filters
        queries[key] = {"metric": metric, "timeRange": time_range}
        return key

    # ---- 2) Generate children ----
    children: List[Dict[str, Any]] = []

    dashboard_items: List[Dict[str, Any]] = []
    secondary_card: Dict[str, Any] | None = None

    # ===== Card: OEE =====
    if "oee" in prompt:
        qk = put_query("q_oee", "OEE", "24h")
        dashboard_items.append(
            {
                "label": "OEE",
                # Using ValueRefV1 to reference query result: default path="data.value"
                "amount": {"queryKey": qk, "path": "data.value", "fallback": None},
                "colorCode": "green",
                "iconName": "TrendUp",
            }
        )

    # ===== Card: Output =====
    if "output" in prompt:
        qk = put_query("q_output", "OutputQty", "24h")
        dashboard_items.append(
            {
                "label": "Output",
                "amount": {"queryKey": qk, "path": "data.value", "fallback": 0},
                "colorCode": "blue",
                "iconName": "Factory",
            }
        )

    # ===== Downtime: Can be either Card or DataGrid (if prompt mentions grid/table, use DataGrid) =====
    if "downtime" in prompt:
        qk = put_query("q_downtime", "DowntimeMinutes", "24h")
        dashboard_items.append(
            {
                "label": "Downtime",
                "amount": {"queryKey": qk, "path": "data.value", "fallback": 0},
                "colorCode": "red",
                "iconName": "Warning",
            }
        )

        # If user explicitly asks for a table/grid/breakdown, add DataGrid
        if any(k in prompt for k in ["table", "grid", "breakdown", "details", "reason"]):
            children.append(
                {
                    "type": "CantierDataGrid",
                    "id": "downtime-grid",
                    "title": "Downtime Breakdown",
                    "queryKey": qk,
                    # Explicitly specifying dataPath for clarity (default is rows)
                    "dataPath": "data.rows",
                    "columns": [
                        {"header": "Machine", "key": "machine", "type": "text"},
                        {"header": "Reason", "key": "reason", "type": "text"},
                        {"header": "Minutes", "key": "minutes", "type": "number"},
                    ],
                }
            )

    # ===== Secondary Card: defect rate (Static value in demo since no DefectRate metric enum in schema) =====
    if "defect rate" in prompt:
        secondary_card = {
            "type": "CantierSecondaryCard",
            "title": "Defect Rate",
            "subtitle": "Mock subtitle",
            "value": 1028,
            "colorCode": "green",
            "className": "SecondaryCard",
            "iconName": "SecondaryCard",
        }

    # If no items match the prompt, return an error
    if not dashboard_items and secondary_card is None and not children:
        return {"ok": False, "errors": ["Unsupported request in demo"]}

    # If there are dashboard items, create CantierDashBoardCard
    if dashboard_items:
        children.insert(
            0,
            {
                "type": "CantierDashBoardCard",
                "dashboardItems": dashboard_items,
            },
        )

    # Add secondary card
    if secondary_card is not None:
        children.append(secondary_card)

    # If children have content but queries are empty (theoretically shouldn't happen, but a fallback)
    if not queries:
        # Provide a minimal valid query to ensure schema passes (you can also return an error here)
        put_query("q_default", "OEE", "24h")

    ui_config = {
        "type": "MesPage",
        "title": "Test Dashboard",
        "queries": queries,
        "children": children,
    }

    ok, errors = validate_with(ui_validator, ui_config)
    if not ok:
        return {"ok": False, "errors": errors}

    return {"ok": True, "uiConfig": ui_config}
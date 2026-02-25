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

UI_SCHEMA = load_schema("ui-config-v1.json")
QUERY_SCHEMA = load_schema("query-v1.json")

ui_validator = Draft202012Validator(UI_SCHEMA)
query_validator = Draft202012Validator(QUERY_SCHEMA)

def validate_with(validator: Draft202012Validator, data: Any) -> Tuple[bool, List[Dict[str, Any]]]:
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    if not errors:
        return True, []
    return False, [{"path": list(e.path), "message": e.message} for e in errors]

app = FastAPI(title="MOM Demo Backend")

# demo阶段：先全放开，等前端端口确定再收紧
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
    ok, errors = validate_with(query_validator, query)
    if not ok:
        return {"ok": False, "errors": errors, "data": None}

    metric = query["metric"]
    time_range = query["timeRange"]

    # 你先用固定 mock 数据跑通前后端
    if metric == "OEE":
        return {
            "ok": True,
            "data": {
                "series": [
                    {"t": "2026-02-01T00:00:00Z", "v": 0.72},
                    {"t": "2026-02-02T00:00:00Z", "v": 0.75},
                    {"t": "2026-02-03T00:00:00Z", "v": 0.71}
                ]
            },
            "meta": {"timeRange": time_range}
        }

    if metric == "DowntimeMinutes":
        return {
            "ok": True,
            "data": {
                "rows": [
                    {"machine": "M1", "reason": "Jam", "minutes": 34},
                    {"machine": "M2", "reason": "Maintenance", "minutes": 18}
                ]
            },
            "meta": {"timeRange": time_range}
        }

    if metric == "OutputQty":
        return {
            "ok": True,
            "data": {"kpi": 12840, "unit": "pcs"},
            "meta": {"timeRange": time_range}
        }

    return {"ok": True, "data": {"note": f"mock not implemented for {metric}"}, "meta": {"timeRange": time_range}}

@app.post("/generate-ui")
def generate_ui(req: Dict[str, Any]):
    """
    req: { "prompt": "..." }
    demo阶段先用规则/固定映射代替真实LLM：生成符合 schema 的 UIConfig
    """
    prompt = (req.get("prompt") or "").lower()

    # 根据 prompt 生成 dashboardItems
    items = []
    children = []

    secondaryCard = None

    # 你可以按关键词决定要展示哪些 KPI
    if "oee" in prompt:
        items.append({
            "label": "OEE",
            "amount": "74%",
            "colorCode": "green",
            "iconName": "TrendUp"
        })

    if "output" in prompt:
        items.append({
            "label": "Output",
            "amount": 12840,
            "colorCode": "blue",
            "iconName": "Factory"
        })

    if "downtime" in prompt:
        items.append({
            "label": "Downtime",
            "amount": 52,
            "colorCode": "red",
            "iconName": "Warning"
        })

    if "defect rate" in prompt:
        secondaryCard = {
        "type": "CantierSecondaryCard" ,
        "title": "Defect Rate",
        "subtitle": "Mock subtitle",
        "value":  1028,
        "colorCode": "green",
        "className": "SecondaryCard",
        "iconName": "SecondaryCard"
        }

    if not items and secondaryCard is None:
        return {
            "ok": False,
            "errors": ["Unsupported request in demo"]
        }

    if items:
        children.append({
        "type": "CantierDashBoardCard",
        "dashboardItems": items
        })

    if secondaryCard is not None:
        children.append(secondaryCard)
    
    ui_config = {
        "type" : "MesPage",
        "children" : children
    }


    ok, errors = validate_with(ui_validator, ui_config)
    if not ok:
        return {"ok": False, "errors": errors}

    return {"ok": True, "uiConfig": ui_config}
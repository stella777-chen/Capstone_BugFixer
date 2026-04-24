import json
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from jsonschema import Draft202012Validator

try:
    import mysql.connector
    from mysql.connector import Error as MySQLError
except ModuleNotFoundError:
    mysql = None
    MySQLError = Exception

BASE_DIR = Path(__file__).parent

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "wip_dashboard"),
}

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
        # Reuse the 30days aggregation granularity for custom ranges in this seed dataset.
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
        if dimension in ("line", "date"):
            return {
                "ok": True,
                "data": {
                    "rows": [
                        {"line": "Line A", "yield": 93.2},
                        {"line": "Line B", "yield": 91.8},
                        {"line": "Line C", "yield": 94.1},
                        {"line": "Line D", "yield": 95.0},
                        {"line": "Line E", "yield": 92.4}
                    ]
                },
                "meta": {"timeRange": time_range, "dimension": dimension}
            }
        return {
            "ok": True,
            "data": {"value": 93.6},
            "meta": {"timeRange": time_range}
        }

    if metric == "DefectDistribution":
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
            "meta": {"timeRange": time_range, "dimension": "defect_type"}
        }

    if metric == "WipAgingDistribution":
        try:
            rows = fetch_wip_aging_distribution(time_range, start, end)
        except (RuntimeError, ValueError, MySQLError) as exc:
            return {"ok": False, "errors": [str(exc)], "data": None}
        return {"ok": True, "data": {"rows": rows}, "meta": {"timeRange": time_range, "dimension": "aging_bucket"}}

    if metric == "LotStatusDistribution":
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
                        "status": "WorkInProcess",
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
            "meta": {"timeRange": time_range, "dimension": "lot_status"}
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
    if "scrap" in prompt:
        items.append({
            "label": "Scrap Rate",
            "amount": "2.8%",
            "colorCode": "red",
            "iconName": "Warning"
        })

    if "rework" in prompt:
        items.append({
            "label": "Rework Rate",
            "amount": "3.6%",
            "colorCode": "orange",
            "iconName": "Tool"
        })

    if "yield" in prompt:
        items.append({
            "label": "Yield Rate",
            "amount": "93.6%",
            "colorCode": "green",
            "iconName": "TrendUp"
        })

    if "defect" in prompt:
        secondaryCard = {
        "type": "CantierSecondaryCard" ,
        "title": "Defect Distribution",
        "subtitle": "Top defect type: Scratch",
        "value":  250,
        "colorCode": "red",
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

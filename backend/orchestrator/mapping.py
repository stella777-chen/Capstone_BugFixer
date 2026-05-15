from __future__ import annotations

from typing import Any

from .catalog import DEFAULT_COMPONENTS


QUERY_KEY_PREFIXES = {
    "ScrapRate": "q_scrap",
    "ReworkRate": "q_rework",
    "YieldRate": "q_yield",
    "LotStatusDistribution": "q_lot_status",
    "WipAgingDistribution": "q_wip_aging",
    "DefectDistribution": "q_defects",
}

VALUE_FIELD_BY_METRIC = {
    "YieldRate": "yield",
    "LotStatusDistribution": "lotCount",
    "WipAgingDistribution": "lotCount",
    "DefectDistribution": "defectCount",
}

NAME_FIELD_BY_METRIC = {
    "YieldRate": "line",
    "LotStatusDistribution": "status",
    "WipAgingDistribution": "agingBucket",
    "DefectDistribution": "defectCode",
}

DEFAULT_TITLES = {
    "ScrapRate": "Scrap Rate",
    "ReworkRate": "Rework Rate",
    "YieldRate": "Yield Summary",
    "LotStatusDistribution": "Lot Status",
    "WipAgingDistribution": "WIP Aging",
    "DefectDistribution": "Defects",
}

DEFAULT_DESCRIPTIONS = {
    "ScrapRate": "Scrap rate and affected WIP count",
    "ReworkRate": "Rework rate and affected WIP count",
    "YieldRate": "Yield trends by production line",
    "LotStatusDistribution": "Lot count by current status",
    "WipAgingDistribution": "WIP count by aging bucket",
    "DefectDistribution": "Defect count and percentage by defect type",
}


def _query_key_for(metric: str, existing: set[str]) -> str:
    base = QUERY_KEY_PREFIXES[metric]
    if base not in existing:
        existing.add(base)
        return base

    suffix = 2
    while f"{base}_{suffix}" in existing:
        suffix += 1
    key = f"{base}_{suffix}"
    existing.add(key)
    return key


def _build_query(metric: str, requirements: dict[str, Any]) -> dict[str, Any]:
    query: dict[str, Any] = {
        "metric": metric,
        "timeRange": requirements["timeRange"],
    }

    dimension = requirements.get("dimension")
    if metric == "DefectDistribution":
        query["dimension"] = "defect_type"
    elif metric == "WipAgingDistribution":
        query["dimension"] = "aging_bucket"
    elif metric == "LotStatusDistribution":
        query["dimension"] = "lot_status"
    elif metric == "YieldRate" and dimension in ("line", "date"):
        query["dimension"] = dimension

    if query["timeRange"] == "custom":
        query["start"] = requirements["start"]
        query["end"] = requirements["end"]

    return query


def _apply_visual_overrides(child: dict[str, Any], visual_overrides: dict[str, Any]) -> None:
    component_type = child["type"]
    for key, value in visual_overrides.items():
        if not isinstance(key, str):
            continue
        if "." not in key:
            continue
        target_component, field = key.split(".", 1)
        if target_component == component_type and value is not None:
            child[field] = value


def _component_for_metric(metric: str, requirements: dict[str, Any]) -> str:
    return (requirements.get("componentOverrides") or {}).get(metric) or DEFAULT_COMPONENTS[metric]


def _name_field_for(metric: str, requirements: dict[str, Any]) -> str:
    if metric == "YieldRate" and requirements.get("dimension") == "date":
        return "date"
    return NAME_FIELD_BY_METRIC[metric]


def _build_bar_chart_data(metric: str, query_key: str, requirements: dict[str, Any]) -> dict[str, Any]:
    return {
        "queryKey": query_key,
        "path": "data.rows",
        "nameField": _name_field_for(metric, requirements),
        "valueField": VALUE_FIELD_BY_METRIC[metric],
    }


def _build_pie_chart_data(metric: str, query_key: str, requirements: dict[str, Any]) -> dict[str, Any]:
    return {
        "queryKey": query_key,
        "path": "data.rows",
        "labelField": _name_field_for(metric, requirements),
        "valueField": VALUE_FIELD_BY_METRIC[metric],
    }


def _build_child(metric: str, query_key: str, requirements: dict[str, Any]) -> dict[str, Any]:
    component_type = _component_for_metric(metric, requirements)
    child: dict[str, Any] = {
        "type": component_type,
        "headerText": DEFAULT_TITLES[metric],
        "description": DEFAULT_DESCRIPTIONS[metric],
    }

    if metric == "ScrapRate":
        child.update({
            "rate": {"queryKey": query_key, "path": "data.value", "fallback": 0},
            "count": {"queryKey": query_key, "path": "data.wipCount", "fallback": 0},
            "totalValue": 100,
            "legendNames": ["Scrap Rate", "WIP Count"],
        })
    elif metric == "ReworkRate":
        child.update({
            "rate": {"queryKey": query_key, "path": "data.value", "fallback": 0},
            "count": {"queryKey": query_key, "path": "data.wip", "fallback": 0},
            "totalValue": 100,
            "legendNames": ["Rework Rate", "WIP Count"],
        })
    elif metric == "YieldRate" and component_type == "LineChart":
        name_field = "date" if requirements.get("dimension") == "date" else "line"
        child["chartData"] = {
            "queryKey": query_key,
            "path": "data.rows",
            "nameField": name_field,
            "yieldField": "yield",
        }
    elif component_type == "BarChart":
        child["chartData"] = _build_bar_chart_data(metric, query_key, requirements)
    elif component_type == "PieChart":
        child["chartData"] = _build_pie_chart_data(metric, query_key, requirements)
    elif metric == "DefectDistribution" and component_type == "ComboChart":
        child.update({
            "lineTotalValue": 100,
            "chartData": {
                "queryKey": query_key,
                "path": "data.rows",
                "nameField": "defectCode",
                "barField": "defectCount",
                "lineField": "totalDefectPercentage",
            },
        })

    _apply_visual_overrides(child, requirements.get("visualOverrides") or {})
    return child


def requirements_to_ui_config(requirements: dict[str, Any]) -> dict[str, Any]:
    queries: dict[str, Any] = {}
    children: list[dict[str, Any]] = []
    used_query_keys: set[str] = set()

    metrics = requirements.get("metrics") or []
    for metric in metrics:
        query_key = _query_key_for(metric, used_query_keys)
        queries[query_key] = _build_query(metric, requirements)
        children.append(_build_child(metric, query_key, requirements))

    return {
        "type": "MesPage",
        "title": requirements.get("title") or "MOM Dashboard",
        "queries": queries,
        "children": children,
    }

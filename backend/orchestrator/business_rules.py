from __future__ import annotations

from typing import Any

from .catalog import SUPPORTED_COMPONENTS_BY_METRIC


SUPPORTED_TIME_RANGES = {
    "ScrapRate": {"7d", "30d", "90d", "custom"},
    "ReworkRate": {"today", "7d", "30d", "custom"},
    "YieldRate": {"today", "7d", "30d", "90d", "custom"},
    "DefectDistribution": {"today", "7d", "30d", "custom"},
    "WipAgingDistribution": {"today", "7d", "30d", "90d", "custom"},
    "LotStatusDistribution": {"today", "7d", "30d", "90d", "custom"},
}

def validate_requirements(requirements: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    metrics = requirements.get("metrics") or []
    time_range = requirements.get("timeRange")
    dimension = requirements.get("dimension")
    component_overrides = requirements.get("componentOverrides") or {}

    for metric in metrics:
        supported_ranges = SUPPORTED_TIME_RANGES.get(metric)
        if supported_ranges and time_range and time_range not in supported_ranges:
            errors.append(f"{metric} does not support timeRange '{time_range}'.")

        if metric == "YieldRate" and dimension and dimension not in ("line", "date"):
            errors.append("YieldRate supports only dimension 'line' or 'date'.")

        component_type = component_overrides.get(metric)
        supported_components = SUPPORTED_COMPONENTS_BY_METRIC.get(metric, set())
        if component_type and component_type not in supported_components:
            supported = ", ".join(sorted(supported_components))
            errors.append(
                f"{metric} cannot be displayed as {component_type}. Supported components: {supported}."
            )

    if time_range == "custom" and (not requirements.get("start") or not requirements.get("end")):
        errors.append("Custom timeRange requires both start and end.")

    return errors


def _collect_query_refs(value: Any) -> set[str]:
    refs: set[str] = set()
    if isinstance(value, dict):
        query_key = value.get("queryKey")
        if isinstance(query_key, str):
            refs.add(query_key)
        for child_value in value.values():
            refs.update(_collect_query_refs(child_value))
    elif isinstance(value, list):
        for item in value:
            refs.update(_collect_query_refs(item))
    return refs


def validate_ui_business(ui_config: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    queries = ui_config.get("queries") or {}
    children = ui_config.get("children") or []
    query_keys = set(queries.keys())
    used_query_keys: set[str] = set()

    for index, child in enumerate(children):
        child_refs = _collect_query_refs(child)
        if not child_refs:
            errors.append(f"children[{index}] does not reference any queryKey.")
        unknown_refs = child_refs - query_keys
        for unknown_ref in sorted(unknown_refs):
            errors.append(f"children[{index}] references undefined queryKey '{unknown_ref}'.")
        used_query_keys.update(child_refs)

    unused_query_keys = query_keys - used_query_keys
    for unused_query_key in sorted(unused_query_keys):
        errors.append(f"queries.{unused_query_key} is not used by any child component.")

    return errors

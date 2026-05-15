from __future__ import annotations

from copy import deepcopy
from typing import Any

from .catalog import KNOWN_COMPONENTS, KNOWN_METRICS


DEFAULT_TIME_RANGE = "30d"

FIXED_DIMENSIONS = {
    "DefectDistribution": "defect_type",
    "WipAgingDistribution": "aging_bucket",
    "LotStatusDistribution": "lot_status",
}


def _has_value(value: Any) -> bool:
    return value is not None and value != "" and value != []


def merge_requirements(previous: dict[str, Any], update: dict[str, Any]) -> dict[str, Any]:
    merged = deepcopy(previous) if previous else {}

    for key in ("intent", "metricAction", "timeRange", "dimension", "start", "end", "title"):
        if _has_value(update.get(key)):
            merged[key] = update[key]

    if _has_value(update.get("metrics")):
        current_metrics = [
            metric for metric in merged.get("metrics", [])
            if metric in KNOWN_METRICS
        ]
        update_metrics = [
            metric for metric in update["metrics"]
            if metric in KNOWN_METRICS
        ]
        action = update.get("metricAction") or "replace"
        is_targeting_component_override = (
            _has_value(update.get("componentOverrides"))
            and bool(current_metrics)
            and (
                not _has_value(update.get("metricAction"))
                or (
                    action == "replace"
                    and update.get("intent") != "create_dashboard"
                    and set(update_metrics).issubset(set(current_metrics))
                )
            )
        )

        if is_targeting_component_override:
            merged["metrics"] = current_metrics
        elif action == "add":
            merged["metrics"] = current_metrics[:]
            for metric in update_metrics:
                if metric not in merged["metrics"]:
                    merged["metrics"].append(metric)
        elif action == "remove":
            merged["metrics"] = [
                metric for metric in current_metrics
                if metric not in update_metrics
            ]
        else:
            merged["metrics"] = update_metrics

    if _has_value(update.get("visualOverrides")):
        existing = merged.get("visualOverrides") or {}
        existing.update(update["visualOverrides"])
        merged["visualOverrides"] = existing

    if _has_value(update.get("componentOverrides")):
        existing = merged.get("componentOverrides") or {}
        for metric, component_type in update["componentOverrides"].items():
            if metric in KNOWN_METRICS and component_type in KNOWN_COMPONENTS:
                existing[metric] = component_type
        merged["componentOverrides"] = existing

    if _has_value(merged.get("componentOverrides")) and _has_value(merged.get("metrics")):
        metrics = set(merged["metrics"])
        merged["componentOverrides"] = {
            metric: component_type
            for metric, component_type in merged["componentOverrides"].items()
            if metric in metrics
        }

    return merged


def apply_default_rules(requirements: dict[str, Any]) -> dict[str, Any]:
    resolved = deepcopy(requirements)

    if resolved.get("metrics") and not resolved.get("timeRange"):
        resolved["timeRange"] = DEFAULT_TIME_RANGE

    metrics = resolved.get("metrics") or []
    if len(metrics) == 1:
        metric = metrics[0]
        if metric in FIXED_DIMENSIONS:
            resolved["dimension"] = FIXED_DIMENSIONS[metric]

    if "YieldRate" in metrics and not resolved.get("dimension"):
        resolved["dimension"] = "line"

    return resolved


def check_missing_fields(requirements: dict[str, Any]) -> list[dict[str, str]]:
    missing: list[dict[str, str]] = []

    if not requirements.get("metrics"):
        missing.append({
            "field": "metrics",
            "question": "Which metric do you want to see: scrap rate, rework rate, yield, lot status, WIP aging, or defects?",
        })

    if requirements.get("timeRange") == "custom":
        if not requirements.get("start"):
            missing.append({
                "field": "start",
                "question": "What start date should I use for the custom time range?",
            })
        if not requirements.get("end"):
            missing.append({
                "field": "end",
                "question": "What end date should I use for the custom time range?",
            })

    return missing

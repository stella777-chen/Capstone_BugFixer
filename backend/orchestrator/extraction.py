from __future__ import annotations

import json
import re
from typing import Any

from .catalog import KNOWN_COMPONENTS, KNOWN_METRICS
from .state import get_focused_metric


EXTRACTION_SYSTEM_PROMPT = """
You extract structured dashboard requirements from a user message.
Return only strict JSON. Do not include markdown or explanations.

Allowed metrics:
- ScrapRate
- ReworkRate
- YieldRate
- DefectDistribution
- WipAgingDistribution
- LotStatusDistribution

Allowed timeRange values:
- today
- 7d
- 30d
- 90d
- custom

Return this shape:
{
  "intent": "create_dashboard" | "modify_dashboard" | "ask_clarification",
  "metricAction": "add" | "remove" | "replace",
  "metrics": ["..."],
  "componentOverrides": {"MetricName": "ComponentType"},
  "timeRange": "today|7d|30d|90d|custom",
  "dimension": "line|date|defect_type|aging_bucket|lot_status",
  "start": "ISO date-time when custom",
  "end": "ISO date-time when custom",
  "title": "optional dashboard title",
  "visualOverrides": {},
  "missingFields": []
}

Rules:
- Omit unknown or unspecified fields.
- If the user says "previous", "that chart", "change it", or only changes time/color, use intent "modify_dashboard".
- If the user asks to add another metric, set metricAction = "add".
- If the user asks to remove/delete a metric, set metricAction = "remove".
- If the user asks to replace/switch metrics or starts a new dashboard, set metricAction = "replace".
- If the user mentions a metric only to change its chart type or style, omit metricAction.
- If metrics are mentioned for a new dashboard request and no add/remove language is present, set metricAction = "replace".
- If the user requests a chart type for a metric, put it in componentOverrides, for example {"YieldRate":"BarChart"}.
- If the user says "that chart", "previous chart", "current chart", or similar, use previousRequirements/recentMessages to infer the target metric when possible.
- Supported component types are ScrapRateDonut, ReworkRateDonut, LineChart, PieChart, BarChart, ComboChart.
- If the user asks for colors, put them in visualOverrides using UI field names when clear, such as {"BarChart.barColor":"#E65100"}.
- Do not invent metrics when the user did not mention any metric-like concept.
- Map common words:
  - scrap, scrap rate -> ScrapRate
  - rework, rework rate -> ReworkRate
  - yield, yield rate, yield trend -> YieldRate
  - defect, defects -> DefectDistribution
  - aging, WIP aging -> WipAgingDistribution
  - lot status, status distribution -> LotStatusDistribution
- Map chart words:
  - line chart, trend chart -> LineChart
  - bar chart, column chart -> BarChart
  - pie chart -> PieChart
  - donut chart, gauge, ring chart -> ScrapRateDonut or ReworkRateDonut when paired with scrap/rework
  - combo chart, combined chart, bar and line -> ComboChart
"""


METRIC_KEYWORDS = {
    "ScrapRate": ("scrap", "scrap rate"),
    "ReworkRate": ("rework", "rework rate"),
    "YieldRate": ("yield", "yield rate"),
    "DefectDistribution": ("defect", "defects"),
    "WipAgingDistribution": ("aging", "wip aging"),
    "LotStatusDistribution": ("lot status", "status distribution"),
}

COMPONENT_KEYWORDS = {
    "LineChart": ("line chart", "trend chart", "line"),
    "BarChart": ("bar chart", "column chart", "bar"),
    "PieChart": ("pie chart", "pie"),
    "ComboChart": ("combo chart", "combined chart", "bar and line"),
    "ScrapRateDonut": ("donut chart", "ring chart", "gauge"),
    "ReworkRateDonut": ("donut chart", "ring chart", "gauge"),
}


def _contains_any(text: str, keywords: tuple[str, ...]) -> bool:
    return any(keyword in text for keyword in keywords)


def _extract_metrics_from_text(text: str) -> list[str]:
    metrics: list[str] = []
    for metric, keywords in METRIC_KEYWORDS.items():
        if _contains_any(text, keywords):
            metrics.append(metric)
    return metrics


def _extract_component_from_text(text: str, metrics: list[str]) -> str | None:
    for component_type, keywords in COMPONENT_KEYWORDS.items():
        if not _contains_any(text, keywords):
            continue
        if component_type in ("ScrapRateDonut", "ReworkRateDonut"):
            if "ReworkRate" in metrics:
                return "ReworkRateDonut"
            return "ScrapRateDonut"
        return component_type
    return None


def _extract_time_range_from_text(text: str) -> str | None:
    if "today" in text:
        return "today"
    if re.search(r"\b7\s*(d|day|days)\b", text):
        return "7d"
    if re.search(r"\b30\s*(d|day|days)\b", text):
        return "30d"
    if re.search(r"\b90\s*(d|day|days)\b", text):
        return "90d"
    if "custom" in text:
        return "custom"
    return None


def _extract_metric_action_from_text(text: str, has_metrics: bool) -> str | None:
    if any(token in text for token in ("add", "also")):
        return "add"
    if any(token in text for token in ("remove", "delete", "drop")):
        return "remove"
    if any(token in text for token in ("replace", "switch", "instead")) and has_metrics:
        return "replace"
    return "replace" if has_metrics else None


def fallback_extract_requirements(message: str, state: dict[str, Any]) -> dict[str, Any]:
    text = message.strip().lower()
    metrics = _extract_metrics_from_text(text)
    component_type = _extract_component_from_text(text, metrics)
    time_range = _extract_time_range_from_text(text)

    focused_metric = get_focused_metric(state)
    target_metrics = metrics[:]
    if component_type and not target_metrics and focused_metric in KNOWN_METRICS:
        target_metrics = [focused_metric]

    extracted: dict[str, Any] = {
        "intent": "modify_dashboard" if state.get("requirements") else "create_dashboard",
    }

    metric_action = _extract_metric_action_from_text(text, bool(metrics))
    if metric_action:
        extracted["metricAction"] = metric_action
    if metrics:
        extracted["metrics"] = metrics
    if time_range:
        extracted["timeRange"] = time_range
    if component_type and target_metrics:
        extracted["componentOverrides"] = {
            metric: component_type
            for metric in target_metrics
            if metric in KNOWN_METRICS and component_type in KNOWN_COMPONENTS
        }

    return extracted


def resolve_implicit_targets(extracted: dict[str, Any], message: str, state: dict[str, Any]) -> dict[str, Any]:
    text = message.strip().lower()
    metrics = [
        metric for metric in extracted.get("metrics", [])
        if metric in KNOWN_METRICS
    ]
    component_type = _extract_component_from_text(text, metrics)
    if not component_type:
        return extracted

    component_overrides = extracted.get("componentOverrides") or {}
    if component_overrides:
        return extracted

    target_metrics = metrics[:]
    focused_metric = get_focused_metric(state)
    if not target_metrics and focused_metric in KNOWN_METRICS:
        target_metrics = [focused_metric]

    if target_metrics:
        extracted = dict(extracted)
        extracted["componentOverrides"] = {
            metric: component_type
            for metric in target_metrics
            if component_type in KNOWN_COMPONENTS
        }

    return extracted


def call_llm_extract_requirements(
    client: Any,
    message: str,
    state: dict[str, Any],
    model: str = "deepseek-chat",
) -> dict[str, Any]:
    previous_requirements = state.get("requirements") or {}
    recent_messages = (state.get("messages") or [])[-6:]

    user_payload = {
        "message": message,
        "previousRequirements": previous_requirements,
        "recentMessages": recent_messages,
    }

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
        ],
        response_format={"type": "json_object"},
        temperature=0,
        max_tokens=1000,
    )

    content = response.choices[0].message.content
    return json.loads(content)

from __future__ import annotations

from typing import Any, Callable

from .catalog import SUPPORTED_COMPONENTS_BY_METRIC
from .business_rules import validate_requirements, validate_ui_business
from .defaults import apply_default_rules, check_missing_fields, merge_requirements
from .extraction import call_llm_extract_requirements, fallback_extract_requirements, resolve_implicit_targets
from .mapping import requirements_to_ui_config
from .state import append_message, get_or_create_session, update_focus


SchemaValidator = Callable[[dict[str, Any]], tuple[bool, list[dict[str, Any]]]]


def handle_chat_ui(
    *,
    client: Any,
    session_id: str | None,
    message: str,
    validate_ui_schema: SchemaValidator,
) -> dict[str, Any]:
    resolved_session_id, state = get_or_create_session(session_id)
    append_message(state, "user", message)

    try:
        extracted = call_llm_extract_requirements(client, message, state)
    except Exception as exc:
        extracted = fallback_extract_requirements(message, state)
        extracted["extractionWarning"] = f"LLM extraction failed, used keyword fallback: {exc}"

    extracted = resolve_implicit_targets(extracted, message, state)

    merged = merge_requirements(state.get("requirements") or {}, extracted)
    resolved = apply_default_rules(merged)

    missing_fields = check_missing_fields(resolved)
    state["requirements"] = resolved

    if missing_fields:
        question = missing_fields[0]["question"]
        append_message(state, "assistant", question)
        return {
            "ok": True,
            "sessionId": resolved_session_id,
            "status": "need_clarification",
            "question": question,
            "missingFields": missing_fields,
            "requirements": resolved,
        }

    requirement_errors = validate_requirements(resolved)
    if requirement_errors:
        component_errors = [
            error for error in requirement_errors
            if "cannot be displayed as" in error and "Supported components:" in error
        ]
        if component_errors:
            question = _build_component_clarification(component_errors[0], resolved)
            append_message(state, "assistant", question)
            return {
                "ok": True,
                "sessionId": resolved_session_id,
                "status": "need_clarification",
                "question": question,
                "errors": requirement_errors,
                "requirements": resolved,
            }
        return {
            "ok": False,
            "sessionId": resolved_session_id,
            "status": "invalid_requirements",
            "errors": requirement_errors,
            "requirements": resolved,
        }

    ui_config = requirements_to_ui_config(resolved)

    schema_ok, schema_errors = validate_ui_schema(ui_config)
    if not schema_ok:
        return {
            "ok": False,
            "sessionId": resolved_session_id,
            "status": "schema_invalid",
            "errors": schema_errors,
            "requirements": resolved,
            "uiConfig": ui_config,
        }

    business_errors = validate_ui_business(ui_config)
    if business_errors:
        return {
            "ok": False,
            "sessionId": resolved_session_id,
            "status": "business_invalid",
            "errors": business_errors,
            "requirements": resolved,
            "uiConfig": ui_config,
        }

    state["lastUiConfig"] = ui_config
    update_focus(state, resolved)
    append_message(state, "assistant", "Generated a dashboard configuration.")

    return {
        "ok": True,
        "sessionId": resolved_session_id,
        "status": "ready",
        "requirements": resolved,
        "uiConfig": ui_config,
    }


def _build_component_clarification(error: str, requirements: dict[str, Any]) -> str:
    component_overrides = requirements.get("componentOverrides") or {}
    for metric, component_type in component_overrides.items():
        supported_components = SUPPORTED_COMPONENTS_BY_METRIC.get(metric)
        if supported_components and component_type not in supported_components:
            supported = ", ".join(sorted(supported_components))
            return (
                f"{metric} cannot be displayed as {component_type}. "
                f"Supported components are: {supported}. Which one would you like to use?"
            )
    return error

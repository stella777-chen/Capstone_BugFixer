# Multi-turn Dashboard Conversation Product Guide

## 1. Product Goal

The multi-turn conversation feature lets users build and refine a MOM/WIP dashboard through natural language.

Instead of asking the user to provide a full UI JSON configuration, the system supports a conversational flow:

```text
User message
  -> extract dashboard requirements
  -> merge with previous conversation context
  -> apply defaults
  -> validate business rules
  -> generate UI config
  -> validate schema
  -> return UI config or clarification question
```

The user experience goal is:

- Users only need to describe what they want to monitor.
- The system remembers previous turns within a session.
- The system can update an existing dashboard instead of rebuilding from scratch.
- The system asks follow-up questions only when required information is missing.
- The final output remains schema-valid and safe for frontend rendering.

## 2. Entry Point

The backend exposes a multi-turn endpoint:

```http
POST /chat-ui
```

Request:

```json
{
  "sessionId": "optional-existing-session-id",
  "message": "show scrap rate and yield for the last 30 days"
}
```

Response can be one of:

```json
{
  "ok": true,
  "sessionId": "...",
  "status": "ready",
  "requirements": {},
  "uiConfig": {}
}
```

or:

```json
{
  "ok": true,
  "sessionId": "...",
  "status": "need_clarification",
  "question": "Which metric do you want to see?",
  "requirements": {}
}
```

or an invalid/error state:

```json
{
  "ok": false,
  "sessionId": "...",
  "status": "invalid_requirements",
  "errors": []
}
```

## 3. Supported User Capabilities

### 3.1 Create A New Dashboard

Users can ask for one or more supported metrics.

Examples:

```text
Show scrap rate for the last 30 days.
```

```text
Create a dashboard for scrap rate and yield.
```

```text
Show lot status and WIP aging.
```

Behavior:

- The system extracts metrics from the message.
- If no time range is specified, it defaults to `30d`.
- It maps metrics to default chart components.
- It generates a schema-valid `MesPage` UI config.

### 3.2 Continue From Previous Context

The system stores conversation state by `sessionId`.

The session stores:

- recent messages
- merged requirements
- last generated UI config
- last focused metric

This allows follow-up prompts such as:

```text
Change it to the last 7 days.
```

```text
Make that chart a bar chart.
```

```text
Also add yield.
```

### 3.3 Change Time Range

Users can update the time range after a dashboard has been created.

Supported time ranges:

| User intent | Query value |
| --- | --- |
| today | `today` |
| last 7 days | `7d` |
| last 30 days | `30d` |
| last 90 days | `90d` |
| custom date range | `custom` with `start` and `end` |

Examples:

```text
Change it to last 7 days.
```

```text
Use today instead.
```

```text
Use a custom range from 2026-05-01 to 2026-05-10.
```

Behavior:

- Non-custom time ranges replace the previous time range.
- For `custom`, the system requires both `start` and `end`.
- If either custom date is missing, the system returns `need_clarification`.

### 3.4 Add Metrics

Users can add another metric without losing the previous dashboard.

Example:

```text
Also add yield.
```

Expected behavior:

- Previous metrics are preserved.
- New metric is appended if supported.
- Duplicate metrics are ignored.

Example state transition:

```json
{
  "metrics": ["ScrapRate"]
}
```

plus:

```text
Also add yield.
```

becomes:

```json
{
  "metrics": ["ScrapRate", "YieldRate"]
}
```

### 3.5 Remove Metrics

Users can remove a metric from the current dashboard.

Examples:

```text
Remove scrap rate.
```

```text
Drop the yield chart.
```

Behavior:

- The specified metric is removed from `requirements.metrics`.
- Related chart type overrides are also removed.
- The dashboard is regenerated using the remaining metrics.

If no metrics remain, the system asks which metric the user wants to see.

### 3.6 Replace Metrics

Users can replace the current dashboard metric set.

Examples:

```text
Switch to defects.
```

```text
Replace this with WIP aging.
```

Behavior:

- Existing metrics are replaced by the new metrics.
- Defaults are applied again.
- The resulting dashboard is regenerated.

### 3.7 Choose Chart Type

Users can request a chart type when it is compatible with the metric.

Examples:

```text
Show yield as a bar chart.
```

```text
Make lot status a bar chart.
```

```text
Use a pie chart for defects.
```

Behavior:

- The system stores the request in `componentOverrides`.
- The mapping layer prefers the user-selected component when compatible.
- If no chart type is requested, the default component is used.

Supported metric-to-chart options:

| Metric | Default component | Supported components |
| --- | --- | --- |
| `ScrapRate` | `ScrapRateDonut` | `ScrapRateDonut` |
| `ReworkRate` | `ReworkRateDonut` | `ReworkRateDonut` |
| `YieldRate` | `LineChart` | `LineChart`, `BarChart` |
| `LotStatusDistribution` | `PieChart` | `PieChart`, `BarChart` |
| `WipAgingDistribution` | `BarChart` | `BarChart`, `PieChart` |
| `DefectDistribution` | `ComboChart` | `ComboChart`, `BarChart`, `PieChart` |

If a user asks for an incompatible chart type, the system returns a clarification question.

Example:

```text
Show scrap rate as a pie chart.
```

Response behavior:

```text
ScrapRate cannot be displayed as PieChart. Supported components are: ScrapRateDonut. Which one would you like to use?
```

### 3.8 Refer To The Previous Chart

Users can refer to the last focused metric without naming it again.

Examples:

```text
Make that chart a bar chart.
```

```text
Change the previous chart to a pie chart.
```

Behavior:

- If the session has a single metric or a known `lastFocusedMetric`, the system uses that metric as the target.
- If the target is ambiguous, the system may need a clarification.

Current focus logic:

- If the current requirements contain exactly one metric, that metric becomes the focused metric.
- Follow-up chart changes can target this focused metric.

### 3.9 Visual Styling Overrides

Users can request color or style changes.

Examples:

```text
Make the bar chart orange.
```

```text
Use red for the donut fill.
```

Behavior:

- Color fields are optional.
- If the user does not request styling, the frontend default theme is used.
- If the user requests styling, the system stores it in `visualOverrides`.

Supported UI color override fields include:

- `barColor`
- `lineColor`
- `pieFallbackColor`
- `filledColor`
- `backgroundColor`
- `color`
- `colorField`

Design principle:

```text
Data fields are required.
Style fields are optional.
```

### 3.10 Ask Clarifying Questions

The system asks follow-up questions when a required requirement cannot be inferred or defaulted.

Current clarification cases:

| Missing or invalid information | System behavior |
| --- | --- |
| No metric detected | Ask which metric the user wants |
| `custom` time range without `start` | Ask for start date |
| `custom` time range without `end` | Ask for end date |
| Incompatible chart type | Ask user to choose from supported components |

Example:

```text
Build me a dashboard.
```

Response:

```text
Which metric do you want to see: scrap rate, rework rate, yield, lot status, WIP aging, or defects?
```

## 4. Supported Metrics

| Metric | User meaning | Returned data shape |
| --- | --- | --- |
| `ScrapRate` | Scrap rate KPI | `data.value`, `data.wipCount` |
| `ReworkRate` | Rework rate KPI | `data.value`, `data.wip` |
| `YieldRate` | Yield KPI or grouped yield trend | `data.value` or `data.rows` |
| `DefectDistribution` | Defect distribution by defect code | `data.rows` |
| `WipAgingDistribution` | WIP aging distribution by aging bucket | `data.rows` |
| `LotStatusDistribution` | Lot count distribution by status | `data.rows` |

## 5. Supported Dimensions

`dimension` means how the data is grouped.

| Dimension | Meaning |
| --- | --- |
| `line` | Group by production line |
| `date` | Group by date |
| `defect_type` | Group by defect type |
| `aging_bucket` | Group by WIP aging bucket |
| `lot_status` | Group by lot status |

Metric-to-dimension support:

| Metric | Dimension support |
| --- | --- |
| `ScrapRate` | No dimension; KPI only |
| `ReworkRate` | No dimension; KPI only |
| `YieldRate` | `line` or `date` |
| `DefectDistribution` | Fixed `defect_type` |
| `WipAgingDistribution` | Fixed `aging_bucket` |
| `LotStatusDistribution` | Fixed `lot_status` |

## 6. Defaults

The system defaults information that users should not need to provide manually.

| Field | Default behavior |
| --- | --- |
| `timeRange` | Defaults to `30d` when metric exists |
| `YieldRate.dimension` | Defaults to `line` |
| `DefectDistribution.dimension` | Defaults to `defect_type` |
| `WipAgingDistribution.dimension` | Defaults to `aging_bucket` |
| `LotStatusDistribution.dimension` | Defaults to `lot_status` |
| dashboard `title` | Defaults to `MOM Dashboard` |
| query keys | Generated automatically, e.g. `q_scrap`, `q_yield` |
| component titles | Generated from metric |
| component descriptions | Generated from metric |
| data bindings | Generated from metric and component |
| colors | Omitted unless explicitly requested |

## 7. Output UI Components

The generated UI config uses `ui-config-v4.json`.

Supported component types:

- `ScrapRateDonut`
- `ReworkRateDonut`
- `LineChart`
- `PieChart`
- `BarChart`
- `ComboChart`
- `DataTable`

Current product behavior:

- `DataTable` is schema-supported.
- The multi-turn mapper does not generate `DataTable` by default because `query-api-v1.json` does not currently expose a production status table metric for it.

Required UI data fields:

| Component | Required data fields |
| --- | --- |
| `ScrapRateDonut` | `rate`, `count` |
| `ReworkRateDonut` | `rate`, `count` |
| `LineChart` | `chartData` |
| `PieChart` | `chartData` |
| `BarChart` | `chartData` |
| `ComboChart` | `chartData` |
| `DataTable` | `values` |

This prevents the frontend from rendering empty components.

## 8. Example Conversations

### 8.1 Create, Then Change Time Range

User:

```text
Show scrap rate.
```

System:

```text
Generates ScrapRateDonut using default timeRange 30d.
```

User:

```text
Change it to 7 days.
```

System:

```text
Keeps ScrapRate, changes timeRange to 7d, regenerates UI config.
```

### 8.2 Add Another Metric

User:

```text
Show scrap rate.
```

System:

```text
Generates ScrapRateDonut.
```

User:

```text
Also add yield.
```

System:

```text
Keeps ScrapRateDonut and adds YieldRate as LineChart.
```

### 8.3 Change Chart Type

User:

```text
Show yield.
```

System:

```text
Generates YieldRate as LineChart.
```

User:

```text
Make that chart a bar chart.
```

System:

```text
Uses lastFocusedMetric = YieldRate and regenerates it as BarChart.
```

### 8.4 Incompatible Chart Type

User:

```text
Show scrap rate as pie chart.
```

System:

```text
Asks the user to choose a compatible component because ScrapRate supports only ScrapRateDonut.
```

### 8.5 Replace Dashboard

User:

```text
Show scrap rate and yield.
```

System:

```text
Generates two components.
```

User:

```text
Switch to defects.
```

System:

```text
Replaces existing metrics with DefectDistribution and generates ComboChart.
```

## 9. Current Limitations

The current implementation supports the main multi-turn dashboard workflow, but these areas remain limited:

- Session state is stored in memory and is lost when the backend restarts.
- Frontend must pass `sessionId` to fully use multi-turn context.
- Keyword fallback is English-only; Chinese user messages rely mainly on LLM extraction.
- Ambiguous references like "change the second chart" are not fully supported yet.
- DataTable generation is not enabled by default.
- Query execution is still performed separately after UI config generation.
- The backend does not yet persist conversation history to a database.

## 10. Product Summary

Users can currently:

- Create a dashboard from natural language.
- Ask for supported MOM/WIP metrics.
- Use default time ranges and dimensions without specifying them.
- Update time range in a follow-up message.
- Add metrics in a follow-up message.
- Remove metrics in a follow-up message.
- Replace the dashboard metric set.
- Choose compatible chart types.
- Refer to the previous chart when the target is clear.
- Request visual styling overrides.
- Receive clarification questions when required information is missing or incompatible.

The system keeps the user-facing workflow flexible while keeping the backend output controlled by schema validation and business rules.

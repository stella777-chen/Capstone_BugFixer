# Query API Spec

This document describes the `/query` API used by the frontend to fetch dashboard data.

## Overview

- Method: `POST`
- Path: `/query`
- Content-Type: `application/json`

Purpose:

- Receive a semantic metric query from the frontend
- Validate the request against `query-v1.json`
- Query MySQL data from `wip_dashboard`
- Return normalized JSON for KPI cards, tables, and chart-like distributions

## Base URL

For local development:

```text
http://127.0.0.1:8000
```

Example full endpoint:

```text
POST http://127.0.0.1:8000/query
```

## Request Body

### Common shape

```json
{
  "metric": "ScrapRate",
  "timeRange": "7d",
  "dimension": "line",
  "start": "2026-04-01T00:00:00",
  "end": "2026-04-10T23:59:59"
}
```

### Fields

- `metric`: required, target metric name
- `timeRange`: required, requested time window
- `dimension`: optional, only supported by some metrics
- `start`: required only when `timeRange = "custom"`
- `end`: required only when `timeRange = "custom"`

## Supported Metrics

- `ScrapRate`
- `ReworkRate`
- `YieldRate`
- `DefectDistribution`
- `WipAgingDistribution`
- `LotStatusDistribution`

## Supported Time Ranges

- `today`
- `7d`
- `30d`
- `90d`
- `custom`

## Supported Dimensions

- `line`
- `date`
- `defect_type`
- `aging_bucket`
- `lot_status`

Not every metric supports every dimension. See per-metric details below.

## Response Format

### Success

```json
{
  "ok": true,
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "ok": false,
  "errors": ["error message"],
  "data": null
}
```

## Frontend Binding Rule

### KPI metrics

Frontend reads:

```text
data.value
```

### Table / distribution metrics

Frontend reads:

```text
data.rows
```

## Metric Details

---

## 1. ScrapRate

### Description

Returns scrap rate KPI and supporting WIP count.

### Supported timeRange

- `7d`
- `30d`
- `90d`
- `custom`

### Supported dimension

- none

### Response type

- KPI

### Example request

```json
{
  "metric": "ScrapRate",
  "timeRange": "7d"
}
```

### Example response

```json
{
  "ok": true,
  "data": {
    "value": 2.13,
    "wipCount": 105
  },
  "meta": {
    "timeRange": "7d"
  }
}
```

---

## 2. ReworkRate

### Description

Returns rework rate KPI and supporting WIP count.

### Supported timeRange

- `today`
- `7d`
- `30d`
- `custom`

### Supported dimension

- none

### Response type

- KPI

### Example request

```json
{
  "metric": "ReworkRate",
  "timeRange": "today"
}
```

### Example response

```json
{
  "ok": true,
  "data": {
    "value": 1.5,
    "wip": 148
  },
  "meta": {
    "timeRange": "today"
  }
}
```

---

## 3. YieldRate

### Description

Supports both KPI mode and grouped mode.

### Supported timeRange

- `today`
- `7d`
- `30d`
- `90d`
- `custom`

### Supported dimension

- `line`
- `date`

### Response type

- no `dimension`: KPI
- `dimension = line` or `date`: rows

### Example request (KPI)

```json
{
  "metric": "YieldRate",
  "timeRange": "today"
}
```

### Example response (KPI)

```json
{
  "ok": true,
  "data": {
    "value": 68.4
  },
  "meta": {
    "timeRange": "today"
  }
}
```

### Example request (grouped by line)

```json
{
  "metric": "YieldRate",
  "timeRange": "7d",
  "dimension": "line"
}
```

### Example response (grouped by line)

```json
{
  "ok": true,
  "data": {
    "rows": [
      { "line": "Line A", "yield": 79.43 },
      { "line": "Line B", "yield": 77.71 },
      { "line": "Line C", "yield": 71.86 }
    ]
  },
  "meta": {
    "timeRange": "7d",
    "dimension": "line"
  }
}
```

### Example request (grouped by date)

```json
{
  "metric": "YieldRate",
  "timeRange": "30d",
  "dimension": "date"
}
```

---

## 4. DefectDistribution

### Description

Returns defect distribution rows for frontend tables or charts.

### Supported timeRange

- `today`
- `7d`
- `30d`
- `custom`

### Supported dimension

- fixed internally as `defect_type`

### Response type

- rows

### Example request

```json
{
  "metric": "DefectDistribution",
  "timeRange": "30d"
}
```

### Example response

```json
{
  "ok": true,
  "data": {
    "rows": [
      {
        "defectCode": "Scratch",
        "defectCount": 333,
        "totalDefectPercentage": 4.09
      },
      {
        "defectCode": "Warp",
        "defectCount": 270,
        "totalDefectPercentage": 3.54
      }
    ]
  },
  "meta": {
    "timeRange": "30d",
    "dimension": "defect_type"
  }
}
```

### Note

`90d` is currently not supported for this metric in the current dataset/query logic.

---

## 5. WipAgingDistribution

### Description

Returns WIP aging bucket distribution.

### Supported timeRange

- `today`
- `7d`
- `30d`
- `90d`
- `custom`

### Supported dimension

- fixed internally as `aging_bucket`

### Response type

- rows

### Example request

```json
{
  "metric": "WipAgingDistribution",
  "timeRange": "7d"
}
```

### Example response

```json
{
  "ok": true,
  "data": {
    "rows": [
      { "agingBucket": "1-3", "lotCount": 250 },
      { "agingBucket": "4-7", "lotCount": 445 },
      { "agingBucket": "8-11", "lotCount": 426 }
    ]
  },
  "meta": {
    "timeRange": "7d",
    "dimension": "aging_bucket"
  }
}
```

---

## 6. LotStatusDistribution

### Description

Returns lot status rows by date with week and month reference dates.

### Supported timeRange

- `today`
- `7d`
- `30d`
- `90d`
- `custom`

### Supported dimension

- fixed internally as `lot_status`

### Response type

- rows

### Example request

```json
{
  "metric": "LotStatusDistribution",
  "timeRange": "today"
}
```

### Example response

```json
{
  "ok": true,
  "data": {
    "rows": [
      {
        "date": "2026-04-10 00:00:00",
        "weekStartDate": "2026-04-06 00:00:00",
        "monthStartDate": "2026-04-01 00:00:00",
        "status": "NotStarted",
        "lotCount": 21
      },
      {
        "date": "2026-04-10 00:00:00",
        "weekStartDate": "2026-04-06 00:00:00",
        "monthStartDate": "2026-04-01 00:00:00",
        "status": "WorkInProcess",
        "lotCount": 36
      }
    ]
  },
  "meta": {
    "timeRange": "today",
    "dimension": "lot_status"
  }
}
```

### Note

This endpoint returns row-level status data, not a single aggregated total.

## Validation Rules

- `metric` and `timeRange` are required
- if `timeRange = "custom"`, both `start` and `end` are required
- unsupported metric/timeRange/dimension combinations return:

```json
{
  "ok": false,
  "errors": ["..."],
  "data": null
}
```

## Recommended Smoke Tests

```json
{"metric":"ScrapRate","timeRange":"7d"}
{"metric":"ReworkRate","timeRange":"today"}
{"metric":"YieldRate","timeRange":"today"}
{"metric":"YieldRate","timeRange":"7d","dimension":"line"}
{"metric":"DefectDistribution","timeRange":"30d"}
{"metric":"WipAgingDistribution","timeRange":"7d"}
{"metric":"LotStatusDistribution","timeRange":"today"}
```

## Notes for Frontend

- KPI cards should read from `data.value`
- table/chart components should read from `data.rows`
- `YieldRate` has two modes:
  - KPI mode without `dimension`
  - grouped mode with `dimension = line` or `date`
- `LotStatusDistribution` rows can be rendered directly as a table, or grouped by `date` on the frontend if needed

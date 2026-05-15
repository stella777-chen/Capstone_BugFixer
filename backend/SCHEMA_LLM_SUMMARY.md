# Schema 与 LLM 模块说明

本文档总结我负责的后端 schema 和 LLM 生成 UI 部分，重点说明代码组成、数据流，以及为什么这样设计。

## 1. 代码组成

### 1.1 Schema 文件

主要文件位于 `backend/schemas/`：

- `ui-config-v4.json`
  - 定义 LLM 最终要生成的页面配置结构。
  - 顶层结构固定为 `MesPage`，包含 `title`、`queries`、`children`。
  - `children` 支持当前 WIP Dashboard 中使用的组件类型：`ScrapRateDonut`、`ReworkRateDonut`、`LineChart`、`PieChart`、`BarChart`、`ComboChart`、`DataTable`。
  - 组件数据可以直接写静态数组，也可以通过 `queryKey` + `path` 引用后端查询结果。

- `query-api-v1.json`
  - 定义前端/LLM 可以请求的数据指标。
  - 使用语义化字段，比如 `metric`、`timeRange`、`dimension`，而不是让 LLM 直接生成 SQL。
  - 目前支持的指标包括 `ScrapRate`、`ReworkRate`、`YieldRate`、`DefectDistribution`、`WipAgingDistribution`、`LotStatusDistribution`。

- `query-db-v1.json` / `query-db-v2.json`
  - 是更贴近数据库字段的查询 schema。
  - 里面列出了真实数据库表名、字段名、可聚合字段、可过滤字段和排序字段。
  - 这部分用于约束查询设计，避免出现数据库里不存在的字段。

- `ui-config-v1.json` 到 `ui-config-v4.json`
  - 体现了 schema 的迭代过程。
  - 早期版本更偏 mock 和基础卡片，后续逐步改成真实 WIP Dashboard 组件，并增加了查询绑定能力。

### 1.2 LLM 与接口文件

主要逻辑在 `backend/app3.py`：

- `/generate-ui`
  - 接收用户自然语言 prompt。
  - 调用 DeepSeek/OpenAI-compatible API。
  - 要求模型只输出 JSON，不输出解释或 Markdown。
  - 生成后会立刻使用 `ui-config-v4.json` 做严格校验。

- `/validate/ui`
  - 单独校验 UIConfig 是否符合 schema。
  - 方便调试 LLM 输出和前端生成结果。

- `/query`
  - 接收符合 `query-api-v1.json` 的语义查询。
  - 根据 `metric` 调用对应的数据查询函数。
  - 查询 MySQL 中的 `wip_dashboard` 数据库。
  - 统一返回前端容易绑定的格式：KPI 类返回 `data.value`，图表/分布类返回 `data.rows`。

- `call_llm_generate_ui`
  - 内部写了系统提示词，明确告诉 LLM：
    - 只能生成 schema 支持的字段。
    - 只能使用后端支持的 metric/timeRange/dimension。
    - 每个 UI 组件必须引用一个已有 query。
    - 每个 query 必须被组件使用，避免生成无效配置。

### 1.3 多轮状态辅助

`backend/orchestrator/state.py` 提供简单的会话状态管理：

- `SESSIONS` 保存不同 session 的上下文。
- 每个 session 保存：
  - `messages`：历史对话。
  - `requirements`：用户需求。
  - `lastUiConfig`：上一次生成的 UI 配置。

这个模块为后续多轮修改 UI 做准备，比如用户说“把刚才那个图换成柱状图”时，可以基于上一次结果继续修改。

## 2. 数据流

整体流程如下：

1. 用户在前端输入自然语言需求。
2. 前端调用后端 `/generate-ui`。
3. LLM 根据系统提示词生成 UIConfig JSON。
4. 后端用 `ui-config-v4.json` 校验 UIConfig。
5. 前端读取 UIConfig 中的 `queries`，逐个调用 `/query`。
6. `/query` 根据 `metric` 查询 MySQL。
7. 前端根据 `queryKey` 和 `path` 把查询结果注入到对应组件。

例如：

- `ScrapRateDonut.rate` 绑定 `data.value`。
- `ScrapRateDonut.count` 绑定 `data.wipCount`。
- `BarChart.chartData` 绑定 `data.rows`，并用 `agingBucket` 作为名称、`lotCount` 作为数值。
- `ComboChart.chartData` 绑定缺陷分布数据，用 `defectCode`、`defectCount`、`totalDefectPercentage` 显示柱线组合图。

## 3. 这样设计的依据

### 3.1 匹配真实数据库结构

schema 和查询逻辑是按 `wip_dashboard` 数据库设计的。数据库结构在 `sqldashboard/wip_dashboard.sql` 中，包括：

- `wip_scrap_rate`
  - 字段：`filter_type`、`scrap`、`wip_count`、`record_date`
  - 对应 `ScrapRate`

- `wip_rework_rate`
  - 字段：`filter_type`、`rework`、`wip`、`record_date`
  - 对应 `ReworkRate`

- `wip_yield_summary`
  - 字段：`filter_type`、`production_line_code`、`total_yield`、`record_date`
  - 对应 `YieldRate`

- `wip_defect_rate`
  - 字段：`defect_code`、`defect_count`、`total_defect_percentage`
  - 对应 `DefectDistribution`

- `wip_aging_bucket`
  - 字段：`aging_bucket`、`lot_count`
  - 对应 `WipAgingDistribution`

- `wip_lot_status`
  - 字段：`status`、`lot_count`、`date`、`week_start_date`、`month_start_date`
  - 对应 `LotStatusDistribution`

因此 schema 里的 metric、dimension、字段绑定不是随便定义的，而是根据真实表和字段映射出来的。

### 3.2 避免让 LLM 直接写 SQL

LLM 只生成语义查询：

```json
{
  "metric": "ScrapRate",
  "timeRange": "30d"
}
```

后端再把它转换成固定 SQL 查询。这样做有几个好处：

- 更安全，不让 LLM 直接拼 SQL。
- 更稳定，避免字段名、表名幻觉。
- 更容易校验，所有 metric 和 timeRange 都在 schema 里枚举。
- 更适合前端，返回结构统一。

### 3.3 匹配前端组件需要的数据形状

前端组件需要的数据字段比较固定：

- Donut 类组件需要 `rate` 和 `count`。
- LineChart 需要 `{ name, yield }`。
- PieChart 需要 `{ legend, data }`。
- BarChart 需要 `{ name, value }`。
- ComboChart 需要 `{ name, barValue, lineValue }`。

所以 `ui-config-v4.json` 允许两种写法：

- 直接给静态数据，方便 mock 和预览。
- 通过 `queryKey`、`path`、`labelField/valueField` 等字段绑定真实接口结果。

这样前端既可以用 mock 数据快速展示，也可以接入真实数据库查询结果。

### 3.4 用 schema 控制 LLM 输出边界

LLM 输出不稳定，所以后端做了两层控制：

1. 系统提示词限制：
   - 只能输出 JSON。
   - 只能使用允许的组件类型。
   - 只能使用允许的 metric 和 dimension。
   - 不允许输出 SQL、未知字段或多余解释。

2. JSON Schema 校验：
   - `additionalProperties: false` 禁止多余字段。
   - `required` 确保必要字段存在。
   - `enum` 限制 metric、timeRange、dimension。
   - `oneOf/allOf/if/then` 控制不同组件和不同查询类型的合法组合。

这保证了即使 LLM 偶尔输出错误，后端也能拦截，而不是把错误配置传给前端。

## 4. 当前支持的组件与指标映射

| 用户想看的内容 | Query metric | UI 组件 | 数据来源 |
| --- | --- | --- | --- |
| 报废率 | `ScrapRate` | `ScrapRateDonut` | `wip_scrap_rate.scrap`, `wip_scrap_rate.wip_count` |
| 返工率 | `ReworkRate` | `ReworkRateDonut` | `wip_rework_rate.rework`, `wip_rework_rate.wip` |
| 良率趋势/按线体 | `YieldRate` | `LineChart` | `wip_yield_summary.total_yield` |
| Lot 状态分布 | `LotStatusDistribution` | `PieChart` | `wip_lot_status.status`, `wip_lot_status.lot_count` |
| WIP Aging | `WipAgingDistribution` | `BarChart` | `wip_aging_bucket.aging_bucket`, `wip_aging_bucket.lot_count` |
| 缺陷分布 | `DefectDistribution` | `ComboChart` | `wip_defect_rate.defect_count`, `wip_defect_rate.total_defect_percentage` |

## 5. 总结

这部分代码的核心目标是把“用户自然语言需求”稳定转换成“前端可渲染、后端可查询、数据库字段真实存在”的 UI 配置。

整体设计可以概括为：

- schema 负责定义边界。
- LLM 负责把自然语言转换成 JSON。
- 后端接口负责校验和查询真实数据。
- 数据库结构决定 metric、dimension 和字段映射。
- 前端组件的数据需求决定 UIConfig 中的绑定方式。

因此，这套实现不是单纯让 LLM 随机生成页面，而是通过 schema、prompt、查询 API 和真实数据库表结构共同约束，保证生成结果能落到真实业务数据和真实组件上。

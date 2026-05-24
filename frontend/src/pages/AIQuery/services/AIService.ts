type QueryMetricV1 =
  | "ScrapRate"
  | "ReworkRate"
  | "YieldRate"
  | "DefectDistribution"
  | "WipAgingDistribution"
  | "LotStatusDistribution";

type QueryTimeRangeV1 = "today" | "7d" | "30d" | "90d" | "custom";
type QueryDimensionV1 = "line" | "date" | "defect_type" | "aging_bucket" | "lot_status";
type QueryDirectionV1 = "asc" | "desc";
type QueryFilterOpV1 = "=" | "!=" | "in" | ">" | ">=" | "<" | "<=" | "between" | "contains";

type QueryAPIV1 = {
  metric: QueryMetricV1;
  timeRange: QueryTimeRangeV1;
  dimension?: QueryDimensionV1;
  start?: string;
  end?: string;
  limit?: number;
  page?: number;
  pageSize?: number;
  orderBy?: Array<{ field: string; direction: QueryDirectionV1 }>;
  filters?: Array<{ field: string; op: QueryFilterOpV1; value: string | number | boolean | unknown[] }>;
};

type ValueRefV1 = {
  queryKey: string;
  path?: string;
  fallback?: string | number | null;
};

type DataRefBaseV1 = {
  queryKey: string;
  path?: string;
};

type PieChartDataRefV1 = DataRefBaseV1 & {
  labelField: string;
  valueField: string;
  colorField?: string;
};

type BarChartDataRefV1 = DataRefBaseV1 & {
  nameField: string;
  valueField: string;
};

type LineChartDataRefV1 = DataRefBaseV1 & {
  nameField: string;
  yieldField: string;
};

type ComboChartDataRefV1 = DataRefBaseV1 & {
  nameField: string;
  barField: string;
  lineField: string;
};

type UIChildV4 = {
  type: string;
  [key: string]: unknown;
};

type UIConfigV4 = {
  type: "MesPage";
  title?: string;
  queries: Record<string, QueryAPIV1>;
  children: UIChildV4[];
};

type GenerateUIResponse = {
  ok: boolean;
  uiConfig?: UIConfigV4;
  errors?: Array<{ path?: unknown[]; message?: string } | string>;
};

type ChatUIResponse = {
  ok: boolean;
  sessionId?: string;
  status?: string;
  question?: string;
  requirements?: Record<string, unknown>;
  uiConfig?: UIConfigV4;
  errors?: Array<{ path?: unknown[]; message?: string } | string>;
};

type QueryResponse = {
  ok: boolean;
  data?: {
    value?: string | number | null;
    rows?: unknown[];
    [key: string]: unknown;
  } | null;
  meta?: Record<string, unknown>;
  errors?: Array<{ path?: unknown[]; message?: string } | string>;
};

type QueryExecutionResult = {
  queryKey: string;
  query: QueryAPIV1;
  response: QueryResponse;
};

type QueryValidationResult = {
  ok: boolean;
  normalized?: QueryAPIV1;
  error?: string;
  warnings?: string[];
};

const configuredBackendBaseUrl =
  typeof process !== "undefined" && process.env && typeof process.env.REACT_APP_BACKEND_BASE_URL === "string"
    ? process.env.REACT_APP_BACKEND_BASE_URL.trim().replace(/\/$/, "")
    : "";

const BACKEND_BASE_URL_CANDIDATES = [
  configuredBackendBaseUrl,
  "http://127.0.0.1:8001",
  "http://127.0.0.1:8000",
].filter((value, index, source) => Boolean(value) && source.indexOf(value) === index) as string[];
const HEALTH_CHECK_TIMEOUT_MS = 2500;

let cachedBackendBaseUrl: string | null = null;

export type BackendHealthDebug = {
  ok: boolean;
  statusCode: number | null;
  latencyMs: number | null;
  checkedAt: string;
  message: string;
};

export type PromptFlowDebug = {
  backendBaseUrl: string;
  generateUiStatusCode: number | null;
  generatedUiType: string | null;
  generatedComponentTypes: string[];
  queryKeys: string[];
  queryCalls: number;
  queryFailures: number;
  resolvedBindings: number;
  elapsedMs: number;
  lastError: string | null;
};

export type SendQueryDebugResult = {
  answer: string;
  health: BackendHealthDebug;
  flow: PromptFlowDebug;
  sessionId?: string;
  status?: string;
  requirements?: Record<string, unknown>;
  uiConfig?: UIConfigV4;
  resolvedChildren?: UIChildV4[];
  queryResults?: QueryExecutionResult[];
};

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function resolveBackendBaseUrl(timeoutMs: number): Promise<string> {
  if (cachedBackendBaseUrl) {
    return cachedBackendBaseUrl;
  }

  for (const candidate of BACKEND_BASE_URL_CANDIDATES) {
    try {
      const response = await fetchWithTimeout(`${candidate}/health`, { method: "GET" }, timeoutMs);
      if (response.ok) {
        cachedBackendBaseUrl = candidate;
        return candidate;
      }
    } catch {
      // Try next candidate.
    }
  }

  return BACKEND_BASE_URL_CANDIDATES[0];
}

function buildErrorMessage(prefix: string, errors?: Array<{ path?: unknown[]; message?: string } | string>): string {
  if (!errors || errors.length === 0) {
    return prefix;
  }

  const details = errors
    .map((error) => {
      if (typeof error === "string") {
        return error;
      }
      if (error.message) {
        return error.message;
      }
      return JSON.stringify(error);
    })
    .join("; ");

  return `${prefix}: ${details}`;
}

function summarizeQueryResult(queryKey: string, query: QueryAPIV1, response: QueryResponse): string {
  if (!response.ok) {
    const reason = response.errors && response.errors.length > 0
      ? buildErrorMessage("", response.errors).replace(/^:\s*/, "")
      : "unknown error";
    return `- ${queryKey} (${query.metric}): failed (${reason})`;
  }

  if (typeof response.data?.value !== "undefined") {
    return `- ${queryKey} (${query.metric}): value = ${String(response.data.value)}`;
  }

  if (Array.isArray(response.data?.rows)) {
    return `- ${queryKey} (${query.metric}): rows = ${response.data.rows.length}`;
  }

  return `- ${queryKey} (${query.metric}): returned data`;
}

function formatMetricLabel(metric: QueryMetricV1): string {
  switch (metric) {
    case "ScrapRate":
      return "Scrap Rate";
    case "ReworkRate":
      return "Rework Rate";
    case "YieldRate":
      return "Yield Rate";
    case "DefectDistribution":
      return "Defect Distribution";
    case "WipAgingDistribution":
      return "WIP Aging Distribution";
    case "LotStatusDistribution":
      return "Lot Status Distribution";
    default:
      return metric;
  }
}

function formatMetricValue(metric: QueryMetricV1, value: unknown): string {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  const rounded = Number(numericValue.toFixed(2));
  if (metric === "ScrapRate" || metric === "ReworkRate" || metric === "YieldRate") {
    return `${rounded}%`;
  }

  return String(rounded);
}

function buildUserAnswer(
  title: string | undefined,
  componentTypes: string[],
  queryResults: QueryExecutionResult[],
  queryNormalizationNotes: string[]
): string {
  const successful = queryResults.filter(({ response }) => response.ok);
  const failed = queryResults.filter(({ response }) => !response.ok);

  const sentences: string[] = [];

  if (title && title.trim()) {
    sentences.push(`${title.trim()} is ready.`);
  } else {
    sentences.push("Your dashboard is ready.");
  }

  if (componentTypes.length > 0) {
    sentences.push(`It includes ${componentTypes.join(", ")}.`);
  }

  const insights: string[] = [];
  for (const { query, response } of successful) {
    if (typeof response.data?.value !== "undefined") {
      insights.push(`${formatMetricLabel(query.metric)} is ${formatMetricValue(query.metric, response.data.value)}.`);
      continue;
    }

    if (Array.isArray(response.data?.rows)) {
      insights.push(`${formatMetricLabel(query.metric)} returned ${response.data.rows.length} records.`);
    }
  }

  if (insights.length > 0) {
    sentences.push(insights.join(" "));
  }

  if (failed.length > 0) {
    const failedMetrics = failed.map(({ query }) => formatMetricLabel(query.metric));
    sentences.push(`Some data could not be loaded: ${failedMetrics.join(", ")}.`);
  }

  if (queryNormalizationNotes.length > 0) {
    sentences.push(`I adjusted some query settings automatically: ${queryNormalizationNotes.join(" | ")}.`);
  }

  return sentences.join(" ");
}

function sanitizeGeneratedUiConfig(value: unknown): UIConfigV4 | null {
  if (!isObject(value)) {
    return null;
  }

  if (value.type !== "MesPage") {
    return null;
  }

  const queriesRaw = value.queries;
  const childrenRaw = value.children;

  if (!isObject(queriesRaw) || !Array.isArray(childrenRaw)) {
    return null;
  }

  const children = childrenRaw.filter(isObject).map((child) => child as UIChildV4);

  if (children.length === 0) {
    return null;
  }

  const queries: Record<string, QueryAPIV1> = {};
  for (const [queryKey, queryValue] of Object.entries(queriesRaw)) {
    if (!isObject(queryValue)) {
      continue;
    }

    const metric = queryValue.metric;
    const timeRange = queryValue.timeRange;

    if (typeof metric !== "string" || typeof timeRange !== "string") {
      continue;
    }

    queries[queryKey] = queryValue as QueryAPIV1;
  }

  return {
    type: "MesPage",
    title: typeof value.title === "string" ? value.title : undefined,
    queries,
    children,
  };
}

function normalizeAndValidateQuery(query: QueryAPIV1): QueryValidationResult {
  const allowedMetrics: QueryMetricV1[] = [
    "ScrapRate",
    "ReworkRate",
    "YieldRate",
    "DefectDistribution",
    "WipAgingDistribution",
    "LotStatusDistribution",
  ];
  const allowedTimeRanges: QueryTimeRangeV1[] = ["today", "7d", "30d", "90d", "custom"];

  if (!allowedMetrics.includes(query.metric)) {
    return { ok: false, error: `Unsupported metric: ${String(query.metric)}` };
  }

  if (!allowedTimeRanges.includes(query.timeRange)) {
    return { ok: false, error: `Unsupported timeRange: ${String(query.timeRange)}` };
  }

  const warnings: string[] = [];

  const normalized: QueryAPIV1 = {
    ...query,
  };

  if (normalized.metric === "DefectDistribution") {
    normalized.dimension = "defect_type";
  }
  if (normalized.metric === "WipAgingDistribution") {
    normalized.dimension = "aging_bucket";
  }
  if (normalized.metric === "LotStatusDistribution") {
    normalized.dimension = "lot_status";
  }

  if (normalized.timeRange === "custom") {
    if (!normalized.start || !normalized.end) {
      normalized.timeRange = "30d";
      delete normalized.start;
      delete normalized.end;
      warnings.push("Custom timeRange missing start/end; fallback to 30d.");
    }
  } else {
    delete normalized.start;
    delete normalized.end;
  }

  if (normalized.metric === "YieldRate") {
    if (normalized.dimension && normalized.dimension !== "line" && normalized.dimension !== "date") {
      delete normalized.dimension;
      warnings.push("YieldRate invalid dimension removed.");
    }
  }

  if (normalized.metric === "ScrapRate") {
    if (normalized.timeRange === "today") {
      normalized.timeRange = "7d";
      warnings.push("ScrapRate does not support today; fallback to 7d.");
    }
    delete normalized.dimension;
  }

  if (normalized.metric === "ReworkRate") {
    if (normalized.timeRange === "90d") {
      normalized.timeRange = "30d";
      warnings.push("ReworkRate does not support 90d; fallback to 30d.");
    }
    delete normalized.dimension;
  }

  if (normalized.metric === "DefectDistribution" && normalized.timeRange === "90d") {
    normalized.timeRange = "30d";
    warnings.push("DefectDistribution does not support 90d; fallback to 30d.");
  }

  return {
    ok: true,
    normalized,
    warnings,
  };
}

function readPath(source: unknown, path?: string): unknown {
  if (!path) {
    return source;
  }

  const normalizedPath = path.startsWith("data.") ? path.slice("data.".length) : path;

  return normalizedPath
    .split(".")
    .filter(Boolean)
    .reduce<unknown>((accumulator, segment) => {
      if (accumulator === null || typeof accumulator !== "object") {
        return undefined;
      }

      if (Array.isArray(accumulator)) {
        const index = Number(segment);
        if (Number.isInteger(index) && index >= 0) {
          return accumulator[index];
        }
        return undefined;
      }

      return (accumulator as Record<string, unknown>)[segment];
    }, source);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValueRefV1(value: unknown): value is ValueRefV1 {
  return isObject(value) && typeof value.queryKey === "string" && !("labelField" in value) && !("nameField" in value);
}

function isPieChartDataRefV1(value: unknown): value is PieChartDataRefV1 {
  return (
    isObject(value) &&
    typeof value.queryKey === "string" &&
    typeof value.labelField === "string" &&
    typeof value.valueField === "string"
  );
}

function isBarChartDataRefV1(value: unknown): value is BarChartDataRefV1 {
  return (
    isObject(value) &&
    typeof value.queryKey === "string" &&
    typeof value.nameField === "string" &&
    typeof value.valueField === "string"
  );
}

function isLineChartDataRefV1(value: unknown): value is LineChartDataRefV1 {
  return (
    isObject(value) &&
    typeof value.queryKey === "string" &&
    typeof value.nameField === "string" &&
    typeof value.yieldField === "string"
  );
}

function isComboChartDataRefV1(value: unknown): value is ComboChartDataRefV1 {
  return (
    isObject(value) &&
    typeof value.queryKey === "string" &&
    typeof value.nameField === "string" &&
    typeof value.barField === "string" &&
    typeof value.lineField === "string"
  );
}

function getQueryResultData(queryResponsesByKey: Record<string, QueryResponse>, queryKey: string): QueryResponse["data"] {
  return queryResponsesByKey[queryKey]?.data;
}

function resolveValueRef(valueRef: ValueRefV1, queryResponsesByKey: Record<string, QueryResponse>): unknown {
  const queryResponse = queryResponsesByKey[valueRef.queryKey];
  if (!queryResponse || !queryResponse.ok) {
    return valueRef.fallback ?? null;
  }

  const data = getQueryResultData(queryResponsesByKey, valueRef.queryKey);
  const resolved = readPath(data, valueRef.path ?? "value");

  if (typeof resolved === "undefined") {
    return valueRef.fallback ?? null;
  }

  return resolved;
}

function mapRows(
  queryResponsesByKey: Record<string, QueryResponse>,
  queryKey: string,
  path: string | undefined,
  mapper: (row: Record<string, unknown>) => Record<string, unknown>
): Record<string, unknown>[] {
  const queryResponse = queryResponsesByKey[queryKey];
  if (!queryResponse || !queryResponse.ok) {
    return [];
  }

  const data = getQueryResultData(queryResponsesByKey, queryKey);
  const rowsValue = readPath(data, path ?? "rows");

  if (!Array.isArray(rowsValue)) {
    return [];
  }

  return rowsValue.filter(isObject).map(mapper);
}

const PIE_LEGEND_COLOR_MAP: Record<string, string> = {
  Cancelled: "#E57373",
  Finished: "#66BB6A",
  Hold: "#FFB74D",
  NotStarted: "#90A4AE",
  WorkInProcess: "#42A5F5",
};

const PIE_FALLBACK_PALETTE = [
  "#42A5F5",
  "#66BB6A",
  "#FFB74D",
  "#AB47BC",
  "#26A69A",
  "#EF5350",
  "#5C6BC0",
  "#FFA726",
];

function colorForPieLegend(legend: string, index: number): string {
  return PIE_LEGEND_COLOR_MAP[legend] ?? PIE_FALLBACK_PALETTE[index % PIE_FALLBACK_PALETTE.length];
}

function resolveBoundValue(
  value: unknown,
  queryResponsesByKey: Record<string, QueryResponse>,
  bindingCounter: { count: number }
): unknown {
  if (isValueRefV1(value)) {
    bindingCounter.count += 1;
    return resolveValueRef(value, queryResponsesByKey);
  }

  if (isPieChartDataRefV1(value)) {
    bindingCounter.count += 1;
    return mapRows(queryResponsesByKey, value.queryKey, value.path, (row) => row).map((row, index) => {
      const legend = String(row[value.labelField] ?? "");
      const explicitColor =
        typeof value.colorField === "string" && typeof row[value.colorField] === "string"
          ? String(row[value.colorField])
          : undefined;

      return {
        legend,
        data: Number(row[value.valueField] ?? 0),
        color: explicitColor ?? colorForPieLegend(legend, index),
      };
    });
  }

  if (isBarChartDataRefV1(value)) {
    bindingCounter.count += 1;
    return mapRows(queryResponsesByKey, value.queryKey, value.path, (row) => ({
      name: String(row[value.nameField] ?? ""),
      value: Number(row[value.valueField] ?? 0),
    }));
  }

  if (isLineChartDataRefV1(value)) {
    bindingCounter.count += 1;
    return mapRows(queryResponsesByKey, value.queryKey, value.path, (row) => ({
      name: String(row[value.nameField] ?? ""),
      yield: Number(row[value.yieldField] ?? 0),
    }));
  }

  if (isComboChartDataRefV1(value)) {
    bindingCounter.count += 1;
    return mapRows(queryResponsesByKey, value.queryKey, value.path, (row) => ({
      name: String(row[value.nameField] ?? ""),
      barValue: Number(row[value.barField] ?? 0),
      lineValue: Number(row[value.lineField] ?? 0),
    }));
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveBoundValue(item, queryResponsesByKey, bindingCounter));
  }

  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        resolveBoundValue(nestedValue, queryResponsesByKey, bindingCounter),
      ])
    );
  }

  return value;
}

function resolveChildrenBindings(
  children: UIChildV4[],
  queryResponsesByKey: Record<string, QueryResponse>
): { resolvedChildren: UIChildV4[]; resolvedBindings: number } {
  const bindingCounter = { count: 0 };
  const resolvedChildren = children.map((child) =>
    resolveBoundValue(child, queryResponsesByKey, bindingCounter)
  ) as UIChildV4[];

  return {
    resolvedChildren,
    resolvedBindings: bindingCounter.count,
  };
}

export async function checkBackendHealth(): Promise<BackendHealthDebug> {
  const started = performance.now();
  const checkedAt = new Date().toISOString();

  try {
    const backendBaseUrl = await resolveBackendBaseUrl(1200);
    const response = await fetchWithTimeout(
      `${backendBaseUrl}/health`,
      { method: "GET" },
      HEALTH_CHECK_TIMEOUT_MS
    );
    const latencyMs = Math.round(performance.now() - started);

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        latencyMs,
        checkedAt,
        message: `Health check failed with HTTP ${response.status}`,
      };
    }

    return {
      ok: true,
      statusCode: response.status,
      latencyMs,
      checkedAt,
      message: "Backend reachable",
    };
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "AbortError"
        ? `timeout after ${HEALTH_CHECK_TIMEOUT_MS}ms`
        : error instanceof Error
          ? error.message
          : "Unknown error";
    return {
      ok: false,
      statusCode: null,
      latencyMs: Math.round(performance.now() - started),
      checkedAt,
      message: `Backend unreachable: ${message}`,
    };
  }
}

export async function sendQueryWithDebug(
  prompt: string,
  sessionId?: string | null
): Promise<SendQueryDebugResult> {
  const started = performance.now();
  const health = await checkBackendHealth();
  const backendBaseUrl = await resolveBackendBaseUrl(1200);

  const flow: PromptFlowDebug = {
    backendBaseUrl,
    generateUiStatusCode: null,
    generatedUiType: null,
    generatedComponentTypes: [],
    queryKeys: [],
    queryCalls: 0,
    queryFailures: 0,
    resolvedBindings: 0,
    elapsedMs: 0,
    lastError: null,
  };
  const queryNormalizationNotes: string[] = [];

  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    flow.elapsedMs = Math.round(performance.now() - started);
    flow.lastError = "Prompt is required.";
    return {
      answer: flow.lastError,
      health,
      flow,
    };
  }

  if (!health.ok) {
    flow.elapsedMs = Math.round(performance.now() - started);
    flow.lastError = health.message;
    return {
      answer: health.message,
      health,
      flow,
    };
  }

  try {
    const generateResponse = await fetch(`${backendBaseUrl}/chat-ui`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: trimmedPrompt,
        ...(sessionId ? { sessionId } : {}),
      }),
    });

    flow.generateUiStatusCode = generateResponse.status;

    if (!generateResponse.ok) {
      flow.elapsedMs = Math.round(performance.now() - started);
      flow.lastError = `Backend error (${generateResponse.status}) while generating UI config.`;
      return {
        answer: flow.lastError,
        health,
        flow,
      };
    }

    const generated = (await generateResponse.json()) as ChatUIResponse;
    const parsedUiConfig = sanitizeGeneratedUiConfig(generated.uiConfig);

    if (!generated.ok) {
      const message = buildErrorMessage("Failed to generate dashboard", generated.errors);
      flow.elapsedMs = Math.round(performance.now() - started);
      flow.lastError = message;
      return {
        answer: message,
        health,
        flow,
        sessionId: generated.sessionId,
        status: generated.status,
        requirements: generated.requirements,
        uiConfig: parsedUiConfig ?? generated.uiConfig,
      };
    }

    if (generated.status === "need_clarification") {
      const answer = generated.question?.trim() || "I need a bit more information before I can build the dashboard.";
      flow.elapsedMs = Math.round(performance.now() - started);
      return {
        answer,
        health,
        flow,
        sessionId: generated.sessionId,
        status: generated.status,
        requirements: generated.requirements,
        uiConfig: parsedUiConfig ?? generated.uiConfig,
      };
    }

    if (!parsedUiConfig) {
      const message = buildErrorMessage("Failed to generate schema-valid ui-config-v4", generated.errors);
      flow.elapsedMs = Math.round(performance.now() - started);
      flow.lastError = message;
      return {
        answer: message,
        health,
        flow,
        sessionId: generated.sessionId,
        status: generated.status,
        requirements: generated.requirements,
      };
    }

    const uiConfig = parsedUiConfig;
    const queryEntries = Object.entries(uiConfig.queries ?? {});

    flow.generatedUiType = uiConfig.type;
    flow.generatedComponentTypes = uiConfig.children.map((child) => child.type);
    flow.queryKeys = queryEntries.map(([queryKey]) => queryKey);
    flow.queryCalls = queryEntries.length;

    const queryResults = await Promise.all(
      queryEntries.map(async ([queryKey, query]) => {
        const validated = normalizeAndValidateQuery(query);
        if (!validated.ok || !validated.normalized) {
          return {
            queryKey,
            query,
            response: {
              ok: false,
              errors: [validated.error ?? "Invalid query"],
            } as QueryResponse,
          };
        }

        if (validated.warnings && validated.warnings.length > 0) {
          queryNormalizationNotes.push(
            ...validated.warnings.map((warning) => `${queryKey}: ${warning}`)
          );
        }

        const response = await fetch(`${backendBaseUrl}/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validated.normalized),
        });

        if (!response.ok) {
          return {
            queryKey,
            query,
            response: {
              ok: false,
              errors: [`HTTP ${response.status}`],
            } as QueryResponse,
          };
        }

        const body = (await response.json()) as QueryResponse;
        return { queryKey, query, response: body };
      })
    );

    flow.queryFailures = queryResults.filter(({ response }) => !response.ok).length;

    const queryResponsesByKey: Record<string, QueryResponse> = Object.fromEntries(
      queryResults.map(({ queryKey, response }) => [queryKey, response])
    );

    const { resolvedChildren, resolvedBindings } = resolveChildrenBindings(uiConfig.children, queryResponsesByKey);
    flow.resolvedBindings = resolvedBindings;

    const componentTypes = flow.generatedComponentTypes;

    flow.elapsedMs = Math.round(performance.now() - started);

    return {
      answer: buildUserAnswer(uiConfig.title, componentTypes, queryResults, queryNormalizationNotes),
      health,
      flow,
      sessionId: generated.sessionId,
      status: generated.status,
      requirements: generated.requirements,
      uiConfig,
      resolvedChildren,
      queryResults,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const answer = `Unable to reach backend: ${message}`;
    flow.elapsedMs = Math.round(performance.now() - started);
    flow.lastError = answer;

    return {
      answer,
      health,
      flow,
    };
  }
}

export async function sendQuery(prompt: string): Promise<string> {
  const result = await sendQueryWithDebug(prompt);
  return result.answer;
}

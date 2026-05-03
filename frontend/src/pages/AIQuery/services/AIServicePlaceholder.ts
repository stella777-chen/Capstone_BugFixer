type QueryMOMV1 = {
  metric: string;
  timeRange: "today" | "7d" | "30d" | "90d" | "custom";
  dimension?: "line" | "defect_type" | "aging_bucket" | "lot_status" | "job_status" | "date";
  start?: string;
  end?: string;
  filters?: Array<{ field: string; op: string; value: string | number | boolean | unknown[] }>;
  limit?: number;
  page?: number;
  pageSize?: number;
  orderBy?: Array<{ field: string; direction: "asc" | "desc" }>;
};

type UIConfigV3 = {
  type: "MesPage";
  title?: string;
  queries: Record<string, QueryMOMV1>;
  children: Array<{ type: string }>;
};

type GenerateUIResponse = {
  ok: boolean;
  uiConfig?: UIConfigV3;
  errors?: Array<{ path?: unknown[]; message?: string } | string>;
};

type QueryResponse = {
  ok: boolean;
  data?: {
    value?: string | number | null;
    rows?: unknown[];
    [key: string]: unknown;
  };
  meta?: Record<string, unknown>;
  errors?: Array<{ path?: unknown[]; message?: string } | string>;
};

const BACKEND_BASE_URL_CANDIDATES = ["http://127.0.0.1:8001"];
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
  elapsedMs: number;
  lastError: string | null;
};

export type SendQueryDebugResult = {
  answer: string;
  health: BackendHealthDebug;
  flow: PromptFlowDebug;
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

function summarizeQueryResult(queryKey: string, query: QueryMOMV1, response: QueryResponse): string {
  if (!response.ok) {
    return `- ${queryKey} (${query.metric}): failed`;
  }

  if (typeof response.data?.value !== "undefined") {
    return `- ${queryKey} (${query.metric}): value = ${String(response.data.value)}`;
  }

  if (Array.isArray(response.data?.rows)) {
    return `- ${queryKey} (${query.metric}): rows = ${response.data.rows.length}`;
  }

  return `- ${queryKey} (${query.metric}): returned data`;
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

export async function sendQueryWithDebug(prompt: string): Promise<SendQueryDebugResult> {
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
    elapsedMs: 0,
    lastError: null,
  };

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
    const generateResponse = await fetch(`${backendBaseUrl}/generate-ui`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
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

    const generated = (await generateResponse.json()) as GenerateUIResponse;
    if (!generated.ok || !generated.uiConfig) {
      const message = buildErrorMessage("Failed to generate schema-valid ui-config-v3", generated.errors);
      flow.elapsedMs = Math.round(performance.now() - started);
      flow.lastError = message;
      return {
        answer: message,
        health,
        flow,
      };
    }

    const { uiConfig } = generated;
    const queryEntries = Object.entries(uiConfig.queries ?? {});

    flow.generatedUiType = uiConfig.type;
    flow.generatedComponentTypes = uiConfig.children.map((child) => child.type);
    flow.queryKeys = queryEntries.map(([queryKey]) => queryKey);
    flow.queryCalls = queryEntries.length;

    const queryResults = await Promise.all(
      queryEntries.map(async ([queryKey, query]) => {
        const response = await fetch(`${backendBaseUrl}/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(query),
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

    const querySummary = queryResults
      .map(({ queryKey, query, response }) => summarizeQueryResult(queryKey, query, response))
      .join("\n");

    const componentTypes = flow.generatedComponentTypes.join(", ");

    flow.elapsedMs = Math.round(performance.now() - started);

    return {
      answer: [
        `Generated ${uiConfig.type}${uiConfig.title ? `: ${uiConfig.title}` : ""}`,
        `Components: ${componentTypes || "None"}`,
        `Queries executed: ${queryEntries.length}`,
        querySummary,
      ].join("\n"),
      health,
      flow,
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
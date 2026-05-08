import React, { useEffect, useState } from "react";
import "./AIQuery.scss";
import { Button } from "@fluentui/react-components";
import {
  BackendHealthDebug,
  PromptFlowDebug,
  checkBackendHealth,
  sendQueryWithDebug,
} from "./services/AIService";
import loader from "../../assets/CantierSpinneIcon.svg";
import cantierLogo from "../../assets/CantierLogo.png";

const AIQuery: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ q: string; a: string }>>([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [health, setHealth] = useState<BackendHealthDebug | null>(null);
  const [flow, setFlow] = useState<PromptFlowDebug | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    const runHealthCheck = async () => {
      setCheckingHealth(true);
      try {
        const result = await checkBackendHealth();
        setHealth(result);
      } finally {
        setCheckingHealth(false);
      }
    };

    runHealthCheck();
  }, []);

  const handleHealthCheck = async () => {
    if (checkingHealth) {
      return;
    }

    setCheckingHealth(true);
    try {
      const result = await checkBackendHealth();
      setHealth(result);
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleSend = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    try {
      const result = await sendQueryWithDebug(query);
      const answer = result.answer;
      const item = { q: query, a: answer };
      setHistory((h) => [item, ...h]);
      setHealth(result.health);
      setFlow(result.flow);
      setQuery("");
    } finally {
      setLoading(false);
    }
  };
  // v1 (deprecated): used simple sendQuery() returning a string directly
  // const handleSend = async () => {
  //   if (!query.trim()) return;
  //   setLoading(true);
  //   try {
  //     const answer = await sendQuery(query);
  //     setHistory((h) => [{ q: query, a: answer }, ...h]);
  //     setQuery("");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };
  // v1 (deprecated): Shift+Enter to submit (current uses Ctrl/Cmd+Enter)
  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter" && e.shiftKey) {
  //     e.preventDefault();
  //     handleSend();
  //   }
  // };

  function inputChanged(input: React.SetStateAction<string>) {
    setQuery(input as string);
    setIsDisabled((input as string).trim() == "");
  }

  const hasHistory = history.length > 0;

  return (
    <div className="page-root">      
      <div className="page-body">
        {history.map((h, idx) => (
          <div className="history-item" key={idx}>
            <div className="question">Q: {h.q}</div>
            <div className="answer">A: {h.a}</div>
          </div>
        ))}
        {/* v1 (deprecated): history lived in its own separate page-card below the inputs card
        <div className="page-card">
          <div className="history">
            <h3 className="history-title">History</h3>
            {history.length === 0 && <div className="empty">No queries yet.</div>}
            {history.map((h, idx) => (
              <div className="history-item" key={idx}>
                <div className="question">Q: {h.q}</div>
                <div className="answer">A: {h.a}</div>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      <div className={`page-footer ${hasHistory ? "page-footer--history" : "page-footer--empty"}`}>
        {!hasHistory && (
          <div className="empty-state">
            <img src={cantierLogo} alt="Cantier" className="cantier-logo" />
            <p className="empty">No queries yet. Start by asking something!</p>
          </div>
        )}

        <div className="page-card">
          <div className="inputs">  
            <div className="input-bar-wrap">
              <textarea
                placeholder="Your question here..."
                value={query}
                onChange={(e) => inputChanged((e.target as HTMLTextAreaElement).value)}
                onKeyDown={handleKeyDown}
                className="query-input"
                disabled={loading}
                rows={3}
              />
              {/* v1 (deprecated): Fluent UI <Textarea> with resize="none"
              <Textarea
                placeholder="Your question here..."
                value={query}
                onChange={(e) => inputChanged((e.target as HTMLTextAreaElement).value)}
                resize="none"
                onKeyDown={handleKeyDown}
                className="textarea"
              /> */}
              {loading && (
                <div className="input-overlay" aria-hidden="true">
                  <img src={loader} alt="Loading..." className="input-spinner"/>
                </div>
              )}
            </div>
            <div className="actions">
              <Button appearance="primary" onClick={handleSend} disabled={isDisabled || loading} className="send-btn">
                {loading ? "Thinking..." : "Send"}
              </Button>
              <Button onClick={() => inputChanged("")} className="clear-btn">Clear</Button>
              <span className="composer-hint">Ctrl/Cmd+Enter to Submit Query</span>
            </div>
          </div>
        </div>

        {!hasHistory && (
          <div className="suggestions">
            <Button className="suggestion-item">Try asking something!</Button>
            <Button className="suggestion-item">Try asking something!</Button>
            <Button className="suggestion-item">Try asking something!</Button>
          </div>
        )}

        <div className="debug-panel">
          <div className="debug-header">
            <h3 className="debug-title">Debug Panel</h3>
            <Button onClick={handleHealthCheck} disabled={checkingHealth || loading} className="debug-refresh-btn">
              {checkingHealth ? "Checking..." : "Check Connection"}
            </Button>
          </div>

          <div className="debug-grid">
            <div className="debug-row">
              <span className="debug-label">Backend:</span>
              <span>{flow?.backendBaseUrl ?? "http://127.0.0.1:8000"}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Health:</span>
              <span className={health?.ok ? "debug-ok" : "debug-error"}>
                {health ? (health.ok ? "Connected" : "Disconnected") : "Unknown"}
              </span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Health Status:</span>
              <span>{health?.statusCode ?? "-"}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Health Latency:</span>
              <span>{health?.latencyMs ?? "-"} ms</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Generate UI HTTP:</span>
              <span>{flow?.generateUiStatusCode ?? "-"}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Query Calls:</span>
              <span>{flow?.queryCalls ?? 0}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Query Failures:</span>
              <span>{flow?.queryFailures ?? 0}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Elapsed:</span>
              <span>{flow?.elapsedMs ?? "-"} ms</span>
            </div>
          </div>

          <div className="debug-block">
            <div className="debug-label">Components</div>
            <div className="debug-value">
              {flow?.generatedComponentTypes?.length ? flow.generatedComponentTypes.join(", ") : "-"}
            </div>
          </div>

          <div className="debug-block">
            <div className="debug-label">Query Keys</div>
            <div className="debug-value">{flow?.queryKeys?.length ? flow.queryKeys.join(", ") : "-"}</div>
          </div>

          <div className="debug-block">
            <div className="debug-label">Last Error / Message</div>
            <div className="debug-value">{flow?.lastError ?? health?.message ?? "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuery;

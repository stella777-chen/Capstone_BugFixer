import React, { useEffect, useState } from "react";
import "./AIQuery.scss";
import { Button } from "@fluentui/react-components";
import {
  BackendHealthDebug,
  PromptFlowDebug,
  checkBackendHealth,
  sendQueryWithDebug,
} from "src/pages/AIQuery/services/AIService";
import CardLayout, { CardLayoutItem, CardType } from "./components/CardLayout";
import loader from "../../assets/CantierSpinneIcon.svg";
import cantierLogo from "../../assets/CantierLogo.png";

type GeneratedCardLayout = {
  title?: string;
  items: CardLayoutItem[];
};

type HistoryItem = {
  q: string;
  a: string;
  layout: GeneratedCardLayout | null;
  status?: string;
  sessionId?: string;
};

const SUPPORTED_CARD_TYPES = new Set<CardType>([
  "ScrapRateDonut",
  "ReworkRateDonut",
  "LineChart",
  "PieChart",
  "BarChart",
  "ComboChart",
  "DataTable",
]);

const mapResultToLayout = (result: Awaited<ReturnType<typeof sendQueryWithDebug>>): GeneratedCardLayout | null => {
  const children = result.resolvedChildren ?? result.uiConfig?.children ?? [];
  const items: CardLayoutItem[] = [];

  for (const child of children) {
    if (!child || typeof child !== "object") {
      continue;
    }

    const cardType = child.type;
    if (typeof cardType !== "string" || !SUPPORTED_CARD_TYPES.has(cardType as CardType)) {
      continue;
    }

    const { type, ...props } = child as Record<string, unknown>;
    items.push({
      cardType: type as CardType,
      props,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return {
    title: result.uiConfig?.title,
    items,
  };
};

const AIQuery: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [health, setHealth] = useState<BackendHealthDebug | null>(null);
  const [flow, setFlow] = useState<PromptFlowDebug | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);


  const hasHistory = history.length > 0;

  const handleSend = async () => {
    if (!query.trim() || loading) return;
    const submittedQuery = query.trim();
    setLoading(true);
    try {
      const result = await sendQueryWithDebug(submittedQuery, sessionId);
      const answer = result.answer;
      const nextSessionId = result.sessionId ?? sessionId ?? undefined;
      const item = {
        q: submittedQuery,
        a: answer,
        layout: mapResultToLayout(result),
        status: result.status,
        sessionId: nextSessionId,
      };
      setHistory((h) => [item, ...h]);
      setSessionId(result.sessionId ?? sessionId);
      setHealth(result.health);
      setFlow(result.flow);
      setQuery("");
      setIsDisabled(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetConversation = () => {
    setHistory([]);
    setSessionId(null);
    setHealth(null);
    setFlow(null);
    inputChanged("");
  };

  function inputChanged(input: React.SetStateAction<string>) {
    setQuery(input as string);
    setIsDisabled((input as string).trim() == "");
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page-root">      
      <div className="page-body">
        {history.map((h, idx) => (
          <div className="history-item" key={idx}>
            <div className="question">Q: {h.q}</div>
            <div className="answer">A: {h.a}</div>
            {h.status === "need_clarification" && (
              <div className="answer-status">Awaiting clarification in current session.</div>
            )}
            {h.layout && (
              <div className="answer-layout">
                <CardLayout
                  items={h.layout.items}
                  layoutDescription={h.layout.title || undefined}
                />
              </div>
            )}
          </div>
        ))}
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
              <Button onClick={handleResetConversation} className="clear-btn">New Chat</Button>
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
      </div>
    </div>
  );
}

export default AIQuery;

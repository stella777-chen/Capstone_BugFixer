import React, { useState } from "react";
import "./AIQuery.scss";
import { Button, Input, Textarea } from "@fluentui/react-components";
import { sendQuery } from "../../services/aiService";

const AIQuery: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ q: string; a: string }>>([]);
  const [isDisabled, setIsDisabled] = useState(true);

  const handleSend = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const answer = await sendQuery(query);
      const item = { q: query, a: answer };
      setHistory((h) => [item, ...h]);
      setQuery("");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
        handleSend();
    }
  };

  function inputChanged(input: React.SetStateAction<string>) {
    setQuery(input as string);
    setIsDisabled((input as string).trim() == "");
  }

  return (
    <div className="ai-page-root">
      <div className="ai-page-card">
        <h2 className="ai-title">AI Query</h2>
        <p className="ai-sub">Ask Questions</p>

        <div className="ai-inputs">
          <Textarea
            placeholder="Your question here..."
            value={query}
            onChange={(e) => inputChanged((e.target as HTMLTextAreaElement).value)}
            resize="none"
            onKeyDown={handleKeyDown}
            className="ai-textarea"
          />
          <div className="ai-actions">
            <Button appearance="primary" onClick={handleSend} disabled={isDisabled || loading} className="ai-send-btn">
              {loading ? "Thinking..." : "Send"}
            </Button>
            <Button onClick={() => inputChanged("")} className="ai-clear-btn">Clear</Button>
          </div>
        </div>

        <div className="ai-history">
          <h3>History</h3>
          {history.length === 0 && <div className="ai-empty">No queries yet.</div>}
          {history.map((h, idx) => (
            <div className="ai-history-item" key={idx}>
              <div className="ai-question">Q: {h.q}</div>
              <div className="ai-answer">A: {h.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIQuery;

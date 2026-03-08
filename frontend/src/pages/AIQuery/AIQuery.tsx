import React, { useState } from "react";
import "./AIQuery.scss";
import { Button, Textarea } from "@fluentui/react-components";
import { sendQuery } from "../../services/aiService";
import loader from "../../assets/CantierSpinneIcon.svg";

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
    <div className="page-root">
      <div className="page-card">
        <h2 className="title">AI Query</h2>
        <p className="sub">Ask Questions</p>

        <div className="inputs">
          <div className="textarea-wrap">
            <Textarea
              placeholder="Your question here..."
              value={query}
              onChange={(e) => inputChanged((e.target as HTMLTextAreaElement).value)}
              resize="none"
              onKeyDown={handleKeyDown}
              className="textarea"
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
          </div>
        </div>

        
      </div>
      
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
      </div>
    </div>
  );
};

export default AIQuery;

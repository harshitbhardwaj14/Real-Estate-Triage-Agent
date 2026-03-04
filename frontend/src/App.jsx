import { useState } from "react";

const API_URL = "http://localhost:8000/triage";
const EXAMPLE_QUERIES = [
  "Hi, I'm interested in property REF-8821. Can I schedule a viewing this Friday morning? I'm in town for one day.",
  "Hello, is REF-4410 still available for rent? I can visit next Tuesday after 5 PM.",
  "I submitted a maintenance complaint for REF-1209 last week and haven't heard back. Please call me urgently.",
];

export default function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onAnalyze = async () => {
    const inquiry = message.trim();
    if (!inquiry) {
      setError("Please enter an inquiry message.");
      return;
    }

    setLoading(true);
    setError("");
    setChat((prev) => [...prev, { role: "user", text: inquiry }]);
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inquiry }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to analyze inquiry.");
      }

      setChat((prev) => [...prev, { role: "ai", triage: data }]);
    } catch (err) {
      const msg = err.message || "Something went wrong.";
      setError(msg);
      setChat((prev) => [...prev, { role: "ai-error", text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="chat-shell">
        <div className="chat-header">
          <h1>Real Estate AI Triage Agent</h1>
          <p>Chat-style inquiry analysis</p>
        </div>

        <div className="chat-window">
          {chat.length === 0 && (
            <div className="empty-state">
              Start with an inquiry and the AI will return urgency, intent, property ID, and draft response.
            </div>
          )}

          {chat.map((item, index) => (
            <div
              key={index}
              className={`bubble-row ${
                item.role === "user" ? "bubble-row-user" : "bubble-row-ai"
              }`}
            >
              <div className={`bubble ${item.role === "user" ? "user-bubble" : "ai-bubble"}`}>
                {item.role === "user" && <p>{item.text}</p>}

                {item.role === "ai" && (
                  <div className="triage-content">
                    <p>
                      <strong>Urgency:</strong> {item.triage.urgency || "N/A"}
                    </p>
                    <p>
                      <strong>Intent:</strong> {item.triage.intent || "N/A"}
                    </p>
                    <p>
                      <strong>Property ID:</strong> {item.triage.property_id || "N/A"}
                    </p>
                    <p>
                      <strong>Appointment Date:</strong> {item.triage.appointment_date || "N/A"}
                    </p>
                    <div className="draft-response">
                      <strong>Draft Response:</strong>
                      <p>{item.triage.draft_response || "No draft generated."}</p>
                    </div>
                  </div>
                )}

                {item.role === "ai-error" && <p className="error">{item.text}</p>}
              </div>
            </div>
          ))}

          {loading && (
            <div className="bubble-row bubble-row-ai">
              <div className="bubble ai-bubble typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        <div className="composer">
          <label htmlFor="inquiry">Customer Inquiry</label>
          <textarea
            id="inquiry"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type or paste a real estate inquiry..."
            rows={4}
            disabled={loading}
          />

          <div className="examples">
            {EXAMPLE_QUERIES.map((query, index) => (
              <button
                key={index}
                className="example-btn"
                type="button"
                onClick={() => {
                  setMessage(query);
                  setError("");
                }}
                disabled={loading}
              >
                Example {index + 1}
              </button>
            ))}
          </div>

          <button className="primary-btn" onClick={onAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Inquiry"}
          </button>

          {error && <p className="error input-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

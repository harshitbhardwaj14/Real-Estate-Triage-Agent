import { useState } from "react";
import { API_BASE } from "../App";

const EXAMPLE_QUERIES = [
  "Hi, I'm interested in property REF-8821. Can I schedule a viewing this Friday morning? I'm in town for one day.",
  "Hi, I'm interested in property REF-8821. I'd love to schedule a viewing at your earliest convenience—no rush at all. Just let me know what times work best for you in the coming days or weeks. Thanks!",
  "Hello, is REF-4410 still available for rent? I can visit next Tuesday after 5 PM.",
  "I submitted a maintenance complaint for REF-1209 last week and haven't heard back. Please call me urgently.",
];

export default function Chat({ token, handleLogout }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const onAnalyze = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setChat((prev) => [...prev, { role: "user", text: message }]);
    const currentMessage = message;
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/triage`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ message: currentMessage }),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      setChat((prev) => [...prev, { role: "ai", triage: data }]);
    } catch (err) {
      setChat((prev) => [...prev, { role: "ai-error", text: "Failed to communicate with Agent." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chat-window">
        {chat.length === 0 && (
          <div className="empty-state">
            Start with an inquiry and the AI will return urgency, intent, property ID, and draft response.
          </div>
        )}

        {chat.map((item, index) => (
          <div key={index} className={`bubble-row ${item.role === "user" ? "bubble-row-user" : "bubble-row-ai"}`}>
            <div className={`bubble ${item.role === "user" ? "user-bubble" : "ai-bubble"}`}>
              {item.role === "user" ? <p>{item.text}</p> : 
               item.role === "ai" ? (
                <div className="triage-content">
                  <p><strong>Urgency:</strong> {item.triage.urgency}</p>
                  <p><strong>Intent:</strong> {item.triage.intent}</p>
                  <p><strong>Property ID:</strong> {item.triage.property_id || "None"}</p>
                  <div className="draft-response">
                    <strong>Draft Response:</strong><p>{item.triage.draft_response}</p>
                  </div>
                </div>
               ) : <p className="error">{item.text}</p>}
            </div>
          </div>
        ))}
        {loading && <div className="bubble-row bubble-row-ai"><div className="bubble ai-bubble typing"><span/><span/><span/></div></div>}
      </div>
      
      <div className="composer">
        <label>Customer Inquiry</label>
        <textarea
          value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Type or paste a real estate inquiry..." rows={3} disabled={loading}
        />
        
        <div className="examples">
          {EXAMPLE_QUERIES.map((query, index) => (
            <button
              key={index}
              className="example-btn"
              type="button"
              onClick={() => setMessage(query)}
              disabled={loading}
            >
              Example {index + 1}
            </button>
          ))}
        </div>

        <button className="primary-btn" onClick={onAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Inquiry"}
        </button>
      </div>
    </>
  );
}
import { useState } from "react";

const API_URL = "http://localhost:8000/triage";
const EXAMPLE_QUERIES = [
  "Hi, I'm interested in property REF-8821. Can I schedule a viewing this Friday morning? I'm in town for one day.",
  "Hello, is REF-4410 still available for rent? I can visit next Tuesday after 5 PM.",
  "I submitted a maintenance complaint for REF-1209 last week and haven't heard back. Please call me urgently.",
];

export default function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onAnalyze = async () => {
    if (!message.trim()) {
      setError("Please enter an inquiry message.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to analyze inquiry.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card hero-card">
        <h1>Real Estate AI Triage Agent</h1>

        <label htmlFor="inquiry">Customer Inquiry</label>
        <textarea
          id="inquiry"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste a real estate inquiry message..."
          rows={7}
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
            >
              Example {index + 1}
            </button>
          ))}
        </div>

        <button className="primary-btn" onClick={onAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Inquiry"}
        </button>

        {error && <p className="error">{error}</p>}
      </div>

      {result && (
        <div className="card result-card">
          <h2>AI Analysis</h2>
          <div className="grid">
            <p>
              <strong>Urgency:</strong> {result.urgency || "N/A"}
            </p>
            <p>
              <strong>Intent:</strong> {result.intent || "N/A"}
            </p>
            <p>
              <strong>Property ID:</strong> {result.property_id || "N/A"}
            </p>
            <p>
              <strong>Appointment Date:</strong> {result.appointment_date || "N/A"}
            </p>
          </div>

          <h2>Draft Response</h2>
          <div className="response-box">{result.draft_response || "No draft generated."}</div>
        </div>
      )}
    </div>
  );
}
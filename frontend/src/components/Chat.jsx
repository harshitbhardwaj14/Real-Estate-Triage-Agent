import { useState, useEffect } from "react";
import { API_BASE } from "../App";

const EXAMPLE_QUERIES = [
  "I am pre-approved for a mortgage and want to make a cash offer on property REF-1024. Please contact me to discuss the next steps.", // Intent: Buying
  "I am the owner of REF-5590 and would like to schedule a professional valuation to list my home on the market.", // Intent: Selling
  "Could we arrange a weekend tour for the townhouse at REF-7742? I am available this Saturday afternoon.", // Intent: Viewing
  "The hot water heater in REF-9915 has been broken for two days. This is an emergency, send maintenance immediately!", // Intent: Complaint
  "Can you tell me if the apartment complex for REF-2048 allows large pets? I have a dog and need to know before applying.", // Intent: General Inquiry
];

const Spinner = () => (
  <svg 
    width="24" height="24" viewBox="0 0 24 24" fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    style={{ animation: 'spin 1s linear infinite', marginRight: '12px', verticalAlign: 'middle' }}
  >
    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"></circle>
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
  </svg>
);

export default function Chat({ token, handleLogout }) {
  const [viewMode, setViewMode] = useState("chat"); // "chat" | "history"
  
  // Chat States
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  // History States
  const [myRequests, setMyRequests] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchMyRequests = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/user/records`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setMyRequests(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch records whenever the user clicks the "My Requests" tab
  useEffect(() => {
    if (viewMode === "history") {
      fetchMyRequests();
    }
  }, [viewMode]);

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

      if (!response.ok) {
        const errData = await response.json();
        setChat((prev) => [...prev, { role: "ai-error", text: errData.detail || "An error occurred." }]);
        setLoading(false);
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

  const getStatusColor = (status) => {
    if (status === 'Solved') return '#32d74b'; // Green
    if (status === 'Action Taken') return '#0a84ff'; // Blue
    return '#ff9f0a'; // Orange (Unsolved)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(128,128,128,0.2)' }}>
        <button 
          onClick={() => setViewMode("chat")}
          style={{ 
            flex: 1, padding: '1rem', background: 'transparent', border: 'none', cursor: 'pointer',
            fontWeight: viewMode === "chat" ? 'bold' : 'normal',
            borderBottom: viewMode === "chat" ? '3px solid #0a84ff' : '3px solid transparent',
            color: 'inherit', fontSize: '1rem'
          }}
        >
          New Inquiry
        </button>
        <button 
          onClick={() => setViewMode("history")}
          style={{ 
            flex: 1, padding: '1rem', background: 'transparent', border: 'none', cursor: 'pointer',
            fontWeight: viewMode === "history" ? 'bold' : 'normal',
            borderBottom: viewMode === "history" ? '3px solid #0a84ff' : '3px solid transparent',
            color: 'inherit', fontSize: '1rem'
          }}
        >
          My Requests
        </button>
      </div>

      {/* CHAT VIEW */}
      {viewMode === "chat" && (
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
                  key={index} className="example-btn" type="button"
                  onClick={() => setMessage(query)} disabled={loading}
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
      )}

      {/* MY REQUESTS (HISTORY) VIEW */}
      {viewMode === "history" && (
        <div className="chat-window" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(128,128,128,0.1)' }}>
                <th style={{ padding: '16px 12px', width: '20%' }}>Date</th>
                <th style={{ padding: '16px 12px', width: '45%' }}>Inquiry</th>
                <th style={{ padding: '16px 12px', width: '15%' }}>Property ID</th>
                <th style={{ padding: '16px 12px', width: '20%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingHistory ? (
                <tr>
                  <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', opacity: 0.8 }}>
                    <Spinner /> Loading your requests...
                  </td>
                </tr>
              ) : myRequests.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
                    You haven't submitted any inquiries yet.
                  </td>
                </tr>
              ) : (
                myRequests.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(128,128,128,0.1)', verticalAlign: 'top' }}>
                    <td style={{ padding: '16px 12px', opacity: 0.8, fontSize: '0.9rem' }}>{r.created_at}</td>
                    <td style={{ padding: '16px 12px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{r.inquiry}</td>
                    <td style={{ padding: '16px 12px', fontWeight: '500' }}>{r.property_id || '-'}</td>
                    <td style={{ padding: '16px 12px', fontWeight: 'bold', color: getStatusColor(r.status) }}>
                      {r.status || 'Unsolved'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000";

const EXAMPLE_QUERIES = [
  "Hi, I'm interested in property REF-8821. Can I schedule a viewing this Friday morning? I'm in town for one day.",
  "Hi, I'm interested in property REF-8821. I'd love to schedule a viewing at your earliest convenience—no rush at all. Just let me know what times work best for you in the coming days or weeks. Thanks!",
  "Hello, is REF-4410 still available for rent? I can visit next Tuesday after 5 PM.",
  "I submitted a maintenance complaint for REF-1209 last week and haven't heard back. Please call me urgently.",
];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");
  const [view, setView] = useState(token ? "chat" : "login"); // 'login', 'chat', 'admin'
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Auth States
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Chat States
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  // Admin States
  const [records, setRecords] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'light' : 'dark');
  }, [isDarkMode]);

  const handleLogin = async (e, isRegister = false) => {
    e.preventDefault();
    setAuthError("");
    
    if (isRegister) {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, password, is_admin: phone.includes("admin") }),
      });
      if (!res.ok) {
        const data = await res.json();
        return setAuthError(data.detail || "Registration failed");
      }
      setAuthError("Registered! Please login.");
      return;
    }

    // Login
    const formData = new URLSearchParams();
    formData.append("username", phone);
    formData.append("password", password);

    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });

    if (res.ok) {
      const data = await res.json();
      setToken(data.access_token);
      setIsAdmin(data.is_admin);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("isAdmin", data.is_admin);
      setView(data.is_admin ? "admin" : "chat");
    } else {
      setAuthError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setToken("");
    setIsAdmin(false);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    setView("login");
    setChat([]);
  };

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

  const fetchAdminRecords = async () => {
    const res = await fetch(`${API_BASE}/admin/records`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setRecords(data);
    }
  };

  useEffect(() => {
    if (view === "admin" && token) fetchAdminRecords();
  }, [view, token]);

  // NEW: Handle Status Change
  const handleStatusChange = async (recordId, newStatus) => {
    // Optimistic UI update
    setRecords(records.map(r => r.id === recordId ? { ...r, status: newStatus } : r));
    
    try {
      await fetch(`${API_BASE}/admin/records/${recordId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  // --- RENDERS ---

  const inputStyle = {
    width: "100%",
    padding: "0.9rem 1.2rem",
    borderRadius: "20px",
    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
    background: isDarkMode ? "rgba(25, 28, 35, 0.6)" : "#ffffff",
    color: isDarkMode ? "#ffffff" : "#303030",
    marginBottom: "0.9rem",
    fontFamily: "inherit",
    fontSize: "1rem",
    boxShadow: isDarkMode ? "inset 0 2px 8px rgba(0,0,0,0.3)" : "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
    outline: "none"
  };

  if (view === "login") {
    return (
      <div className={`page ${isDarkMode ? 'dark-mode' : 'light-mode'}`} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className="chat-shell" style={{height: 'auto', width: '100%', maxWidth: '450px'}}>
          <div className="chat-header">
            <div className="header-content">
              <div>
                <h1>Real Estate AI Triage</h1>
                <p>Sign in to continue</p>
              </div>
              <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
          
          <div className="composer" style={{borderTop: 'none', padding: '2rem'}}>
            <form onSubmit={(e) => handleLogin(e, false)} style={{display: 'flex', flexDirection: 'column'}}>
              <label>Phone Number</label>
              <input 
                type="text" placeholder="Enter phone number..." value={phone} 
                onChange={e => setPhone(e.target.value)} required 
                style={inputStyle}
              />
              
              <label>Password</label>
              <input 
                type="password" placeholder="Enter password..." value={password} 
                onChange={e => setPassword(e.target.value)} required 
                style={inputStyle}
              />
              
              {authError && <p className="error input-error" style={{marginBottom: '1rem'}}>{authError}</p>}
              
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button type="submit" className="primary-btn" style={{flex: 1}}>Login</button>
                <button type="button" onClick={(e) => handleLogin(e, true)} className="example-btn" style={{flex: 1}}>
                  Register
                </button>
              </div>
              <p style={{fontSize: '12px', opacity: 0.6, marginTop: '1.5rem', textAlign: 'center'}}>
                  Laters Gators
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`page ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="chat-shell">
        <div className="chat-header">
          <div className="header-content">
            <div>
              <h1>{view === "admin" ? "Admin Dashboard" : "Real Estate AI Triage"}</h1>
              <p>{view === "admin" ? "Top 15 Urgent Inquiries" : "Chat-style inquiry analysis"}</p>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              {isAdmin && view === "chat" && <button className="example-btn" onClick={() => setView("admin")}>Admin View</button>}
              {isAdmin && view === "admin" && <button className="example-btn" onClick={() => setView("chat")}>Chat View</button>}
              <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button className="example-btn" onClick={handleLogout} style={{borderColor: '#ff453a', color: '#ff453a'}}>Logout</button>
            </div>
          </div>
        </div>

        {view === "chat" ? (
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
        ) : (
          <div className="chat-window" style={{padding: '0'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed'}}>
              <thead>
                <tr style={{background: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)'}}>
                  <th style={{padding: '16px 12px', width: '13%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'}}>Phone</th>
                  <th style={{padding: '16px 12px', width: '10%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'}}>Urgency</th>
                  <th style={{padding: '16px 12px', width: '12%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'}}>Intent</th>
                  <th style={{padding: '16px 12px', width: '40%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'}}>Full Inquiry</th>
                  <th style={{padding: '16px 12px', width: '10%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'}}>ID</th>
                  <th style={{padding: '16px 12px', width: '15%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} style={{borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', verticalAlign: 'top'}}>
                    <td style={{padding: '16px 12px', fontWeight: '500', wordBreak: 'break-all'}}>{r.phone_number}</td>
                    <td style={{
                      padding: '16px 12px', 
                      fontWeight: '600',
                      color: r.urgency === 'High' ? '#ff453a' : r.urgency === 'Medium' ? '#ff9f0a' : '#32d74b'
                    }}>
                      {r.urgency}
                    </td>
                    <td style={{padding: '16px 12px', wordBreak: 'break-word'}}>{r.intent}</td>
                    {/* The whitespace: pre-wrap style ensures the full inquiry is displayed and line breaks are respected */}
                    <td style={{padding: '16px 12px', whiteSpace: 'pre-wrap', lineHeight: '1.5', wordBreak: 'break-word'}}>
                      {r.inquiry}
                    </td>
                    <td style={{padding: '16px 12px', wordBreak: 'break-all'}}>{r.property_id || '-'}</td>
                    <td style={{padding: '16px 12px'}}>
                      <select 
                        value={r.status || "Unsolved"} 
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#fff',
                          color: isDarkMode ? '#fff' : '#000',
                          border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)',
                          outline: 'none',
                          cursor: 'pointer',
                          width: '100%',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="Unsolved">Unsolved</option>
                        <option value="Action Taken">Action Taken</option>
                        <option value="Solved">Solved</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{padding: '2rem', textAlign: 'center', opacity: 0.7}}>No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
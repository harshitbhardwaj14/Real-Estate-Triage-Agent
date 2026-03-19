export default function Header({ view, setView, isAdmin, isDarkMode, setIsDarkMode, handleLogout }) {
  return (
    <div className="chat-header">
      <div className="header-content">
        <div>
          <h1>
            {view === "login" ? "Real Estate AI Triage" : 
             view === "admin" ? "Admin Dashboard" : "Real Estate AI Triage"}
          </h1>
          <p>
            {view === "login" ? "Sign in to continue" : 
             view === "admin" ? "Top 15 Urgent Inquiries" : "Chat-style inquiry analysis"}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {view !== "login" && isAdmin && view === "chat" && (
            <button className="example-btn" onClick={() => setView("admin")}>Admin View</button>
          )}
          {view !== "login" && isAdmin && view === "admin" && (
            <button className="example-btn" onClick={() => setView("chat")}>Chat View</button>
          )}
          
          <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          {view !== "login" && (
            <button className="example-btn" onClick={handleLogout} style={{ borderColor: '#ff453a', color: '#ff453a' }}>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
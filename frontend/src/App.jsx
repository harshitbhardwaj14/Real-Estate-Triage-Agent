import { useState, useEffect } from "react";
import Header from "./components/Header";
import Login from "./components/Login";
import Chat from "./components/Chat";
import Admin from "./components/Admin";

export const API_BASE = "https://real-estate-triage-agent.onrender.com";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");
  const [view, setView] = useState(token ? "chat" : "login"); // 'login', 'chat', 'admin'
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'light' : 'dark');
  }, [isDarkMode]);

  const handleLogout = () => {
    setToken("");
    setIsAdmin(false);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    setView("login");
  };

  // Adjust container styles dynamically based on whether it's the login view
  const isLogin = view === "login";
  const pageStyle = isLogin ? { display: 'flex', justifyContent: 'center', alignItems: 'center' } : {};
  const shellStyle = isLogin ? { height: 'auto', width: '100%', maxWidth: '850px' } : {};

  return (
    <div className={`page ${isDarkMode ? 'dark-mode' : 'light-mode'}`} style={pageStyle}>
      <div className="chat-shell" style={shellStyle}>
        
        <Header 
          view={view} 
          setView={setView} 
          isAdmin={isAdmin} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          handleLogout={handleLogout} 
        />

        {view === "login" && (
          <Login 
            setToken={setToken} 
            setIsAdmin={setIsAdmin} 
            setView={setView} 
            isDarkMode={isDarkMode} 
          />
        )}

        {view === "chat" && (
          <Chat 
            token={token} 
            handleLogout={handleLogout} 
          />
        )}

        {view === "admin" && (
          <Admin 
            token={token} 
            isDarkMode={isDarkMode} 
          />
        )}

      </div>
    </div>
  );
}
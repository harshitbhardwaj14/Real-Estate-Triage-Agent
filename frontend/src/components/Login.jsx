import { useState } from "react";
import { API_BASE } from "../App";

// A sleek inline SVG spinner component
const Spinner = () => (
  <svg 
    width="18" height="18" viewBox="0 0 24 24" fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}
  >
    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"></circle>
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
  </svg>
);

export default function Login({ setToken, setIsAdmin, setView, isDarkMode }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Tracks which button was clicked

  const handleLogin = async (e, isRegister = false) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    setIsRegistering(isRegister);
    
    try {
      if (isRegister) {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: phone, password, is_admin: phone.includes("admin") }),
        });
        if (!res.ok) {
          const data = await res.json();
          setAuthError(data.detail || "Registration failed");
          return;
        }
        setAuthError("Registered! Please login.");
        return;
      }

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
    } catch (err) {
      setAuthError("Network error. Please check your connection.");
    } finally {
      // Ensure loading stops whether the request succeeds or fails
      setLoading(false);
      setIsRegistering(false);
    }
  };

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
    outline: "none",
    opacity: loading ? 0.7 : 1 // Dim inputs slightly while loading
  };

  const btnStyle = {
    flex: 1, 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center'
  };

  return (
    <div className="composer" style={{ borderTop: 'none', padding: '2rem' }}>
      <form onSubmit={(e) => handleLogin(e, false)} style={{ display: 'flex', flexDirection: 'column' }}>
        <label>Phone Number</label>
        <input 
          type="text" placeholder="Enter phone number..." value={phone} 
          onChange={e => setPhone(e.target.value)} required 
          style={inputStyle}
          disabled={loading}
        />
        
        <label>Password</label>
        <input 
          type="password" placeholder="Enter password..." value={password} 
          onChange={e => setPassword(e.target.value)} required 
          style={inputStyle}
          disabled={loading}
        />
        
        {authError && <p className="error input-error" style={{ marginBottom: '1rem' }}>{authError}</p>}
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            type="submit" 
            className="primary-btn" 
            style={btnStyle}
            disabled={loading}
          >
            {loading && !isRegistering ? <Spinner /> : null}
            {loading && !isRegistering ? "Logging in..." : "Login"}
          </button>
          
          <button 
            type="button" 
            onClick={(e) => handleLogin(e, true)} 
            className="example-btn" 
            style={btnStyle}
            disabled={loading}
          >
            {loading && isRegistering ? <Spinner /> : null}
            {loading && isRegistering ? "Registering..." : "Register"}
          </button>
        </div>
        <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '1.5rem', textAlign: 'center' }}>
            Laters Gators
        </p>
      </form>
    </div>
  );
}
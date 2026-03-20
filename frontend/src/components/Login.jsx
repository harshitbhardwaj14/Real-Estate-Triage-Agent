import { useState } from "react";
import { API_BASE } from "../App";

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
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    
    // Frontend Phone Validation
    if (!phone.includes("admin")) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        return setAuthError("Phone number must be exactly 10 digits.");
      }
    }

    setLoading(true);
    
    try {
      if (isRegisterMode) {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone_number: phone, password, is_admin: phone.includes("admin") }),
        });
        
        if (!res.ok) {
          const data = await res.json();
          setAuthError(data.detail || "Registration failed");
          return;
        }
        
        setAuthError("Registered successfully! You can now log in.");
        setTimeout(() => {
          setIsRegisterMode(false);
          setAuthError("");
        }, 2000);
        return;
      }

      // Login Flow
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
      setLoading(false);
    }
  };

  // --- Styles ---
  const inputStyle = {
    width: "100%",
    padding: "0.9rem 1.2rem",
    borderRadius: "16px",
    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
    background: isDarkMode ? "rgba(25, 28, 35, 0.6)" : "#ffffff",
    color: isDarkMode ? "#ffffff" : "#303030",
    marginBottom: "1rem",
    fontFamily: "inherit",
    fontSize: "1rem",
    boxShadow: isDarkMode ? "inset 0 2px 8px rgba(0,0,0,0.3)" : "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
    outline: "none",
    opacity: loading ? 0.7 : 1
  };

  const splitContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap', // This makes it stack on smaller screens!
    width: '100%',
    minHeight: '450px'
  };

  const formSideStyle = {
    flex: '1 1 350px', // Will take up half the space, but force wrap if screen is too small
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const welcomeSideStyle = {
    flex: '1 1 300px', // Will take up the other half
    padding: '3rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    background: isDarkMode 
      ? 'linear-gradient(135deg, rgba(28, 55, 85, 0.7), rgba(15, 30, 50, 0.9))' 
      : 'linear-gradient(135deg, rgba(7, 94, 84, 0.1), rgba(18, 140, 126, 0.15))',
    borderLeft: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
  };

  return (
    <div className="composer" style={{ borderTop: 'none', padding: 0, overflow: 'hidden', background: 'transparent' }}>
      
      {/* Inject animation keyframes */}
      <style>
        {`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-message {
            animation: fadeSlideUp 0.4s ease-out forwards;
          }
        `}
      </style>

      <div style={splitContainerStyle}>
        
        {/* LEFT SIDE: The Form */}
        <div style={formSideStyle}>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {isRegisterMode && (
              <>
                <label style={{ fontSize: '0.85rem', opacity: 0.9 }}>Full Name</label>
                <input 
                  type="text" placeholder="Enter your full name..." value={name} 
                  onChange={e => setName(e.target.value)} required={isRegisterMode} 
                  style={inputStyle} disabled={loading}
                />
              </>
            )}

            <label style={{ fontSize: '0.85rem', opacity: 0.9 }}>Phone Number</label>
            <input 
              type="text" placeholder={isRegisterMode ? "10-digit phone number..." : "Enter phone number..."} 
              value={phone} onChange={e => setPhone(e.target.value)} required 
              style={inputStyle} disabled={loading}
            />
            
            <label style={{ fontSize: '0.85rem', opacity: 0.9 }}>Password</label>
            <input 
              type="password" placeholder="Enter password..." value={password} 
              onChange={e => setPassword(e.target.value)} required 
              style={inputStyle} disabled={loading}
            />
            
            {authError && (
              <p className="error input-error" style={{ marginBottom: '1rem', color: authError.includes("successfully") ? "#32d74b" : undefined }}>
                {authError}
              </p>
            )}
            
            <div style={{ display: 'flex', marginTop: '10px' }}>
              <button type="submit" className="primary-btn" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '16px' }} disabled={loading}>
                {loading ? <Spinner /> : null}
                {loading ? (isRegisterMode ? "Registering..." : "Logging in...") : (isRegisterMode ? "Register" : "Login")}
              </button>
            </div>

            {/* Toggle Mode Button */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={() => { setIsRegisterMode(!isRegisterMode); setAuthError(""); }} 
                disabled={loading}
                style={{ 
                  background: 'transparent', border: 'none', cursor: 'pointer', 
                  color: isDarkMode ? '#3b82f6' : '#075e54', fontWeight: 500, textDecoration: 'underline',
                  fontSize: '0.9rem'
                }}
              >
                {isRegisterMode ? "Already have an account? Login here" : "Need an account? Register here"}
              </button>
            </div>
            
            <p style={{ fontSize: '11px', opacity: 0.4, marginTop: '2rem', textAlign: 'center' }}>
                Tip: Include "admin" in phone to bypass 10-digit rule.
            </p>
          </form>
        </div>

        {/* RIGHT SIDE: Welcome Card (Stacks on bottom for mobile) */}
        <div style={welcomeSideStyle}>
          <div key={isRegisterMode ? 'register' : 'login'} className="animate-message">
            {isRegisterMode ? (
              <>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', marginTop: 0, color: isDarkMode ? '#ffffff' : '#075e54' }}>
                  Join Us!
                </h2>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, opacity: 0.8, color: isDarkMode ? '#eef0f3' : '#303030' }}>
                  Create an account to easily submit property inquiries, schedule viewings, and keep track of your requests in one place.
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', marginTop: 0, color: isDarkMode ? '#ffffff' : '#075e54' }}>
                  Welcome Back!
                </h2>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, opacity: 0.8, color: isDarkMode ? '#eef0f3' : '#303030' }}>
                  Log in to seamlessly check your property inquiries, schedule viewings, and track the status of your maintenance requests.
                </p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
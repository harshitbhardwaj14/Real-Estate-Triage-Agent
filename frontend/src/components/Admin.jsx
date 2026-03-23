import { useState, useEffect } from "react";
import { API_BASE } from "../App";

// A sleek inline SVG spinner component
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

export default function Admin({ token, isDarkMode }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminRecords = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/admin/records`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRecords(data);
        }
      } catch (error) {
        console.error("Failed to fetch records:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminRecords();
  }, [token]);

  // Handle Status Change
  const handleStatusChange = async (recordId, newStatus) => {
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

  return (
    <div className="chat-window" style={{ padding: '0' }}>
      {/* ADDED: A responsive wrapper div for horizontal scrolling on mobile */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
        {/* ADDED: minWidth: '900px' prevents the table from squishing on mobile */}
        <table style={{ minWidth: '900px', width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)' }}>
              <th style={{ padding: '16px 12px', width: '12%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Name</th>
              <th style={{ padding: '16px 12px', width: '13%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Phone</th>
              <th style={{ padding: '16px 12px', width: '9%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Urgency</th>
              <th style={{ padding: '16px 12px', width: '11%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Intent</th>
              <th style={{ padding: '16px 12px', width: '33%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Full Inquiry</th>
              <th style={{ padding: '16px 12px', width: '8%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>ID</th>
              <th style={{ padding: '16px 12px', width: '14%', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '4rem 2rem', textAlign: 'center', opacity: 0.8, color: isDarkMode ? '#fff' : '#000' }}>
                  <Spinner /> Loading inquiries...
                </td>
              </tr>
            ) : 
            
            records.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '3rem 2rem', textAlign: 'center', opacity: 0.6, color: isDarkMode ? '#fff' : '#000' }}>
                  No records found.
                </td>
              </tr>
            ) : 
            
            records.map(r => (
              <tr key={r.id} style={{ borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', verticalAlign: 'top' }}>
                <td style={{ padding: '16px 12px', fontWeight: '500', wordBreak: 'break-word' }}>{r.name || 'N/A'}</td>
                <td style={{ padding: '16px 12px', fontWeight: '500', wordBreak: 'break-all' }}>{r.phone_number}</td>
                <td style={{
                  padding: '16px 12px', 
                  fontWeight: '600',
                  color: r.urgency === 'High' ? '#ff453a' : r.urgency === 'Medium' ? '#ff9f0a' : '#32d74b'
                }}>
                  {r.urgency}
                </td>
                <td style={{ padding: '16px 12px', wordBreak: 'break-word' }}>{r.intent}</td>
                <td style={{ padding: '16px 12px', whiteSpace: 'pre-wrap', lineHeight: '1.5', wordBreak: 'break-word' }}>
                  {r.inquiry}
                </td>
                <td style={{ padding: '16px 12px', wordBreak: 'break-all' }}>{r.property_id || '-'}</td>
                <td style={{ padding: '16px 12px' }}>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
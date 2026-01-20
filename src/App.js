import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [rawPayload, setRawPayload] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkHealth();
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      setApiOnline(res.ok);
      setError(null);
    } catch (e) {
      setApiOnline(false);
      setError(`Connection failed: ${e.message}`);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      setRawPayload(data);

      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setError(null);
      } else {
        setOrders([]);
        setError("API returned unexpected format");
      }
    } catch (e) {
      setError(`Failed to load orders: ${e.message}`);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "—";
    try {
      const date = new Date(iso);
      const eatDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
      return eatDate.toLocaleString("en-KE", { dateStyle: "short", timeStyle: "short" });
    } catch {
      return iso;
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>💳 ChatPesa Dashboard</h1>

      <div style={{
        padding: 12,
        marginBottom: 20,
        borderRadius: 8,
        background: apiOnline ? "#d4edda" : "#f8d7da",
        border: `1px solid ${apiOnline ? "#28a745" : "#dc3545"}`
      }}>
        <p style={{ margin: 0 }}>
          System Status: <strong style={{ color: apiOnline ? "green" : "red" }}>{apiOnline ? "✅ API ONLINE" : "❌ API OFFLINE"}</strong>
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#666" }}>Backend: {API_BASE}</p>
        {error && <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "red" }}>⚠️ {error}</p>}
      </div>

      <button onClick={fetchOrders} style={{ padding: "10px 20px", fontSize: 14, fontWeight: "bold", background: "#007bff", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>🔄 Refresh Now</button>

      <table border="1" cellPadding="12" style={{ marginTop: 20, width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead style={{ background: "#f8f9fa" }}>
          <tr>
            <th>Order ID</th>
            <th>Customer Phone</th>
            <th>Name</th>
            <th>Items</th>
            <th>Amount (KES)</th>
            <th>Status</th>
            <th>Receipt</th>
            <th>Created At (EAT)</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="8" align="center" style={{ padding: 30, color: "#999" }}>
                {apiOnline ? "No orders yet." : "Cannot load orders - API is offline"}
              </td>
            </tr>
          ) : (
            orders.map((o, index) => (
              <tr key={o.id || index} style={{
                background: o.status === 'paid' ? '#d4edda' :
                           o.status === 'awaiting_payment' ? '#fff3cd' : 'white'
              }}>
                <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>{o.id || "MISSING_ID"}</td>
                <td>{o.customer_phone || "—"}</td>
                <td>{o.name || "—"}</td>
                <td>{o.items || o.raw_message || "—"}</td>
                <td style={{ fontWeight: "bold" }}>{o.amount ? `KES ${o.amount.toLocaleString()}` : "—"}</td>
                <td>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: "bold",
                    background: o.status === 'paid' ? '#28a745' : '#ffc107',
                    color: 'white'
                  }}>{(o.status || "UNKNOWN").toUpperCase()}</span>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{o.receipt_number || "—"}</td>
                <td style={{ fontSize: 12, color: "#666" }}>{formatTime(o.created_at || o.timestamp)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <details style={{ marginTop: 30 }}>
        <summary style={{ cursor: "pointer", fontWeight: "bold", padding: 8, background: "#f0f0f0", borderRadius: 4 }}>🧪 Raw API Response</summary>
        <pre style={{ background: "#1e1e1e", color: "#4ec9b0", padding: 16, maxHeight: 400, overflow: "auto", fontSize: 12, borderRadius: 4, marginTop: 8 }}>
          {JSON.stringify(rawPayload, null, 2) || "No data yet"}
        </pre>
      </details>
    </div>
  );
}

export default App;

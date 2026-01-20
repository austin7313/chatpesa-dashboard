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
      const res = await fetch(`${API_BASE}/health`); // ✅ FIXED
      setApiOnline(res.ok);
      setError(null);
    } catch (e) {
      console.error("Health check failed:", e);
      setApiOnline(false);
      setError(`Connection failed: ${e.message}`);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`); // ✅ FIXED
      const data = await res.json();
      console.log("RAW API PAYLOAD:", data);
      setRawPayload(data);
      
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setError(null);
      } else {
        console.warn("Unexpected data format:", data);
        setError("API returned unexpected format");
      }
    } catch (e) {
      console.error("Fetch orders failed:", e);
      setError(`Failed to load orders: ${e.message}`);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "—";
    try {
      const date = new Date(iso);
      return date.toLocaleString("en-KE", {
        dateStyle: "short",
        timeStyle: "medium"
      });
    } catch {
      return iso;
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>💳 ChatPesa Dashboard</h1>
      
      {/* Status Bar */}
      <div style={{ 
        padding: 12, 
        marginBottom: 20, 
        borderRadius: 8,
        background: apiOnline ? "#d4edda" : "#f8d7da",
        border: `1px solid ${apiOnline ? "#28a745" : "#dc3545"}`
      }}>
        <p style={{ margin: 0 }}>
          System Status:{" "}
          <strong style={{ color: apiOnline ? "green" : "red" }}>
            {apiOnline ? "✅ API ONLINE" : "❌ API OFFLINE"}
          </strong>
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#666" }}>
          Backend: {API_BASE}
        </p>
        {error && (
          <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "red" }}>
            ⚠️ {error}
          </p>
        )}
      </div>

      <button 
        onClick={fetchOrders}
        style={{
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: "bold",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        🔄 Refresh Now
      </button>

      {/* Orders Table */}
      <table
        border="1"
        cellPadding="12"
        style={{ 
          marginTop: 20, 
          width: "100%", 
          borderCollapse: "collapse",
          fontSize: 14
        }}
      >
        <thead style={{ background: "#f8f9fa" }}>
          <tr>
            <th>Order ID</th>
            <th>Customer Phone</th>
            <th>Items</th>
            <th>Amount (KES)</th>
            <th>Status</th>
            <th>Receipt</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="7" align="center" style={{ padding: 30, color: "#999" }}>
                {apiOnline ? "No orders yet. Orders will appear here when customers message WhatsApp." : "Cannot load orders - API is offline"}
              </td>
            </tr>
          ) : (
            orders.map((o, index) => (
              <tr key={o.id || index} style={{ 
                background: o.status === 'paid' ? '#d4edda' : 
                           o.status === 'awaiting_payment' ? '#fff3cd' : 'white'
              }}>
                <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>
                  {o.id || "MISSING_ID"}
                </td>
                <td>{o.customer_phone || "—"}</td>
                <td>{o.items || o.raw_message || "—"}</td>
                <td style={{ fontWeight: "bold" }}>
                  {o.amount ? `KES ${o.amount.toLocaleString()}` : "—"}
                </td>
                <td>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: "bold",
                    background: o.status === 'paid' ? '#28a745' : 
                               o.status === 'awaiting_payment' ? '#ffc107' : '#6c757d',
                    color: 'white'
                  }}>
                    {(o.status || "UNKNOWN").toUpperCase()}
                  </span>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                  {o.receipt_number || o.mpesa_receipt || "—"}
                </td>
                <td style={{ fontSize: 12, color: "#666" }}>
                  {formatTime(o.created_at || o.timestamp)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Stats Summary */}
      {orders.length > 0 && (
        <div style={{ 
          marginTop: 20, 
          padding: 16, 
          background: "#f8f9fa", 
          borderRadius: 8,
          display: "flex",
          gap: 20,
          justifyContent: "space-around"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>{orders.length}</div>
            <div style={{ fontSize: 12, color: "#666" }}>Total Orders</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#28a745" }}>
              {orders.filter(o => o.status === 'paid').length}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>Paid</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#ffc107" }}>
              {orders.filter(o => o.status === 'awaiting_payment').length}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>Pending</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#28a745" }}>
              KES {orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>Total Revenue</div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      <details style={{ marginTop: 30 }}>
        <summary style={{ 
          cursor: "pointer", 
          fontWeight: "bold", 
          padding: 8,
          background: "#f0f0f0",
          borderRadius: 4
        }}>
          🧪 Raw API Response (Click to expand)
        </summary>
        <pre
          style={{
            background: "#1e1e1e",
            color: "#4ec9b0",
            padding: 16,
            maxHeight: 400,
            overflow: "auto",
            fontSize: 12,
            borderRadius: 4,
            marginTop: 8
          }}
        >
          {JSON.stringify(rawPayload, null, 2) || "No data yet"}
        </pre>
      </details>
    </div>
  );
}

export default App;

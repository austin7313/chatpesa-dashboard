import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE;

function App() {
  const [orders, setOrders] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error("Health check failed");
      const data = await res.json();
      if (data.status === "ok") {
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch (err) {
      console.error("❌ Health check error:", err);
      setApiOnline(false);
      setLastError("Health check failed");
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) throw new Error("Orders fetch failed");
      const data = await res.json();
      setOrders(data.orders || []);
      setLastError(null);
    } catch (err) {
      console.error("❌ Orders fetch error:", err);
      setLastError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await fetchHealth();
    await fetchOrders();
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status) => {
    if (!status) return "#999";
    if (status === "PAID") return "#2ecc71";
    if (status === "PENDING") return "#f39c12";
    if (status === "FAILED") return "#e74c3c";
    return "#3498db";
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>💳 ChatPesa Dashboard</h1>

      <div style={{ marginBottom: "15px" }}>
        <strong>System Status:</strong>{" "}
        <span
          style={{
            color: apiOnline ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {apiOnline ? "API ONLINE" : "API OFFLINE"}
        </span>

        <button
          onClick={refreshAll}
          style={{
            marginLeft: "15px",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {lastError && (
        <div
          style={{
            background: "#ffe6e6",
            color: "#c0392b",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "4px",
          }}
        >
          ⚠️ {lastError}
        </div>
      )}

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Order #</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Amount (KES)</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Receipt</th>
              <th style={thStyle}>Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={tdStyle}>{o.id}</td>
                <td style={tdStyle}>{o.phone}</td>
                <td style={tdStyle}>{o.amount}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      color: statusColor(o.status),
                      fontWeight: "bold",
                    }}
                  >
                    {o.status}
                  </span>
                </td>
                <td style={tdStyle}>{o.receipt || "-"}</td>
                <td style={tdStyle}>{o.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Hidden debug panel (console only) */}
      {console.log("📡 API_BASE:", API_BASE)}
      {console.log("📦 Orders:", orders)}
      {console.log("🧠 API Online:", apiOnline)}
    </div>
  );
}

const thStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  background: "#f0f0f0",
  textAlign: "center",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  textAlign: "center",
};

export default App;

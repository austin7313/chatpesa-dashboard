import React, { useEffect, useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- HEALTH CHECK ----
  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      setApiOnline(res.ok);
    } catch {
      setApiOnline(false);
    }
  };

  // ---- FETCH ORDERS ----
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();

      if (Array.isArray(data.orders)) {
        setOrders(data.orders);
        setError(null);
      } else {
        setOrders([]);
        setError("Unexpected API response");
      }
    } catch (e) {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // ---- AUTO REFRESH ----
  useEffect(() => {
    checkHealth();
    fetchOrders();

    const interval = setInterval(() => {
      checkHealth();
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-KE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const statusBadge = (status) => {
    const map = {
      awaiting_payment: { bg: "#fff3cd", text: "#856404" },
      paid: { bg: "#d4edda", text: "#155724" },
      failed: { bg: "#f8d7da", text: "#721c24" },
    };

    const s = map[status] || { bg: "#e2e3e5", text: "#383d41" };

    return (
      <span
        style={{
          background: s.bg,
          color: s.text,
          padding: "4px 10px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: "bold",
        }}
      >
        {(status || "unknown").toUpperCase()}
      </span>
    );
  };

  return (
    <div style={{ fontFamily: "Inter, Arial", background: "#f4f6f8", minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          background: "#111",
          color: "#fff",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>💳 ChatPesa Dashboard</h2>

        <button
          style={{
            background: apiOnline ? "#28a745" : "#dc3545",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 20,
            fontWeight: "bold",
            cursor: "default",
          }}
        >
          {apiOnline ? "🟢 API ONLINE" : "🔴 API OFFLINE"}
        </button>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 24 }}>
        {error && (
          <div style={{ color: "red", marginBottom: 12 }}>⚠️ {error}</div>
        )}

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          }}
        >
          <table width="100%" cellPadding="12">
            <thead style={{ background: "#f1f3f5" }}>
              <tr>
                <th align="left">Order ID</th>
                <th align="left">Name</th>
                <th align="left">Items</th>
                <th align="right">Amount</th>
                <th align="center">Status</th>
                <th align="left">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" align="center" style={{ padding: 40 }}>
                    Loading orders…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" align="center" style={{ padding: 40 }}>
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>
                      {o.id}
                    </td>
                    <td>{o.customer_name || "—"}</td>
                    <td>{o.items}</td>
                    <td align="right">
                      KES {Number(o.amount || 0).toLocaleString()}
                    </td>
                    <td align="center">{statusBadge(o.status)}</td>
                    <td>{formatTime(o.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
          🔄 Auto-refresh every 5 seconds
        </p>
      </div>
    </div>
  );
}

export default App;

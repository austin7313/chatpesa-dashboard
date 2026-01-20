import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_BASE = process.env.REACT_APP_API_BASE || "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [rawPayload, setRawPayload] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkHealth();
    fetchOrders();

    // WebSocket setup
    const socket = io(API_BASE);
    socket.on("connect", () => console.log("WebSocket connected"));
    socket.on("disconnect", () => console.log("WebSocket disconnected"));

    socket.on("new_order", (order) => {
      setOrders((prev) => [...prev, order]);
      setRawPayload({ ...rawPayload, orders: [...orders, order] });
    });

    socket.on("payment_update", (updatedOrder) => {
      setOrders((prev) => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      setRawPayload({ ...rawPayload, orders: orders.map(o => o.id === updatedOrder.id ? updatedOrder : o) });
    });

    return () => socket.disconnect();
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
      setOrders(data.orders || []);
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
      <h1>💳 ChatPesa Dashboard (Real-Time)</h1>

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
            orders.map((o) => (
              <tr key={o.id} style={{ background: o.status === 'paid' ? '#d4edda' : '#fff3cd' }}>
                <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>{o.id}</td>
                <td>{o.customer_phone}</td>
                <td>{o.name || "—"}</td>
                <td>{o.items || o.raw_message}</td>
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
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{o.receipt_number}</td>
                <td style={{ fontSize: 12, color: "#666" }}>{formatTime(o.created_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;

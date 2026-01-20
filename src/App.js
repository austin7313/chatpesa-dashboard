import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [rawPayload, setRawPayload] = useState(null);

  useEffect(() => {
    checkHealth();
    fetchOrders();
    const i = setInterval(fetchOrders, 5000);
    return () => clearInterval(i);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      setApiOnline(res.ok);
    } catch {
      setApiOnline(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();

      console.log("RAW API PAYLOAD:", data);
      setRawPayload(data);

      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Fetch orders failed:", e);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("en-KE");
    } catch {
      return iso;
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>💳 ChatPesa Dashboard</h1>

      <p>
        System Status:{" "}
        <strong style={{ color: apiOnline ? "green" : "red" }}>
          {apiOnline ? "API ONLINE" : "API OFFLINE"}
        </strong>
      </p>

      <button onClick={fetchOrders}>🔄 Refresh</button>

      <table
        border="1"
        cellPadding="8"
        style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Phone</th>
            <th>Amount (KES)</th>
            <th>Status</th>
            <th>Receipt</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="6" align="center">
                No orders yet
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id || Math.random()}>
                <td>{o.id || "MISSING_ID"}</td>
                <td>{o.customer_phone}</td>
                <td>{o.amount}</td>
                <td>{(o.status || "").toUpperCase()}</td>
                <td>{o.receipt_number || "-"}</td>
                <td>{formatTime(o.created_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* HARD DEBUG PANEL */}
      <h3 style={{ marginTop: 30 }}>🧪 Raw API Payload</h3>
      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 12,
          maxHeight: 300,
          overflow: "auto",
          fontSize: 12,
        }}
      >
        {JSON.stringify(rawPayload, null, 2)}
      </pre>
    </div>
  );
}

export default App;

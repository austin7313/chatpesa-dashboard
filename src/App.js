import React, { useEffect, useState } from "react";

const API_BASE = "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [status, setStatus] = useState("CHECKING");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();

      if (data.status === "ok") {
        setOrders(data.orders || []);
        setStatus("ONLINE");
        setError("");
      } else {
        setStatus("ERROR");
        setError("Invalid API response");
      }
    } catch (err) {
      setStatus("OFFLINE");
      setError("Failed to fetch API");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h2>💳 ChatPesa Dashboard</h2>

      <p>
        System Status:{" "}
        {status === "ONLINE" && "✅ API ONLINE"}
        {status === "OFFLINE" && "❌ API OFFLINE"}
        {status === "CHECKING" && "⏳ Checking..."}
        {status === "ERROR" && "⚠️ API ERROR"}
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={fetchOrders}>🔄 Refresh Now</button>

      <table
        border="1"
        cellPadding="8"
        style={{ marginTop: 20, borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Phone</th>
            <th>Name</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="7">No orders yet.</td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_phone}</td>
                <td>{o.customer_name || "—"}</td>
                <td>{o.items}</td>
                <td>{o.amount}</td>
                <td>{o.status}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;

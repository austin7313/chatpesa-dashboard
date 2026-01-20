import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("offline");
  const [raw, setRaw] = useState(null);
  const backend = "https://chatpesa-whatsapp.onrender.com";

  // Fetch orders function
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${backend}/orders`);
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      setRaw(data);
      setOrders(data.orders || []);
      setStatus("online");
    } catch (err) {
      console.error(err);
      setStatus("offline");
      setRaw(null);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>💳 ChatPesa Dashboard</h1>
      <p>
        System Status:{" "}
        <span style={{ color: status === "online" ? "green" : "red" }}>
          {status === "online" ? "✅ API ONLINE" : "❌ API OFFLINE"}
        </span>
      </p>
      <p>Backend: <a href={backend}>{backend}</a></p>
      <button onClick={fetchOrders}>🔄 Refresh Now</button>

      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Order ID</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Customer Phone</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Name</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Items</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Amount (KES)</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Status</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Receipt</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Created At (EAT)</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ padding: "8px" }}>
                {status === "online" ? "No orders yet." : "Cannot load orders - API is offline"}
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.orderId}>
                <td style={{ padding: "8px" }}>{o.orderId}</td>
                <td style={{ padding: "8px" }}>{o.customerPhone}</td>
                <td style={{ padding: "8px" }}>
                  {o.mpesaName || o.name || "—"}
                </td>
                <td style={{ padding: "8px" }}>{o.items || "—"}</td>
                <td style={{ padding: "8px" }}>{o.amount || "—"}</td>
                <td style={{ padding: "8px" }}>{o.status || "—"}</td>
                <td style={{ padding: "8px" }}>{o.receipt || "—"}</td>
                <td style={{ padding: "8px" }}>{o.createdAt || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3>🧪 Raw API Response</h3>
      <pre
        style={{
          background: "#f4f4f4",
          padding: "10px",
          maxHeight: "300px",
          overflow: "auto",
        }}
      >
        {JSON.stringify(raw, null, 2)}
      </pre>
    </div>
  );
}

export default App;

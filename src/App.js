import React, { useEffect, useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://chatpesa-whatsapp.onrender.com";

export default function App() {
  const [status, setStatus] = useState("Checking API...");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    checkAPI();
  }, []);

  async function checkAPI() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      if (data.status === "ok") {
        setStatus("API ONLINE");
        fetchOrders();
      } else {
        setStatus("API ERROR");
      }
    } catch (e) {
      setStatus("API OFFLINE");
    }
  }

  async function fetchOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error("Orders fetch failed", e);
    }
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>💳 ChatPesa Dashboard</h1>

      <h3>
        System Status:{" "}
        <span
          style={{
            color:
              status === "API ONLINE"
                ? "green"
                : status === "API OFFLINE"
                ? "red"
                : "orange",
          }}
        >
          {status}
        </span>
      </h3>

      <button onClick={checkAPI} style={{ marginBottom: 20 }}>
        🔄 Refresh
      </button>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Phone</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Receipt</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="6">No orders yet</td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.phone}</td>
                <td>KES {o.amount}</td>
                <td>{o.status}</td>
                <td>{o.receipt || "-"}</td>
                <td>{o.created_at}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

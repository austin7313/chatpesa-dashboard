import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_BASE = process.env.REACT_APP_API_BASE || "https://chatpesa-whatsapp.onrender.com";
const socket = io(API_BASE);

function App() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
    socket.on("new_order", (order) => setOrders((prev) => [...prev, order]));
    socket.on("update_order", (updated) => {
      setOrders((prev) => prev.map(o => o.id === updated.id ? updated : o));
    });
    return () => {
      socket.off("new_order");
      socket.off("update_order");
    };
  }, []);

  const fetchOrders = async () => {
    const res = await fetch(`${API_BASE}/orders`);
    const data = await res.json();
    if (data.orders) setOrders(data.orders);
  };

  const formatTime = (iso) => {
    if (!iso) return "—";
    const date = new Date(iso);
    return date.toLocaleString("en-KE", { dateStyle: "short", timeStyle: "short" });
  };

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>💳 ChatPesa Dashboard</h1>
      <button onClick={fetchOrders}>🔄 Refresh Now</button>
      <table border="1" cellPadding="12" style={{ marginTop: 20, width: "100%" }}>
        <thead>
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
            <tr><td colSpan="8" align="center">No orders yet.</td></tr>
          ) : orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer_phone}</td>
              <td>{o.name || "—"}</td>
              <td>{o.items}</td>
              <td>{o.amount || "—"}</td>
              <td>{o.status}</td>
              <td>{o.receipt_number}</td>
              <td>{formatTime(o.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;

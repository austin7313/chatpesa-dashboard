import React, { useEffect, useState } from "react";

const API = "https://YOUR-BACKEND.onrender.com";

export default function App() {
  const [orders, setOrders] = useState([]);
  const [online, setOnline] = useState(false);

  const fetchOrders = async () => {
    try {
      const r = await fetch(`${API}/orders`);
      const d = await r.json();
      setOrders(d.orders || []);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const i = setInterval(fetchOrders, 5000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>💳 ChatPesa Dashboard</h2>
      <p>{online ? "🟢 ONLINE" : "🔴 API OFFLINE"}</p>

      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Name</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan="6">No orders yet</td>
            </tr>
          )}

          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.status === "PAID" ? o.customer_name : o.customer_phone}</td>
              <td>{o.items}</td>
              <td>KES {o.amount}</td>
              <td>{o.status}</td>
              <td>
                {o.paid_at
                  ? new Date(o.paid_at).toLocaleString()
                  : new Date(o.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

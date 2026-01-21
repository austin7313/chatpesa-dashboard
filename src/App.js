import React, { useEffect, useState } from "react";

const API_URL = "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (data.status === "ok") {
        setOrders(data.orders);
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch {
      setApiOnline(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const i = setInterval(fetchOrders, 5000);
    return () => clearInterval(i);
  }, []);

  const statusColor = (s) =>
    s === "PAID" ? "green" : s === "AWAITING_PAYMENT" ? "orange" : "red";

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h2>ChatPesa Dashboard</h2>

      <div style={{ marginBottom: 10 }}>
        API Status:{" "}
        <b style={{ color: apiOnline ? "green" : "red" }}>
          {apiOnline ? "ONLINE" : "OFFLINE"}
        </b>
      </div>

      <table width="100%" cellPadding="10" border="1">
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
          {orders.length === 0 ? (
            <tr>
              <td colSpan="6" align="center">
                No orders yet
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{o.items}</td>
                <td>KES {o.amount}</td>
                <td style={{ color: statusColor(o.status) }}>{o.status}</td>
                <td>
                  {o.paid_at
                    ? new Date(o.paid_at).toLocaleString()
                    : new Date(o.created_at).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;

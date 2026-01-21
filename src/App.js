import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [orders, setOrders] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("https://chatpesa-whatsapp.onrender.com/orders");
      const data = await res.json();
      if (data.status === "ok") {
        setOrders(data.orders);
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch (err) {
      console.error(err);
      setApiOnline(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>💳 ChatPesa Dashboard</h1>
      <p>
        API Status:{" "}
        <span
          style={{
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            backgroundColor: apiOnline ? "green" : "red"
          }}
        >
          {apiOnline ? "ONLINE" : "OFFLINE"}
        </span>
      </p>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Items</th>
              <th>Amount (KES)</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{o.items}</td>
                <td>{o.amount}</td>
                <td>{o.status}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;

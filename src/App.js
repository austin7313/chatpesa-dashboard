import React, { useEffect, useState } from "react";

function App() {
  const [orders, setOrders] = useState([]);
  const [apiStatus, setApiStatus] = useState(false);
  const API_URL = "https://chatpesa-whatsapp.onrender.com";

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (data.status === "ok") {
        setOrders(data.orders || []);
        setApiStatus(true);
      } else {
        setApiStatus(false);
      }
    } catch (err) {
      setApiStatus(false);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>ChatPesa Dashboard</h1>
      <div style={{ marginBottom: "20px" }}>
        <span
          style={{
            display: "inline-block",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: apiStatus ? "green" : "red",
            marginRight: "10px",
          }}
        ></span>
        API Status: {apiStatus ? "ONLINE" : "OFFLINE"}
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>
              Order ID
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>
              Name
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>
              Items
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>
              Amount (KES)
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>
              Status
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>
              Time
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: "20px", textAlign: "center" }}>
                No orders yet
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td style={{ borderBottom: "1px solid #eee", padding: "10px" }}>
                  {order.id}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "10px" }}>
                  {order.customer_name}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "10px" }}>
                  {order.items}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "10px" }}>
                  KES {order.amount}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "10px" }}>
                  {order.status}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "10px" }}>
                  {new Date(order.created_at).toLocaleString()}
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

import { useEffect, useState } from "react";

const API_URL = "https://YOUR-RENDER-URL.onrender.com"; 
// ⚠️ CHANGE THIS to your real Render backend URL

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data.orders || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  useEffect(() => {
    fetchOrders();                 // initial load
    const interval = setInterval(fetchOrders, 5000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>📊 ChatPesa Dashboard</h1>

      {loading && <p>Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <p>No orders yet.</p>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 10,
            borderRadius: 6
          }}
        >
          <strong>Order ID:</strong> {order.id}<br />
          <strong>Customer:</strong> {order.customer}<br />
          <strong>Items:</strong> {order.items}<br />
          <strong>Amount:</strong> KES {order.amount}<br />
          <strong>Status:</strong> {order.status}
        </div>
      ))}
    </div>
  );
}

export default App;

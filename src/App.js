import { useEffect, useState } from "react";

const API_URL = "https://chatpesa-whatsapp.onrender.com";

export default function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) return <h2>Loading orders...</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>💳 ChatPesa Dashboard</h1>

      {orders.length === 0 && <p>No orders yet.</p>}

      {orders.map(order => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ddd",
            padding: 10,
            marginBottom: 10
          }}
        >
          <strong>{order.id}</strong><br />
          {order.customer}<br />
          {order.items}<br />
          <b>KES {order.amount}</b><br />
          Status: {order.status}
        </div>
      ))}
    </div>
  );
}

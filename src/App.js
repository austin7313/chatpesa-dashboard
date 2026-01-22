import React, { useEffect, useState } from "react";

const API_URL = "https://chatpesa-whatsapp.onrender.com";

export default function App() {
  const [orders, setOrders] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (data.status === "ok") {
        setOrders(data.orders);
        setApiOnline(true);
      } else setApiOnline(false);
    } catch {
      setApiOnline(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID": return "#16a34a";
      case "AWAITING_PAYMENT": return "#f59e0b";
      case "FAILED": return "#dc2626";
      default: return "#6b7280";
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>ChatPesa Dashboard</h1>
        <div>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: apiOnline ? "green" : "red",
              marginRight: 8,
            }}
          />
          API {apiOnline ? "ONLINE" : "OFFLINE"}
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by Order ID or Name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginTop: 20, padding: 10, width: "100%", maxWidth: 400, borderRadius: 8, border: "1px solid #ddd" }}
      />

      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Order ID", "Name", "Phone", "Items", "Amount", "Status", "Time"].map((h) => (
                <th key={h} style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #ddd" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: 20, textAlign: "center" }}>No orders yet</td></tr>
            ) : filteredOrders.map((order) => (
              <tr key={order.id}>
                <td style={{ padding: 12, fontWeight: 600 }}>{order.id}</td>
                <td style={{ padding: 12 }}>{order.customer_name}</td>
                <td style={{ padding: 12 }}>{order.customer_phone}</td>
                <td style={{ padding: 12 }}>{order.items}</td>
                <td style={{ padding: 12 }}>KES {order.amount}</td>
                <td style={{ padding: 12, fontWeight: "bold", color: getStatusColor(order.status) }}>{order.status}</td>
                <td style={{ padding: 12 }}>{order.paid_at ? new Date(order.paid_at).toLocaleString() : new Date(order.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";

const API_URL = "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (data.status === "ok") {
        setOrders(data.orders || []);
        setApiOnline(true);
      } else setApiOnline(false);
    } catch (err) {
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
    (o) => o.id.toLowerCase().includes(search.toLowerCase()) ||
           o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 24, fontFamily: "Inter, Arial, sans-serif" }}>
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
        style={{
          marginTop: 20,
          padding: 10,
          width: "100%",
          maxWidth: 400,
          borderRadius: 8,
          border: "1px solid #ddd",
        }}
      />

      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Order ID", "Name", "Items", "Amount", "Status", "Time"].map((h) => (
                <th key={h} style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #ddd" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: 20, textAlign: "center" }}>No orders yet</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} style={{ cursor: "pointer" }} onClick={() => setSelectedOrder(order)}>
                  <td style={{ padding: 12, color: "#2563eb", fontWeight: 600 }}>{order.id}</td>
                  <td style={{ padding: 12 }}>{order.customer_name}</td>
                  <td style={{ padding: 12 }}>{order.items}</td>
                  <td style={{ padding: 12 }}>KES {order.amount}</td>
                  <td style={{ padding: 12, color: getStatusColor(order.status), fontWeight: "bold" }}>{order.status}</td>
                  <td style={{ padding: 12 }}>{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: 24, borderRadius: 12, width: "90%", maxWidth: 400 }}>
            <h3>Order {selectedOrder.id}</h3>
            <p><b>Name:</b> {selectedOrder.customer_name}</p>
            <p><b>Phone:</b> {selectedOrder.customer_phone}</p>
            <p><b>Items:</b> {selectedOrder.items}</p>
            <p><b>Amount:</b> KES {selectedOrder.amount}</p>
            <p><b>Status:</b> <span style={{ color: getStatusColor(selectedOrder.status) }}>{selectedOrder.status}</span></p>
            <p><b>M-Pesa TX:</b> {selectedOrder.mpesa_transaction || "N/A"}</p>
            <button onClick={() => setSelectedOrder(null)} style={{ marginTop: 20, padding: "10px 16px", borderRadius: 8, border: "none", background: "#111827", color: "#fff", cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

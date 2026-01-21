import React, { useEffect, useState } from "react";

const API_URL = "https://chatpesa-whatsapp.onrender.com";

export default function App() {
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
      case "PAID":
        return "#16a34a";
      case "AWAITING_PAYMENT":
        return "#f59e0b";
      case "FAILED":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  // --- Analytics Calculations ---
  const today = new Date().toDateString();
  const ordersToday = orders.filter(
    (o) => new Date(o.created_at).toDateString() === today
  );
  const totalReceived = ordersToday
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + o.amount, 0);
  const pendingPayments = ordersToday.filter(
    (o) => o.status === "AWAITING_PAYMENT"
  ).length;

  return (
    <div style={{ padding: 24, fontFamily: "Inter, Arial, sans-serif" }}>
      {/* Header */}
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

      {/* Analytics Panel */}
      <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
        <div style={{ flex: 1, background: "#f3f4f6", padding: 16, borderRadius: 12 }}>
          <h3>Total Orders Today</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{ordersToday.length}</p>
        </div>
        <div style={{ flex: 1, background: "#f3f4f6", padding: 16, borderRadius: 12 }}>
          <h3>Total Received (KES)</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{totalReceived}</p>
        </div>
        <div style={{ flex: 1, background: "#f3f4f6", padding: 16, borderRadius: 12 }}>
          <h3>Pending Payments</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{pendingPayments}</p>
        </div>
      </div>

      {/* Search */}
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

      {/* Orders Table */}
      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Order ID", "Name", "Items", "Amount", "Status", "Time", "Txn ID"].map((h) => (
                <th key={h} style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: 20, textAlign: "center" }}>
                  No orders yet
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => setSelectedOrder(o)}>
                  <td style={{ padding: 12, color: "#2563eb", fontWeight: 600 }}>{o.id}</td>
                  <td style={{ padding: 12 }}>{o.customer_name}</td>
                  <td style={{ padding: 12 }}>{o.items}</td>
                  <td style={{ padding: 12 }}>KES {o.amount}</td>
                  <td style={{ padding: 12, color: getStatusColor(o.status), fontWeight: "bold" }}>
                    {o.status}
                  </td>
                  <td style={{ padding: 12 }}>{new Date(o.created_at).toLocaleString()}</td>
                  <td style={{ padding: 12 }}>{o.transaction_id || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Modal */}
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
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", padding: 24, borderRadius: 12, width: "90%", maxWidth: 400 }}
          >
            <h3>Order {selectedOrder.id}</h3>
            <p><b>Name:</b> {selectedOrder.customer_name}</p>
            <p><b>Phone:</b> {selectedOrder.customer_phone}</p>
            <p><b>Items:</b> {selectedOrder.items}</p>
            <p><b>Amount:</b> KES {selectedOrder.amount}</p>
            <p><b>Status:</b> <span style={{ color: getStatusColor(selectedOrder.status) }}>{selectedOrder.status}</span></p>
            <p><b>Time:</b> {new Date(selectedOrder.created_at).toLocaleString()}</p>
            <p><b>Transaction ID:</b> {selectedOrder.transaction_id || "-"}</p>
            <p><b>Paid At:</b> {selectedOrder.paid_at ? new Date(selectedOrder.paid_at).toLocaleString() : "-"}</p>
            <button
              onClick={() => setSelectedOrder(null)}
              style={{ marginTop: 20, padding: "10px 16px", borderRadius: 8, border: "none", background: "#111827", color: "#fff", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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

      if (Array.isArray(data)) {
        setOrders(data);
        setApiOnline(true);
      } else if (data.status === "ok") {
        setOrders(data.orders || []);
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
      setApiOnline(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const i = setInterval(fetchOrders, 4000);
    return () => clearInterval(i);
  }, []);

  const statusColor = (s) => {
    if (s === "PAID") return "#16a34a";
    if (s === "PENDING" || s === "AWAITING_PAYMENT") return "#f59e0b";
    if (s === "FAILED") return "#dc2626";
    return "#6b7280";
  };

  const filtered = orders.filter((o) =>
    [o.id, o.customer, o.phone]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>ChatPesa Dashboard</h2>
        <div>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              display: "inline-block",
              marginRight: 6,
              background: apiOnline ? "#16a34a" : "#dc2626",
            }}
          />
          {apiOnline ? "ONLINE" : "OFFLINE"}
        </div>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by order, name or phone"
        style={{
          marginTop: 16,
          padding: 10,
          width: "100%",
          maxWidth: 420,
          borderRadius: 8,
          border: "1px solid #ddd",
        }}
      />

      {/* Table */}
      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", textAlign: "left" }}>
              <th>Order</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                  No orders yet
                </td>
              </tr>
            )}

            {filtered.map((o) => (
              <tr
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                style={{ cursor: "pointer", borderBottom: "1px solid #eee" }}
              >
                <td style={{ fontWeight: 600, color: "#2563eb" }}>{o.id}</td>
                <td>{o.customer || "—"}</td>
                <td>{o.phone}</td>
                <td>KES {o.amount}</td>
                <td style={{ color: statusColor(o.status), fontWeight: 600 }}>
                  {o.status}
                </td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              width: 360,
            }}
          >
            <h3>Order {selectedOrder.id}</h3>
            <p><b>Name:</b> {selectedOrder.customer}</p>
            <p><b>Phone:</b> {selectedOrder.phone}</p>
            <p><b>Amount:</b> KES {selectedOrder.amount}</p>
            <p>
              <b>Status:</b>{" "}
              <span style={{ color: statusColor(selectedOrder.status) }}>
                {selectedOrder.status}
              </span>
            </p>

            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                marginTop: 16,
                padding: "8px 14px",
                border: "none",
                borderRadius: 6,
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

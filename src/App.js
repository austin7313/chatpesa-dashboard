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

  const paidOrders = orders.filter(o => o.status === "PAID");
  const pendingOrders = orders.filter(o => o.status === "AWAITING_PAYMENT");
  const totalPaid = paidOrders.reduce((s, o) => s + o.amount, 0);

  const filteredOrders = orders.filter(
    o =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const badgeStyle = status => ({
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background:
      status === "PAID" ? "#dcfce7" :
      status === "AWAITING_PAYMENT" ? "#fef3c7" :
      "#e5e7eb",
    color:
      status === "PAID" ? "#166534" :
      status === "AWAITING_PAYMENT" ? "#92400e" :
      "#374151"
  });

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: 24 }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        border: "1px solid #e5e7eb"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0 }}>ChatPesa Dashboard</h2>
            <p style={{ margin: "6px 0", color: "#6b7280", fontSize: 14 }}>
              Live WhatsApp → M-Pesa payments
            </p>
          </div>
          <div style={{ fontSize: 13, color: apiOnline ? "#166534" : "#991b1b" }}>
            ● API {apiOnline ? "ONLINE" : "OFFLINE"}
          </div>
        </div>

        {/* Modest Summary */}
        <div style={{
          display: "flex",
          gap: 24,
          fontSize: 14,
          marginBottom: 20,
          color: "#374151"
        }}>
          <div><b>{orders.length}</b> orders</div>
          <div><b>{pendingOrders.length}</b> pending</div>
          <div><b>KES {totalPaid.toLocaleString()}</b> collected</div>
        </div>

        {/* Search */}
        <input
          placeholder="Search by Order ID or Name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 360,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            marginBottom: 20
          }}
        />

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb", textAlign: "left" }}>
              {["Order", "Customer", "Amount", "Status", "Created"].map(h => (
                <th key={h} style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                  No orders
                </td>
              </tr>
            ) : (
              filteredOrders.map(o => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #f1f5f9"
                  }}
                >
                  <td style={{ padding: 12, fontWeight: 600, color: "#2563eb" }}>{o.id}</td>
                  <td style={{ padding: 12 }}>
                    {o.customer_name.startsWith("whatsapp:") ? o.phone : o.customer_name}
                  </td>
                  <td style={{ padding: 12 }}>KES {o.amount}</td>
                  <td style={{ padding: 12 }}>
                    <span style={badgeStyle(o.status)}>{o.status}</span>
                  </td>
                  <td style={{ padding: 12, color: "#6b7280" }}>
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
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
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#fff", padding: 24, borderRadius: 12, width: 360 }}
          >
            <h3 style={{ marginTop: 0 }}>Order {selectedOrder.id}</h3>
            <p><b>Name:</b> {selectedOrder.customer_name}</p>
            <p><b>Phone:</b> {selectedOrder.phone}</p>
            <p><b>Amount:</b> KES {selectedOrder.amount}</p>
            <p><b>Status:</b> {selectedOrder.status}</p>
            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                marginTop: 16,
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "#111827",
                color: "#fff",
                cursor: "pointer"
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

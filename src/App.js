import React, { useEffect, useState, useRef } from "react";

const API_URL = "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toasts, setToasts] = useState([]);
  const previousPaidRef = useRef(new Set());

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (data.status === "ok") {
        const newOrders = data.orders || [];
        setOrders(newOrders);
        setApiOnline(true);

        // Check for newly paid orders
        const currentPaidIds = new Set(newOrders.filter(o => o.status === "PAID").map(o => o.id));
        currentPaidIds.forEach(id => {
          if (!previousPaidRef.current.has(id)) {
            const order = newOrders.find(o => o.id === id);
            showToast(`✅ Payment received: ${order.customer_name.startsWith("whatsapp:") ? order.phone : order.customer_name} KES ${order.amount}`);
          }
        });
        previousPaidRef.current = currentPaidIds;

      } else {
        setApiOnline(false);
      }
    } catch (err) {
      setApiOnline(false);
    }
  };

  // Auto-refresh every 5s
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "#16a34a"; // green
      case "AWAITING_PAYMENT":
        return "#f59e0b"; // yellow
      case "FAILED":
        return "#dc2626"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  // Toast logic
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (o.mpesa_receipt || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 24, fontFamily: "Inter, Arial, sans-serif", background: "#f3f4f6", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>ChatPesa Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: apiOnline ? "#16a34a" : "#dc2626",
            }}
          />
          <span style={{ fontWeight: "600", color: "#111827" }}>API {apiOnline ? "ONLINE" : "OFFLINE"}</span>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by Order ID, Name, or Receipt..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: 10,
          width: "100%",
          maxWidth: 400,
          borderRadius: 8,
          border: "1px solid #d1d5db",
          marginBottom: 20,
        }}
      />

      {/* Orders List */}
      <div style={{ display: "grid", gap: 12 }}>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            No orders yet
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "transform 0.1s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.01)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <div>
                <div style={{ fontWeight: 600, color: "#2563eb" }}>{order.id}</div>
                <div>{order.customer_name.startsWith("whatsapp:") ? order.phone : order.customer_name}</div>
                <div style={{ color: "#6b7280", fontSize: 14 }}>{order.phone}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600 }}>KES {order.amount}</div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: getStatusColor(order.status) + "33",
                    color: getStatusColor(order.status),
                    marginTop: 4,
                  }}
                >
                  {order.status}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  {order.mpesa_receipt || "-"}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toast notifications */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: "#16a34a",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            marginBottom: 8,
            fontWeight: 600,
            minWidth: 220
          }}>
            {t.message}
          </div>
        ))}
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
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              width: "90%",
              maxWidth: 400,
            }}
          >
            <h3>Order {selectedOrder.id}</h3>
            <p><b>Name:</b> {selectedOrder.customer_name.startsWith("whatsapp:") ? selectedOrder.phone : selectedOrder.customer_name}</p>
            <p><b>Phone:</b> {selectedOrder.phone}</p>
            <p><b>Amount:</b> KES {selectedOrder.amount}</p>
            <p><b>Status:</b> <span style={{ color: getStatusColor(selectedOrder.status) }}>{selectedOrder.status}</span></p>
            <p><b>Receipt:</b> {selectedOrder.mpesa_receipt || "-"}</p>
            <p><b>Time:</b> {new Date(selectedOrder.created_at).toLocaleString()}</p>

            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                marginTop: 20,
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
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

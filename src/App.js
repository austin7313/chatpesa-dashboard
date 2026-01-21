import React, { useEffect, useState } from "react";

const API_URL = "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" or "subscriptions"

  // Fetch orders and subscriptions
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }

      const subRes = await fetch(`${API_URL}/subscriptions`);
      const subData = await subRes.json();
      if (subData.success) {
        setSubscriptions(subData.subscriptions || []);
      }
    } catch (err) {
      setApiOnline(false);
    }
  };

  // Auto refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "#16a34a"; // green
      case "AWAITING_PAYMENT":
      case "PENDING":
        return "#f59e0b"; // yellow
      case "FAILED":
        return "#dc2626"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter(
    (s) =>
      s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      s.plan_name.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Tabs */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => setActiveTab("orders")}
          style={{
            padding: "8px 16px",
            marginRight: 8,
            borderRadius: 6,
            border: activeTab === "orders" ? "2px solid #2563eb" : "1px solid #ddd",
            background: activeTab === "orders" ? "#e0f2fe" : "#fff",
            cursor: "pointer",
          }}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: activeTab === "subscriptions" ? "2px solid #2563eb" : "1px solid #ddd",
            background: activeTab === "subscriptions" ? "#e0f2fe" : "#fff",
            cursor: "pointer",
          }}
        >
          Subscriptions
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by Order ID, Name or Plan..."
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

      {/* Table */}
      <div style={{ marginTop: 20, overflowX: "auto" }}>
        {activeTab === "orders" ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Order ID", "Name", "Items", "Amount", "Status", "Time"].map((h) => (
                  <th key={h} style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #ddd" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: "center" }}>
                    No orders yet
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} style={{ cursor: "pointer" }} onClick={() => setSelectedItem(order)}>
                    <td style={{ padding: 12, color: "#2563eb", fontWeight: 600 }}>{order.id}</td>
                    <td style={{ padding: 12 }}>{order.customer_name}</td>
                    <td style={{ padding: 12 }}>{order.items}</td>
                    <td style={{ padding: 12 }}>KES {order.amount}</td>
                    <td style={{ padding: 12, color: getStatusColor(order.status), fontWeight: "bold" }}>
                      {order.status}
                    </td>
                    <td style={{ padding: 12 }}>{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Customer", "Plan", "Amount", "Status", "Next Due", "Paid At"].map((h) => (
                  <th key={h} style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #ddd" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: "center" }}>
                    No subscriptions yet
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub, idx) => (
                  <tr key={idx} style={{ cursor: "pointer" }} onClick={() => setSelectedItem(sub)}>
                    <td style={{ padding: 12 }}>{sub.customer_name}</td>
                    <td style={{ padding: 12 }}>{sub.plan_name}</td>
                    <td style={{ padding: 12 }}>KES {sub.amount}</td>
                    <td style={{ padding: 12, color: getStatusColor(sub.status), fontWeight: "bold" }}>
                      {sub.status}
                    </td>
                    <td style={{ padding: 12 }}>{sub.next_due}</td>
                    <td style={{ padding: 12 }}>
                      {sub.paid_at ? new Date(sub.paid_at).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
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
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              width: "90%",
              maxWidth: 400,
            }}
          >
            {activeTab === "orders" ? (
              <>
                <h3>Order {selectedItem.id}</h3>
                <p><b>Name:</b> {selectedItem.customer_name}</p>
                <p><b>Phone:</b> {selectedItem.customer_phone}</p>
                <p><b>Items:</b> {selectedItem.items}</p>
                <p><b>Amount:</b> KES {selectedItem.amount}</p>
                <p><b>Status:</b> <span style={{ color: getStatusColor(selectedItem.status) }}>{selectedItem.status}</span></p>
                <p><b>Time:</b> {new Date(selectedItem.created_at).toLocaleString()}</p>
              </>
            ) : (
              <>
                <h3>Subscription</h3>
                <p><b>Customer:</b> {selectedItem.customer_name}</p>
                <p><b>Phone:</b> {selectedItem.customer_phone}</p>
                <p><b>Plan:</b> {selectedItem.plan_name}</p>
                <p><b>Amount:</b> KES {selectedItem.amount}</p>
                <p><b>Status:</b> <span style={{ color: getStatusColor(selectedItem.status) }}>{selectedItem.status}</span></p>
                <p><b>Next Due:</b> {selectedItem.next_due}</p>
                <p><b>Paid At:</b> {selectedItem.paid_at ? new Date(selectedItem.paid_at).toLocaleString() : "-"}</p>
              </>
            )}
            <button
              onClick={() => setSelectedItem(null)}
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

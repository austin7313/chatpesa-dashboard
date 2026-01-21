import React, { useEffect, useState } from "react";

const API_URL = "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tab, setTab] = useState("orders");

  // Fetch orders
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
    } catch (err) {
      setApiOnline(false);
    }
  };

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`${API_URL}/subscriptions`);
      const data = await res.json();
      if (data.status === "ok") setSubscriptions(data.subscriptions || []);
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
    fetchSubscriptions();
    const interval = setInterval(() => {
      fetchOrders();
      fetchSubscriptions();
    }, 5000);
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

  const filteredSubs = subscriptions.filter(
    (s) =>
      s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_phone.toLowerCase().includes(search.toLowerCase())
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

      {/* Tabs */}
      <div style={{ marginTop: 20 }}>
        <button onClick={() => setTab("orders")}>Orders</button>
        <button onClick={() => setTab("subscriptions")}>Subscriptions</button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by Order ID / Name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginTop: 20, padding: 10, width: "100%", maxWidth: 400 }}
      />

      {tab === "orders" && (
        <table style={{ width: "100%", marginTop: 20 }}>
          <thead>
            <tr>
              {["Order ID", "Name", "Items", "Amount", "Status", "Time"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6">No orders yet</td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} onClick={() => setSelectedOrder(o)}>
                  <td>{o.id}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.items}</td>
                  <td>KES {o.amount}</td>
                  <td style={{ color: getStatusColor(o.status) }}>{o.status}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {tab === "subscriptions" && (
        <table style={{ width: "100%", marginTop: 20 }}>
          <thead>
            <tr>
              {["Subscription ID", "Name", "Phone", "Amount", "Next Payment", "Last Paid"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSubs.length === 0 ? (
              <tr>
                <td colSpan="6">No subscriptions yet</td>
              </tr>
            ) : (
              filteredSubs.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.customer_name}</td>
                  <td>{s.customer_phone}</td>
                  <td>KES {s.amount}</td>
                  <td>{new Date(s.next_payment_date).toLocaleString()}</td>
                  <td>{s.last_paid_at ? new Date(s.last_paid_at).toLocaleString() : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;

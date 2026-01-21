import React, { useEffect, useState } from "react";

const API_BASE = "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("CHECKING");
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();

      if (data.status === "ok") {
        setOrders(data.orders || []);
        setStatus("ONLINE");
        setRaw(data);
        setError(null);
      } else {
        throw new Error("API returned error");
      }
    } catch (err) {
      setStatus("OFFLINE");
      setError(err.message);
      setRaw(null);
    }
  };

  useEffect(() => {
    // Initial load
    fetchOrders();

    // Auto-refresh every 5 seconds (SAFE POLLING)
    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>💳 ChatPesa Dashboard</h2>

      <p>
        System Status:{" "}
        {status === "ONLINE" ? "✅ API ONLINE" : "❌ API OFFLINE"}
      </p>

      <p>Backend: {API_BASE}</p>

      <button onClick={fetchOrders}>🔄 Refresh Now</button>

      <table
        border="1"
        cellPadding="8"
        style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Phone</th>
            <th>Name</th>
            <th>Items</th>
            <th>Amount (KES)</th>
            <th>Status</th>
            <th>Receipt</th>
            <th>Created At (EAT)</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No orders yet.
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_phone}</td>
                <td>{o.name || "—"}</td>
                <td>{o.items}</td>
                <td>{o.amount || "—"}</td>
                <td>{o.status}</td>
                <td>{o.receipt_number}</td>
                <td>
                  {new Date(o.created_at).toLocaleString("en-KE")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h4 style={{ marginTop: 30 }}>🧪 Raw API Response</h4>
      <pre>{JSON.stringify(raw, null, 2)}</pre>

      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
    </div>
  );
}

export default App;

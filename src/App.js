import { useEffect, useState } from "react";

const API_URL = "https://chatpesa-whatsapp.onrender.com";

export default function App() {
  const [orders, setOrders] = useState([]);
  const [online, setOnline] = useState(false);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, { cache: "no-store" });
      if (!res.ok) throw new Error("API down");
      const data = await res.json();
      setOrders(data);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const i = setInterval(fetchOrders, 3000);
    return () => clearInterval(i);
  }, []);

  const badge = (status) => {
    const base = {
      padding: "4px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      color: "#fff",
      display: "inline-block",
    };
    if (status === "PAID") return { ...base, background: "#16a34a" };
    if (status === "FAILED") return { ...base, background: "#dc2626" };
    return { ...base, background: "#f59e0b" };
  };

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>ChatPesa Dashboard</h2>
        <div style={{ fontWeight: 600 }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: online ? "#16a34a" : "#dc2626",
              marginRight: 8,
            }}
          />
          API {online ? "ONLINE" : "OFFLINE"}
        </div>
      </div>

      {/* Search */}
      <input
        placeholder="Search order or name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginTop: 16,
          padding: 10,
          borderRadius: 10,
          border: "1px solid #ddd",
          width: 280,
        }}
      />

      {/* Table */}
      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <table width="100%" cellPadding="12">
          <thead>
            <tr style={{ textAlign: "left", background: "#f9fafb" }}>
              <th>Order</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Receipt</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 40 }}>
                  No transactions yet
                </td>
              </tr>
            )}

            {filtered.map((o) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ fontWeight: 600, color: "#2563eb" }}>{o.id}</td>
                <td>{o.customer || "—"}</td>
                <td>{o.phone}</td>
                <td>KES {o.amount}</td>
                <td>
                  <span style={badge(o.status)}>{o.status}</span>
                </td>
                <td>{o.mpesa_receipt || "—"}</td>
                <td>
                  {o.created_at
                    ? new Date(o.created_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

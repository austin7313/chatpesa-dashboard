import React, { useEffect, useState } from "react";

const API_BASE = "https://chatpesa-whatsapp.onrender.com";

const StatusBadge = ({ status }) => {
  const map = {
    AWAITING_PAYMENT: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
};

export default function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [online, setOnline] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
      setOnline(true);
      setError(null);
    } catch (e) {
      setOnline(false);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 5000); // auto-refresh
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">💳 ChatPesa Dashboard</h1>
          <p className="text-sm text-slate-600">Realtime WhatsApp → Orders</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${online ? "text-green-600" : "text-red-600"}`}>
            {online ? "● API ONLINE" : "● API OFFLINE"}
          </span>
          <button onClick={fetchOrders} className="px-3 py-2 rounded-md bg-black text-white text-sm hover:bg-slate-800">Refresh</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        {loading && (
          <div className="p-6 text-center text-slate-500">Loading orders…</div>
        )}
        {error && (
          <div className="p-6 text-center text-red-600">{error}</div>
        )}
        {!loading && !error && (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">No orders yet</td></tr>
              )}
              {orders.map(o => (
                <tr key={o.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-mono">{o.id}</td>
                  <td className="p-3">{o.customer_name || "—"}</td>
                  <td className="p-3">{o.items}</td>
                  <td className="p-3 font-semibold">KES {o.amount}</td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                  <td className="p-3 text-slate-500">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      <footer className="max-w-6xl mx-auto mt-4 text-xs text-slate-400">
        Auto-refresh every 5s • Backend: {API_BASE}
      </footer>
    </div>
  );
}

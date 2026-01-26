import React, { useEffect, useState } from "react";

function statusColor(status) {
  switch (status) {
    case "AWAITING_PAYMENT":
      return "bg-yellow-100 text-yellow-800";
    case "PAID":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch orders every 3 seconds
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/orders");
        const data = await res.json();
        setOrders(data.orders);
      } catch (e) {
        console.error("Failed to fetch orders:", e);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders based on search
  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.phone.includes(search) ||
    (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase()))
  );

  // CSV Export
  const exportCSV = () => {
    const header = "Order ID,Customer Name,Phone,Amount,Status,Created At,Paid At,Mpesa Receipt\n";
    const rows = filteredOrders.map(o =>
      `${o.id},${o.customer_name || ""},${o.phone},${o.amount},${o.status},${new Date(o.created_at).toLocaleString()},${o.paid_at ? new Date(o.paid_at).toLocaleString() : ""},${o.mpesa_receipt || ""}`
    ).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chatpesa_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ChatPesa Dashboard – Live Orders</h1>

      <div className="flex mb-4 items-center space-x-2">
        <input
          type="text"
          placeholder="Search by Order ID, Name, Phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Order ID</th>
              <th className="border px-2 py-1">Customer Name</th>
              <th className="border px-2 py-1">Phone</th>
              <th className="border px-2 py-1">Amount (KES)</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Created At</th>
              <th className="border px-2 py-1">Paid At</th>
              <th className="border px-2 py-1">Mpesa Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{o.id}</td>
                  <td className="border px-2 py-1">{o.customer_name || "-"}</td>
                  <td className="border px-2 py-1">{o.phone}</td>
                  <td className="border px-2 py-1">{o.amount}</td>
                  <td className={`border px-2 py-1 font-bold text-center ${statusColor(o.status)}`}>
                    {o.status}
                  </td>
                  <td className="border px-2 py-1">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="border px-2 py-1">{o.paid_at ? new Date(o.paid_at).toLocaleString() : "-"}</td>
                  <td className="border px-2 py-1">{o.mpesa_receipt || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

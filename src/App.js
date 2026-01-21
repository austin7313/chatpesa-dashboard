import React, { useEffect, useState } from "react";

const API_BASE = "https://chatpesa-whatsapp.onrender.com";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    AWAITING_PAYMENT: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      label: "Awaiting Payment"
    },
    PAID: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      label: "Paid"
    },
    CANCELLED: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      label: "Cancelled"
    },
    DEFAULT: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      label: status
    }
  };

  const config = statusConfig[status] || statusConfig.DEFAULT;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${config.bg.replace('bg-', 'bg-').replace('-50', '-400')}`}></span>
      {config.label}
    </span>
  );
};

const TableSkeleton = () => (
  <div className="animate-pulse space-y-3 p-6">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

const OnlineIndicator = ({ isOnline }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
    <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
      {isOnline ? 'System Online' : 'System Offline'}
    </span>
  </div>
);

export default function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [online, setOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
      const data = await res.json();
      setOrders(data.orders || []);
      setOnline(true);
      setError(null);
      setLastUpdated(new Date());
    } catch (e) {
      setOnline(false);
      setError(e.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">💳</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">ChatPesa Dashboard</h1>
                  <p className="text-gray-500 text-sm">Real-time WhatsApp Orders Monitoring</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <OnlineIndicator isOnline={online} />
              <div className="hidden md:block h-6 w-px bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-200 active:scale-95 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
              <p className="text-sm text-blue-600 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
              <p className="text-sm text-green-600 font-medium">Paid Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'PAID').length}
              </p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl">
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'AWAITING_PAYMENT').length}
              </p>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
              <p className="text-sm text-gray-600 font-medium">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(orders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0))}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {formatDate(lastUpdated)}
              </p>
            )}
          </div>

          {loading && <TableSkeleton />}
          
          {error && !loading && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load orders</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Order ID</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Customer</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Items</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Amount</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-gray-500">No orders found</p>
                        <p className="text-sm text-gray-400 mt-1">Orders will appear here when received</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-4">
                          <div className="font-mono text-sm text-gray-900 font-medium">{order.id}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{order.customer_name || "—"}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-700 max-w-xs truncate">{order.items}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{formatCurrency(order.amount)}</div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-6 text-center">
          <div className="text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>Auto-refresh every 5 seconds</span>
            <span className="hidden sm:block">•</span>
            <span>Backend: <code className="bg-gray-100 px-2 py-1 rounded text-gray-600">{API_BASE}</code></span>
          </div>
        </footer>
      </div>
    </div>
  );
}

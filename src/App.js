const socket = io("https://chatpesa-whatsapp.onrender.com");

const statusEl = document.getElementById("system-status");
const ordersTable = document.getElementById("orders-table");
const rawApi = document.getElementById("raw-api");

async function fetchOrders() {
  try {
    const res = await fetch("https://chatpesa-whatsapp.onrender.com/orders");
    const data = await res.json();

    rawApi.textContent = JSON.stringify(data, null, 2);

    if (data.orders.length === 0) {
      ordersTable.innerHTML = "<tr><td colspan='8'>No orders yet.</td></tr>";
    } else {
      ordersTable.innerHTML = data.orders.map(o => `
        <tr>
          <td>${o.order_id}</td>
          <td>${o.customer_phone}</td>
          <td>${o.name}</td>
          <td>${o.items}</td>
          <td>${o.amount}</td>
          <td>${o.status}</td>
          <td>${o.receipt}</td>
          <td>${o.created_at}</td>
        </tr>
      `).join("");
    }

    statusEl.textContent = "✅ API ONLINE";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "❌ API OFFLINE";
    ordersTable.innerHTML = "<tr><td colspan='8'>Cannot load orders - API is offline</td></tr>";
    rawApi.textContent = "null";
  }
}

// WebSocket listener
socket.on("new_order", (order) => {
  fetchOrders();
});

// Initial fetch
fetchOrders();

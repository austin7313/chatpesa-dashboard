import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL = "https://chatpesa-whatsapp.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("CONNECTING");

  useEffect(() => {
    // 1️⃣ Fetch orders safely
    fetch(`${API_URL}/orders`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setStatus("API ONLINE");
      })
      .catch(() => {
        setStatus("API OFFLINE");
      });

    // 2️⃣ Socket connection (NON-BLOCKING)
    try {
      const socket = io(API_URL, {
        transports: ["websocket"],
        reconnection: true,
      });

      socket.on("connect", () => {
        console.log("Socket connected");
      });

      socket.on("order_update", (order) => {
        setOrders((prev) => [order, ...prev]);
      });

      return () => socket.disconnect();
    } catch (e) {
      console.warn("Socket disabled:", e.message);
    }
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>💳 ChatPesa Dashboard</h1>
      <p>
        System Status:{" "}
        <strong>{status === "API ONLINE" ? "✅ API ONLINE" : "❌ API OFFLINE"}</strong>
      </p>

      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Phone</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="5">No orders yet</td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.orderId}>
                <td>{o.orderId}</td>
                <td>{o.phone}</td>
                <td>{o.description}</td>
                <td>{o.status}</td>
                <td>{o.created_at}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;

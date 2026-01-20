from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)

DATA_FILE = "orders.json"

# ------------------------
# Helpers
# ------------------------

def load_orders():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_orders(orders):
    with open(DATA_FILE, "w") as f:
        json.dump(orders, f, indent=2)

def generate_order_id(orders):
    if not orders:
        return "ORD-0001"
    last_id = orders[-1].get("id", "ORD-0000")
    try:
        num = int(last_id.split("-")[1])
    except:
        num = len(orders)
    return f"ORD-{num + 1:04d}"

# ------------------------
# Routes
# ------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/orders", methods=["GET"])
def get_orders():
    orders = load_orders()
    return jsonify({
        "status": "ok",
        "orders": orders
    }), 200


@app.route("/orders", methods=["POST"])
def create_order():
    data = request.json or {}
    orders = load_orders()

    order_id = generate_order_id(orders)
    created_at = datetime.utcnow().isoformat()

    order = {
        "id": order_id,
        "customer_phone": data.get("customer_phone", "unknown"),
        "customer_name": data.get("customer_name", "Customer"),
        "items": data.get("items", ""),
        "amount": data.get("amount", 0),
        "status": data.get("status", "awaiting_payment"),
        "receipt_number": data.get("receipt_number"),
        "created_at": created_at
    }

    orders.append(order)
    save_orders(orders)

    return jsonify({
        "status": "ok",
        "order": order
    }), 201


# ------------------------
# Test Seed Endpoint (TEMP)
# ------------------------
# Hit this once to generate a fake paid order
# You can delete this later

@app.route("/debug/seed", methods=["POST"])
def seed_order():
    orders = load_orders()

    order_id = generate_order_id(orders)
    created_at = datetime.utcnow().isoformat()

    fake_order = {
        "id": order_id,
        "customer_phone": "whatsapp:+254722275271",
        "customer_name": "Test User",
        "items": "Pilau x1",
        "amount": 10,
        "status": "paid",
        "receipt_number": f"RCP{len(orders)+1:04d}",
        "created_at": created_at
    }

    orders.append(fake_order)
    save_orders(orders)

    return jsonify({
        "status": "ok",
        "order": fake_order
    }), 201


if __name__ == "__main__":
    app.run(debug=True)

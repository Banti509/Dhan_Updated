
from flask import Blueprint, jsonify, request
from dhan_backend.utils.dhan_helpers import generate_signature
from config import API_KEY, BASE_URL
import time
import requests

cancel_order_bp = Blueprint("cancel_order", __name__)

def get_open_orders(symbol):
    """Fetch all open orders for a given symbol."""
    params = {
        "symbol": symbol,
        "timestamp": int(time.time() * 1000),
    }
    params["signature"] = generate_signature(params)

    headers = {"X-MBX-APIKEY": API_KEY}
    response = requests.get(f"{BASE_URL}/fapi/v1/openOrders", params=params, headers=headers)

    if response.status_code == 200:
        return response.json()
    return None  # Return None if unable to fetch orders

@cancel_order_bp.route("/cancel-order", methods=["DELETE"])
def cancel_order():
    """Cancels an existing Binance Futures order"""
    data = request.get_json()
    symbol = data.get("symbol")
    order_id = str(data.get("orderId"))  # Convert orderId to string

    if not order_id:
        return jsonify({"error": "Missing order ID"}), 400

    # 🔍 Step 1: Fetch all orders (to check order status)
    params = {
        "symbol": symbol,
        "timestamp": int(time.time() * 1000),
    }
    params["signature"] = generate_signature(params)
    
    headers = {"X-MBX-APIKEY": API_KEY}
    response = requests.get(f"{BASE_URL}/fapi/v1/allOrders", params=params, headers=headers)
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch orders", "details": response.json()}), 400

    all_orders = response.json()
    
    # 🔎 Step 2: Find the order in all orders
    order_info = next((order for order in all_orders if str(order["orderId"]) == order_id), None)

    if not order_info:
        return jsonify({"error": "Order does not exist"}), 400

    if order_info["status"] in ["FILLED", "CANCELED", "EXPIRED"]:
        return jsonify({"error": f"Cannot cancel order. Current status: {order_info['status']}"}), 400

    # ✅ Step 3: Proceed to cancel the order
    params = {
        "symbol": symbol,
        "orderId": order_id,
        "timestamp": int(time.time() * 1000),
    }
    params["signature"] = generate_signature(params)

    response = requests.delete(f"{BASE_URL}/fapi/v1/order", params=params, headers=headers)

    if response.status_code == 200:
        return jsonify({"message": "Order successfully canceled", "response": response.json()})

    return jsonify({"error": "Failed to cancel order", "details": response.json()}), 400

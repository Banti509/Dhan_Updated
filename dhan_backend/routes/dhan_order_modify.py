

# from flask import Blueprint, jsonify, request
# from utils.binance_helpers import generate_signature
# from config import API_KEY, BASE_URL
# import time
# import requests

# modify_order_bp = Blueprint("modify_order", __name__)

# @modify_order_bp.route("/modify-order", methods=["PUT"])
# def modify_order():
#     """Modifies an existing Binance Futures order by canceling and re-creating it"""
#     data = request.get_json()
#     symbol = data.get("symbol", "BTCUSDT")
#     order_id = data.get("orderId")  # ✅ Order ID to modify
#     new_price = data.get("new_price")  # ✅ New price (for LIMIT orders)
#     new_quantity = data.get("new_quantity")  # ✅ New quantity

#     if not order_id:
#         return jsonify({"error": "Missing order ID"}), 400

#     # 🔍 Step 1: Cancel the existing order
#     cancel_params = {
#         "symbol": symbol,
#         "orderId": order_id,
#         "timestamp": int(time.time() * 1000),
#     }
#     cancel_params["signature"] = generate_signature(cancel_params)

#     headers = {"X-MBX-APIKEY": API_KEY}
#     cancel_response = requests.delete(f"{BASE_URL}/fapi/v1/order", params=cancel_params, headers=headers)

#     if cancel_response.status_code != 200:
#         return jsonify({"error": "Failed to cancel existing order", "details": cancel_response.json()}), 400

#     # ✅ Step 2: Place a new order with modified parameters
#     new_order_params = {
#         "symbol": symbol,
#         "side": "BUY",  # ✅ Keep the same side (do not modify it)
#         "type": "LIMIT",  # ✅ Use LIMIT or MARKET order as required
#         "quantity": new_quantity,
#         "price": new_price,
#         "timeInForce": "GTC",  # ✅ Required for LIMIT orders
#         "timestamp": int(time.time() * 1000),
#     }
#     new_order_params["signature"] = generate_signature(new_order_params)

#     new_order_response = requests.post(f"{BASE_URL}/fapi/v1/order", params=new_order_params, headers=headers)

#     if new_order_response.status_code == 200:
#         return jsonify({"message": "Order successfully modified", "response": new_order_response.json()})

#     return jsonify({"error": "Failed to place modified order", "details": new_order_response.json()}), 400







from flask import Blueprint, jsonify, request
from dhan_backend.utils.dhan_helpers import generate_signature
from config import API_KEY, BASE_URL
import time
import requests

modify_order_bp = Blueprint("modify_order", __name__)

@modify_order_bp.route("/modify-order", methods=["PUT"])
def modify_order():
    """Modifies an existing Binance Futures order by canceling and re-creating it"""
    try:
        data = request.get_json()
        symbol = data.get("symbol", "BTCUSDT")
        order_id = data.get("orderId")  # ✅ Order ID to modify
        new_price = data.get("new_price")  # ✅ New price (for LIMIT orders)
        new_quantity = data.get("new_quantity")  # ✅ New quantity

        if not order_id:
            return jsonify({"error": "Missing order ID"}), 400

        headers = {"X-MBX-APIKEY": API_KEY}

        # 🔍 Step 1: Check if the order exists
        check_params = {
            "symbol": symbol,
            "orderId": order_id,
            "timestamp": int(time.time() * 1000),
        }
        check_params["signature"] = generate_signature(check_params)

        check_response = requests.get(f"{BASE_URL}/fapi/v1/order", params=check_params, headers=headers)

        if check_response.status_code != 200:
            return jsonify({
                "error": "Order not found",
                "details": check_response.json()
            }), 400

        # 🔍 Step 2: Cancel the existing order
        cancel_params = {
            "symbol": symbol,
            "orderId": order_id,
            "timestamp": int(time.time() * 1000),
        }
        cancel_params["signature"] = generate_signature(cancel_params)

        cancel_response = requests.delete(f"{BASE_URL}/fapi/v1/order", params=cancel_params, headers=headers)

        if cancel_response.status_code != 200:
            return jsonify({
                "error": "Failed to cancel existing order",
                "details": cancel_response.json()
            }), 400

        # ✅ Step 3: Place a new order with modified parameters
        new_order_params = {
            "symbol": symbol,
            "side": "BUY",  # ✅ Keep the same side (do not modify it)
            "type": "LIMIT",  # ✅ Use LIMIT or MARKET order as required
            "quantity": new_quantity,
            "price": new_price,
            "timeInForce": "GTC",  # ✅ Required for LIMIT orders
            "timestamp": int(time.time() * 1000),
        }
        new_order_params["signature"] = generate_signature(new_order_params)

        new_order_response = requests.post(f"{BASE_URL}/fapi/v1/order", params=new_order_params, headers=headers)

        if new_order_response.status_code == 200:
            return jsonify({"message": "Order successfully modified", "response": new_order_response.json()})

        return jsonify({
            "error": "Failed to place modified order",
            "details": new_order_response.json()
        }), 400

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "API request failed", "details": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Unexpected server error", "details": str(e)}), 500

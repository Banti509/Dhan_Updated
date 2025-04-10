# # from flask import Blueprint, jsonify, request
# # from config import API_KEY, API_SECRET, BASE_URL  # Ensure API_SECRET is imported
# # from binance.client import Client

# # sell_order_bp = Blueprint("sell_order", __name__)

# # # Initialize Binance client
# # client = Client(API_KEY, API_SECRET)

# # @sell_order_bp.route('/api/sell_order', methods=['POST'])
# # def sell_order():
# #     try:
# #         data = request.json
# #         symbol = data.get("symbol")
# #         quantity = data.get("quantity")

# #         if not symbol or not quantity:
# #             return jsonify({"error": "Symbol and quantity are required"}), 400

# #         try:
# #             quantity = float(quantity)  # Ensure quantity is a float
# #         except ValueError:
# #             return jsonify({"error": "Invalid quantity format"}), 400

# #         # Place a market sell order
# #         order = client.order_market_sell(
# #             symbol=symbol.upper(),  # Ensure the symbol is uppercase (Binance requirement)
# #             quantity=quantity   
# #         )

# #         return jsonify({
# #             "message": "Sell order placed successfully",
# #             "order_id": order.get("orderId"),
# #             "symbol": order.get("symbol"),
# #             "status": order.get("status"),
# #             "executed_qty": order.get("executedQty"),
# #             "price": order["fills"][0]["price"] if order.get("fills") else "Market Price",
# #         })

# #     except Exception as e:
# #         return jsonify({"error": str(e)}), 500




# from flask import Flask, Blueprint, jsonify, request
# from binance.client import Client
# from binance.exceptions import BinanceAPIException
# from config import API_KEY, API_SECRET, BASE_URL
# import traceback

# app = Flask(__name__)
# sell_order_bp = Blueprint("sell_order", __name__)

# # Initialize Binance client
# client = Client(API_KEY, API_SECRET, testnet=True)
# # print(client.API_KEY)

# @sell_order_bp.route('/sell_order', methods=['POST'])
# def sell_order():
#     try:
#         data = request.json
#         symbol = data.get("symbol")
#         order_id = data.get("order_id")

#         if not symbol or not order_id:
#             return jsonify({"error": "Symbol and order_id are required"}), 400

#         # Fetch order details from Binance
#         # order = client.get_order(symbol=symbol.upper(), orderId=order_id)
#         order = client.get_order(symbol=symbol.upper(), origClientOrderId=order_id)

#         if not order:
#             return jsonify({"error": "Order not found"}), 404

#         # Calculate remaining quantity to sell
#         remaining_qty = float(order["origQty"]) - float(order["executedQty"])
#         if remaining_qty <= 0:
#             return jsonify({"error": "No remaining quantity to sell"}), 400

#         # Sell remaining quantity
#         market_order = client.order_market_sell(symbol=symbol.upper(), quantity=remaining_qty)

#         return jsonify({
#             "message": "Order sold successfully",
#             "order_id": market_order.get("orderId"),
#             "symbol": market_order.get("symbol"),
#             "status": market_order.get("status"),
#             "executed_qty": market_order.get("executedQty"),
#             "price": market_order["fills"][0]["price"] if market_order.get("fills") else "Market Price",
#         })

#     except BinanceAPIException as e:
#         import traceback
#         traceback.print_exc()
#         return jsonify({"error": f"Binance API Error: {e.message}"}), 500
#     except Exception as e:
#         print("Error : ", traceback.format_exc())
#         # return jsonify({"error": str(e)}), 500
#         return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500






# from flask import Blueprint, jsonify, request
# from binance.client import Client
# from binance.exceptions import BinanceAPIException
# import traceback
# from config import API_KEY, API_SECRET


# # app = Flask(__name__)
# sell_order_bp = Blueprint("sell_order", __name__)

# # Initialize Binance Client (Testnet Mode)
# client = Client(API_KEY, API_SECRET, testnet=True)


# # **SELL ORDER API**
# @sell_order_bp.route('/sell_order', methods=['POST'])
# def sell_order():
#     try:
#         data = request.json
#         symbol = data.get("symbol")
#         order_id = data.get("order_id")  # Buy order ID

#         if not symbol or not order_id:
#             return jsonify({"error": "Symbol and order_id are required"}), 400

#         # **1. Fetch the Buy Order Details**
#         order = client.get_order(symbol=symbol.upper(), orderId=order_id)
#         if not order:
#             return jsonify({"error": "Order not found"}), 404

#         # **2. Ensure Order is Filled Before Selling**
#         if order["status"] not in ["FILLED", "PARTIALLY_FILLED"]:
#             return jsonify({"error": f"Order is {order['status']} and cannot be sold"}), 400

#         # **3. Calculate Remaining Quantity to Sell**
#         remaining_qty = float(order["executedQty"])
#         if remaining_qty <= 0:
#             return jsonify({"error": "No quantity left to sell"}), 400

#         # **4. Place a Market Sell Order**
#         market_order = client.order_market_sell(symbol=symbol.upper(), quantity=remaining_qty)

#         return jsonify({
#             "message": "Sell order placed successfully",
#             "order_id": market_order.get("orderId"),
#             "symbol": market_order.get("symbol"),
#             "status": market_order.get("status"),
#             "executed_qty": market_order.get("executedQty"),
#             "price": market_order["fills"][0]["price"] if market_order.get("fills") else "Market Price"
#         })

#     except BinanceAPIException as e:
#         traceback.print_exc()
#         return jsonify({"error": f"Binance API Error: {e.message}"}), 500
#     except Exception as e:
#         print("Error: ", traceback.format_exc())
#         return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500





from flask import Blueprint, jsonify, request
from dhan_backend.utils.dhan_helpers import generate_signature
from config import API_KEY, BASE_URL
import time
import requests

# Define Blueprint
sell_existing_order_bp = Blueprint("sell_existing_order", __name__)

@sell_existing_order_bp.route("/sell-existing-order", methods=["POST"])
def sell_existing_order():
    """Fetches an existing buy order and sells it on Binance Futures"""
    data = request.get_json()
    symbol = data.get("symbol")
    order_id = data.get("order_id")  # Buy order ID

    if not symbol or not order_id:
        return jsonify({"error": "Symbol and order_id are required"}), 400

    try:
        # **1. Fetch the Buy Order Details**
        params = {
            "symbol": symbol,
            "orderId": order_id,
            "timestamp": int(time.time() * 1000)
        }
        params["signature"] = generate_signature(params)

        headers = {"X-MBX-APIKEY": API_KEY}
        response = requests.get(f"{BASE_URL}/fapi/v1/order", params=params, headers=headers)

        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch order", "details": response.json()}), 400

        order_details = response.json()

        # **2. Check if Order is FILLED (Only Filled Orders Can be Sold)**
        if order_details["status"] not in ["FILLED", "PARTIALLY_FILLED"]:
            return jsonify({"error": f"Order is {order_details['status']} and cannot be sold"}), 400

        # **3. Get the Quantity to Sell**
        remaining_qty = float(order_details["executedQty"])
        if remaining_qty <= 0:
            return jsonify({"error": "No quantity left to sell"}), 400

        # **4. Place a Sell Order**
        sell_params = {
            "symbol": symbol,
            "side": "SELL",
            "type": "MARKET",  # Selling at market price
            "quantity": remaining_qty,
            "reduceOnly": True,  # Ensures it closes the position
            "timestamp": int(time.time() * 1000),
        }
        sell_params["signature"] = generate_signature(sell_params)

        sell_response = requests.post(f"{BASE_URL}/fapi/v1/order", params=sell_params, headers=headers)

        if sell_response.status_code == 200:
            sell_order = sell_response.json()

            return jsonify({
                "message": "Sell order placed successfully",
                "order_id": sell_order.get("orderId"),
                "symbol": sell_order.get("symbol"),
                "status": sell_order.get("status"),
                "executed_qty": sell_order.get("executedQty"),
                "price": sell_order["fills"][0]["price"] if sell_order.get("fills") else "Market Price"
            })

        return jsonify({"error": "Failed to place sell order", "details": sell_response.json()}), 400

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500




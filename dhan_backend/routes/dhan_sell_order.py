

from flask import Flask, jsonify, request, Blueprint
from dhanhq import dhanhq
import datetime
import json
import logging
from config import client_id, access_token
from db import save_offline_order, get_db_connection

# Logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize DhanHQ API client
dhan = dhanhq(client_id, access_token)

def is_market_open():
    """Returns True if the stock market is open (9:15 AM - 3:30 PM IST)."""
    now = datetime.datetime.now()
    market_open = now.replace(hour=9, minute=15, second=0, microsecond=0)
    market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)
    return now.weekday() < 5 and market_open <= now < market_close

place_sell_order_bp = Blueprint("place_sell_order", __name__)

@place_sell_order_bp.route("/place_sell_order", methods=["POST"])
def place_sell_order():
    """Handles selling an existing buy order, only when the market is open."""
    logger.info(f"Received sell request: {request.get_data(as_text=True)}")
    if not is_market_open():
        logger.info("Sell order attempt rejected: Market is closed.")
        return jsonify({"status": "error", "message": "Market is closed."}), 403

    try:
        data = request.get_json()
        if not data:
            raise ValueError("No JSON data provided")
        logger.info(f"Parsed JSON data: {data}")

        security_id = str(data.get("security_id", ""))
        exchange_segment = data.get("exchange_segment", "")
        order_type = data.get("order_type", "").upper()
        quantity = int(data.get("quantity", 0))
        product_type = data.get("product_type", "")

        required_fields = ["security_id", "exchange_segment", "quantity", "order_type", "product_type"]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        if quantity <= 0:
            return jsonify({"error": "Quantity must be positive"}), 400

        if exchange_segment not in ["NSE_EQ", "BSE_EQ", "NSE_FNO", "MCX_COM"]:
            return jsonify({"error": "Invalid exchange segment"}), 400

        if product_type not in ["CNC", "INTRADAY", "MARGIN"]:
            return jsonify({"error": "Invalid product type"}), 400

        # Check holdings for CNC orders
        if product_type == "CNC":
            holdings = dhan.get_holdings()
            logger.info(f"Holdings fetched at {datetime.datetime.now()}: {holdings}")
            if holdings["status"] == "success":
                holding = next((h for h in holdings["data"] if h["securityId"] == security_id), None)
                if not holding:
                    return jsonify({"status": "error", "message": f"No holdings found for {security_id}"}), 400
                available_qty = holding["availableQty"]
                dp_qty = holding["dpQty"]
                t1_qty = holding["t1Qty"]
                logger.info(f"Security {security_id}: availableQty={available_qty}, dpQty={dp_qty}, t1Qty={t1_qty}")
                if dp_qty < quantity:
                    return jsonify({"status": "error", "message": f"Insufficient settled quantity. Depository: {dp_qty}, Requested: {quantity}"}), 400
                if available_qty < quantity:
                    return jsonify({"status": "error", "message": f"Insufficient available quantity. Available: {available_qty}, Requested: {quantity}"}), 400
        else:
            logger.warning(f"Failed to fetch holdings: {holdings}")
            return jsonify({"status": "error", "message": "Unable to verify holdings"}), 500

        order_payload = {
            "security_id": security_id,
            "exchange_segment": exchange_segment,
            "transaction_type": "SELL",
            "quantity": quantity,
            "order_type": order_type,
            "product_type": product_type,
            "price": float(data.get("price", 0)) if data.get("price") is not None else 0,
            "trigger_price": float(data.get("trigger_price", 0)) if data.get("trigger_price") is not None else 0
        }

        if order_type in ["MARKET", "STOP_LOSS_MARKET"]:
            order_payload["price"] = 0
        if order_type not in ["STOP_LOSS", "STOP_LOSS_MARKET"]:
            order_payload["trigger_price"] = 0

        logger.info(f"Sending Sell Order Payload to Dhan API: {order_payload}")
        order_response = dhan.place_order(**order_payload)
        logger.info(f"Sell Order Response from Dhan: {order_response}")

        if isinstance(order_response, dict) and order_response.get("status") == "success":
            order_id = order_response.get("data", {}).get("orderId")
            if not order_id:
                return jsonify({"error": "Order ID missing from response"}), 400

            save_offline_order(order_id, security_id, exchange_segment, "SELL", quantity, order_type, product_type, order_payload["price"], order_payload["trigger_price"], "EXECUTED")
            return jsonify({"status": "success", "message": "Sell order placed", "order_id": order_id}), 200

        return jsonify({"status": "error", "message": "Sell order failed", "details": order_response}), 400

    except Exception as e:
        logger.error(f"Error in place_sell_order: {e}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

def process_offline_orders():
    """Executes stored offline orders when the market opens and updates status."""
    if is_market_open():
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM offline_order WHERE status = 'PENDING'")
        orders = cursor.fetchall()

        for order in orders:
            try:
                price = float(order["price"]) if order["price"] is not None else 0.0
                trigger_price = float(order["trigger_price"]) if order["trigger_price"] is not None else 0.0

                # Construct payload for Dhan API
                order_payload = {
                    "security_id": order["security_id"],
                    "exchange_segment": order["exchange_segment"],
                    "transaction_type": order["transaction_type"],
                    "quantity": order["quantity"],
                    "order_type": order["order_type"],
                    "product_type": order["product_type"],
                    "price": price,
                    "trigger_price": trigger_price
                }

                if order["order_type"] == "MARKET":
                    order_payload.pop("price", None)
                    order_payload.pop("trigger_price", None)
                elif order["order_type"] == "STOP_LOSS_MARKET":
                    order_payload.pop("price", None)
                elif order["order_type"] not in ["STOP_LOSS", "STOP_LOSS_MARKET"]:
                    order_payload.pop("trigger_price", None)

                logger.info(f"Processing Pending Order: {order_payload}")

                # Execute pending order
                order_response = dhan.place_order(**order_payload)
                logger.info(f"Order Response: {order_response}")

                if isinstance(order_response, dict) and order_response.get("status") == "success":
                    order_id = order_response.get("data", {}).get("orderId")
                    order_status = order_response.get("data", {}).get("orderStatus", "UNKNOWN")

                    # Update order status in the database
                    cursor.execute("UPDATE offline_order SET status = %s, order_id = %s WHERE id = %s",
                                   (order_status, order_id, order["id"]))
                    conn.commit()
                else:
                    logger.warning(f"Order execution failed: {order_response}")

            except Exception as e:
                logger.error(f"Error processing pending order {order['id']}: {e}")

        cursor.close()
        conn.close()
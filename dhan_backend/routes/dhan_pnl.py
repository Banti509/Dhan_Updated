
# from flask import Blueprint, jsonify
# from flask_socketio import SocketIO, emit
# from config import client_id, access_token
# from db import get_db_connection
# import websocket
# import json
# import struct
# import threading
# import logging
# import mysql.connector
# import time
# import requests  # Add this for HTTP requests

# # Logging configuration
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # Flask Blueprint
# pnl_report_bp = Blueprint("pnl_report", __name__)
# socketio = SocketIO()  # Initialized in app.py
# live_price_cache = {}

# # WebSocket URL for Dhan API
# ws_url = f"wss://api-feed.dhan.co?version=2&token={access_token}&clientId={client_id}&authType=2"

# # Base URL for internal API calls
# BASE_URL = "http://127.0.0.1:5000/api"

# # Retrieve executed orders from the database
# def get_orders_from_db():
#     connection = None
#     orders = []
#     try:
#         connection = get_db_connection()
#         cursor = connection.cursor(dictionary=True)
#         cursor.execute("SELECT order_id, security_id, exchange_segment, transaction_type, quantity, product_type, price FROM offline_order WHERE status = 'EXECUTED'")
#         orders = cursor.fetchall()
#         print("======================",orders)
#         for order in orders:
#             if float(order["price"]) == 0.00:
#                 order["price"] = live_price_cache.get(order["security_id"], 0.0)
#     except mysql.connector.Error as e:
#         logger.error(f"Database error: {e}")
#     finally:
#         if connection and connection.is_connected():
#             connection.close()
#     return orders

# # WebSocket event handlers
# def on_open(ws):
#     logger.info("WebSocket opened")
#     update_subscriptions(ws)

# # def on_message(ws, message):
# #     global live_price_cache
# #     logger.info(f"Raw message length: {len(message)} bytes")
# #     logger.info(f"Raw message bytes: {message.hex()}")  # Log full raw bytes for debugging

# #     if isinstance(message, bytes) and len(message) >= 12:
# #         try:
# #             sec_id_bytes = message[4:8]
# #             ltp_bytes = message[8:12]
# #             logger.info(f"Raw bytes (4-7): {sec_id_bytes.hex()}, (8-11): {ltp_bytes.hex()}")

# #             # Parse security_id (assume big-endian for simplicity, adjust if Dhan specifies otherwise)
# #             security_id_be = struct.unpack('>I', sec_id_bytes)[0]
# #             security_id_le = struct.unpack('<I', sec_id_bytes)[0]
# #             security_id = str(security_id_be) if security_id_be < 100000 else str(security_id_le)
# #             logger.info(f"Security ID - BE: {security_id_be}, LE: {security_id_le}, Chosen: {security_id}")

# #             # Parse LTP (try both endianness and validate)
# #             last_price_be = struct.unpack('>f', ltp_bytes)[0]
# #             last_price_le = struct.unpack('<f', ltp_bytes)[0]
# #             logger.info(f"LTP - BE: {last_price_be}, LE: {last_price_le}")

# #             # Choose realistic price (assume stocks rarely exceed 10000 INR)
# #             if 0 < last_price_be < 10000:
# #                 last_price = last_price_be
# #             elif 0 < last_price_le < 10000:
# #                 last_price = last_price_le
# #             else:
# #                 # Check if price is in paisa (common in some APIs)
# #                 last_price_be_paisa = last_price_be / 100
# #                 last_price_le_paisa = last_price_le / 100
# #                 if 0 < last_price_be_paisa < 10000:
# #                     last_price = last_price_be_paisa
# #                     logger.info(f"Interpreted BE LTP as paisa: {last_price_be} -> {last_price}")
# #                 elif 0 < last_price_le_paisa < 10000:
# #                     last_price = last_price_le_paisa
# #                     logger.info(f"Interpreted LE LTP as paisa: {last_price_le} -> {last_price}")
# #                 else:
# #                     logger.warning(f"Unrealistic price - BE: {last_price_be}, LE: {last_price_le}, skipping")
# #                     return

# #             # Format to 2 decimal places
# #             last_price = round(float(last_price), 2)
# #             logger.info(f"Parsed - Security ID: {security_id}, LTP: {last_price}")

# #             # Final validation
# #             if 0 < last_price < 10000:  # Stricter cap for Indian stocks
# #                 live_price_cache[security_id] = last_price
# #                 formatted_prices = {key: round(value, 2) for key, value in live_price_cache.items()}
# #                 logger.info(f"Updated live_price_cache: {formatted_prices}")

# #                 # Emit LTP data to frontend
# #                 ltp_data = {
# #                     "status": "success",
# #                     "security_id": security_id,
# #                     "ltp": last_price,
# #                     "timestamp": time.strftime("%Y-%m-d %H:%M:%S", time.localtime())
# #                 }
# #                 socketio.emit("ltp_update", ltp_data)
# #                 logger.info(f"Emitted LTP update: {json.dumps(ltp_data)}")
# #             else:
# #                 logger.warning(f"Price out of realistic range after rounding: {last_price}")

# #         except Exception as e:
# #             logger.error(f"Parsing error: {e}")
# #     else:
# #         logger.warning("Message too short or not bytes, skipping")

# # def on_message(ws, message):
# #     global live_price_cache
# #     logger.info(f"Raw message length: {len(message)} bytes")
# #     logger.info(f"Raw message bytes: {message.hex()}")  # Log full raw bytes

# #     if isinstance(message, bytes) and len(message) >= 12:
# #         try:
# #             sec_id_bytes = message[4:8]
# #             ltp_bytes = message[8:12]
# #             logger.info(f"Raw bytes (4-7): {sec_id_bytes.hex()}, (8-11): {ltp_bytes.hex()}")

# #             # Parse security_id (assume big-endian for Dhan, adjust if documented otherwise)
# #             security_id_be = struct.unpack('>I', sec_id_bytes)[0]
# #             security_id_le = struct.unpack('<I', sec_id_bytes)[0]
# #             security_id = str(security_id_be) if security_id_be < 100000 else str(security_id_le)
# #             logger.info(f"Security ID - BE: {security_id_be}, LE: {security_id_le}, Chosen: {security_id}")

# #             # Parse LTP (try both endianness)
# #             last_price_be = struct.unpack('>f', ltp_bytes)[0]
# #             last_price_le = struct.unpack('<f', ltp_bytes)[0]
# #             logger.info(f"LTP - BE: {last_price_be}, LE: {last_price_le}")

# #             # Select realistic price
# #             if 0.1 <= last_price_be <= 10000:  # Stricter minimum (0.1 INR)
# #                 last_price = last_price_be
# #             elif 0.1 <= last_price_le <= 10000:
# #                 last_price = last_price_le
# #             else:
# #                 # Check paisa conversion
# #                 last_price_be_paisa = last_price_be / 100
# #                 last_price_le_paisa = last_price_le / 100
# #                 if 0.1 <= last_price_be_paisa <= 10000:
# #                     last_price = last_price_be_paisa
# #                     logger.info(f"Interpreted BE LTP as paisa: {last_price_be} -> {last_price}")
# #                 elif 0.1 <= last_price_le_paisa <= 10000:
# #                     last_price = last_price_le_paisa
# #                     logger.info(f"Interpreted LE LTP as paisa: {last_price_le} -> {last_price}")
# #                 else:
# #                     # Use last known good price or skip
# #                     last_known_price = live_price_cache.get(security_id, None)
# #                     if last_known_price and 0.1 <= last_known_price <= 10000:
# #                         logger.warning(f"Unrealistic price - BE: {last_price_be}, LE: {last_price_le}, using last known: {last_known_price}")
# #                         last_price = last_known_price
# #                     else:
# #                         logger.warning(f"Unrealistic price - BE: {last_price_be}, LE: {last_price_le}, skipping")
# #                         return

# #             # Format to 2 decimal places
# #             last_price = round(float(last_price), 2)
# #             logger.info(f"Parsed - Security ID: {security_id}, LTP: {last_price}")

# #             # Final validation
# #             if 0.1 <= last_price <= 10000:
# #                 live_price_cache[security_id] = last_price
# #                 formatted_prices = {key: round(value, 2) for key, value in live_price_cache.items()}
# #                 logger.info(f"Updated live_price_cache: {formatted_prices}")

# #                 # Emit LTP data to frontend
# #                 ltp_data = {
# #                     "status": "success",
# #                     "security_id": security_id,
# #                     "ltp": last_price,
# #                     "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
# #                 }
# #                 socketio.emit("ltp_update", ltp_data)
# #                 logger.info(f"Emitted LTP update: {json.dumps(ltp_data)}")
# #             else:
# #                 logger.warning(f"Price out of realistic range after rounding: {last_price}")

# #         except Exception as e:
# #             logger.error(f"Parsing error: {e}")
# #     else:
# #         logger.warning("Message too short or not bytes, skipping")



# def on_message(ws, message):
#     """
#     Process incoming WebSocket messages to extract and emit LTP updates.
    
#     Args:
#         ws: WebSocket connection object.
#         message: Incoming message (expected as bytes).
#     """
#     global live_price_cache
#     logger.info(f"Raw message length: {len(message)} bytes")
#     logger.info(f"Raw message bytes: {message.hex()}")

#     if isinstance(message, bytes) and len(message) >= 12:
#         try:
#             sec_id_bytes = message[4:8]
#             ltp_bytes = message[8:12]
#             logger.info(f"Raw bytes (4-7): {sec_id_bytes.hex()}, (8-11): {ltp_bytes.hex()}")

#             # Parse security_id (try both endianness)
#             security_id_be = struct.unpack('>I', sec_id_bytes)[0]
#             security_id_le = struct.unpack('<I', sec_id_bytes)[0]
#             security_id = str(security_id_le if security_id_le < 1000000 else security_id_be)
#             logger.info(f"Security ID - BE: {security_id_be}, LE: {security_id_le}, Chosen: {security_id}")

#             # Parse LTP (try both endianness)
#             last_price_be = struct.unpack('>f', ltp_bytes)[0]
#             last_price_le = struct.unpack('<f', ltp_bytes)[0]
#             logger.info(f"LTP - BE: {last_price_be}, LE: {last_price_le}")

#             # Determine segment (placeholder; replace with actual mapping if available)
#             is_options = int(security_id) > 30000  # Assume NSE_FNO for IDs > 30000
#             min_price = 0.05 if is_options else 0.1  # Lower threshold for options

#             # Select realistic price
#             last_price = None
#             if min_price <= last_price_be <= 10000:
#                 last_price = last_price_be
#             elif min_price <= last_price_le <= 10000:
#                 last_price = last_price_le
#             else:
#                 # Try paisa conversion
#                 last_price_be_paisa = last_price_be / 100
#                 last_price_le_paisa = last_price_le / 100
#                 if min_price <= last_price_be_paisa <= 10000:
#                     last_price = last_price_be_paisa
#                     logger.info(f"Interpreted BE LTP as paisa: {last_price_be} -> {last_price}")
#                 elif min_price <= last_price_le_paisa <= 10000:
#                     last_price = last_price_le_paisa
#                     logger.info(f"Interpreted LE LTP as paisa: {last_price_le} -> {last_price}")

#             if last_price is None:
#                 # Use last known price or skip
#                 last_known_price = live_price_cache.get(security_id, None)
#                 if last_known_price and min_price <= last_known_price <= 10000:
#                     logger.warning(f"Unrealistic price - BE: {last_price_be}, LE: {last_price_le}, using last known: {last_known_price}")
#                     last_price = last_known_price
#                 else:
#                     logger.warning(f"Unrealistic price - BE: {last_price_be}, LE: {last_price_le}, skipping")
#                     return

#             # Format to 2 decimal places
#             last_price = round(float(last_price), 2)
#             logger.info(f"Parsed - Security ID: {security_id}, LTP: {last_price}, Is Options: {is_options}")

#             # Final validation
#             if min_price <= last_price <= 10000:
#                 live_price_cache[security_id] = last_price
#                 formatted_prices = {key: round(value, 2) for key, value in live_price_cache.items()}
#                 logger.info(f"Updated live_price_cache: {formatted_prices}")

#                 # Emit LTP data to frontend
#                 ltp_data = {
#                     "status": "success",
#                     "security_id": security_id,
#                     "ltp": last_price,
#                     "segment": "NSE_FNO" if is_options else "NSE_EQ",
#                     "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
#                 }
#                 socketio.emit("ltp_update", ltp_data)
#                 logger.info(f"Emitted LTP update: {json.dumps(ltp_data)}")
#             else:
#                 logger.warning(f"Price out of realistic range after rounding: {last_price}")

#         except Exception as e:
#             logger.error(f"Parsing error: {e}")
#     else:
#         logger.warning(f"Message invalid - Type: {type(message)}, Length: {len(message)}, Content: {message.hex() if isinstance(message, bytes) else message}")

# def on_error(ws, error):
#     logger.error(f"WebSocket error: {error}")

# def on_close(ws, code, reason):
#     logger.info(f"WebSocket closed: {code}, {reason}")

# # Subscribe to live prices
# # def update_subscriptions(ws):
# #     orders = get_orders_from_db()
# #     if not orders:
# #         logger.info("No executed orders to subscribe to")
# #         return
# #     security_ids = list(set(order["security_id"] for order in orders))
# #     subscription = {
# #         "RequestCode": 15,
# #         "InstrumentCount": len(security_ids),
# #         "InstrumentList": [{"ExchangeSegment": "NSE_EQ", "SecurityId": sid} for sid in security_ids]
# #     }
# #     ws.send(json.dumps(subscription))
# #     logger.info(f"Subscribed to: {security_ids}")



# def update_subscriptions(ws):
#     """
#     Subscribe to live price updates for all executed orders' security IDs.
    
#     Args:
#         ws: WebSocket connection object.
#     """
#     orders = get_orders_from_db()
#     if not orders:
#         logger.info("No executed orders to subscribe to")
#         return

#     # Group security IDs by exchange segment
#     segment_map = {}
#     for order in orders:
#         security_id = order["security_id"]
#         exchange_segment = order.get("exchange_segment", "NSE_EQ")  # Fallback to NSE_EQ
#         if exchange_segment not in ["NSE_EQ", "NSE_FNO"]:
#             logger.warning(f"Invalid exchange_segment {exchange_segment} for order {order.get('order_id')}; defaulting to NSE_EQ")
#             exchange_segment = "NSE_EQ"
#         if exchange_segment not in segment_map:
#             segment_map[exchange_segment] = set()
#         segment_map[exchange_segment].add(security_id)

#     # Build subscription message
#     instrument_list = []
#     for exchange_segment, security_ids in segment_map.items():
#         instrument_list.extend(
#             [{"ExchangeSegment": exchange_segment, "SecurityId": sid} for sid in security_ids]
#         )

#     if not instrument_list:
#         logger.info("No valid instruments to subscribe to")
#         return

#     subscription = {
#         "RequestCode": 15,
#         "InstrumentCount": len(instrument_list),
#         "InstrumentList": instrument_list
#     }

#     # Send subscription
#     try:
#         ws.send(json.dumps(subscription))
#         logger.info(f"Subscription sent: {json.dumps(subscription, indent=2)}")
#         # Log segment-wise subscriptions
#         for exchange_segment, security_ids in segment_map.items():
#             logger.info(f"Subscribed {exchange_segment}: {list(security_ids)}")
#     except Exception as e:
#         logger.error(f"Failed to send subscription: {e}")



# # Trigger sell order via internal API call
# def trigger_sell_order(order):
#     try:
#         sell_payload = {
#             "security_id": order["security_id"],
#             "exchange_segment": order.get("exchange_segment", "NSE_EQ"),
#             "quantity": order["quantity"],
#             "order_type": "MARKET",
#             "product_type": order.get("product_type", "CNC"),
#             "price": live_price_cache.get(order["security_id"], 0.0)
#         }
#         logger.info(f"Triggering sell order with payload: {sell_payload}")

#         response = requests.post(
#             f"{BASE_URL}/place_sell_order",
#             json=sell_payload,
#             headers={"Content-Type": "application/json"}
#         )
#         response_data = response.json()
#         logger.info(f"Sell order response: status_code={response.status_code}, data={response_data}")

#         if response.status_code == 200 and response_data.get("status") in ["success", "offline"]:
#             logger.info(f"Sell order successful for {order['security_id']}: {response_data}")
#             return True
#         else:
#             logger.warning(f"Sell order failed for {order['security_id']}: {response_data}")
#             return False
#     except Exception as e:
#         logger.error(f"Failed to trigger sell order for {order['security_id']}: {e}")
#         return False

# # Stream PnL to frontend and trigger sell orders
# def stream_pnl():
#     try:
#         orders = get_orders_from_db()
#         logger.info("✅ Starting PnL stream with {} orders".format(len(orders)))
#         while True:
#             if not orders:
#                 data = {"status": "error", "message": "No executed orders found", "pnl_report": []}
#                 logger.info(f"Sending to frontend: {json.dumps(data)}")
#                 socketio.emit("price_update", data)
#                 time.sleep(2)
#                 orders = get_orders_from_db()
#                 continue

#             pnl_report = []
#             total_pnl = 0
#             orders_to_keep = []
#             for order in orders:
#                 security_id = order["security_id"]
#                 entry_price = float(order["price"])
#                 quantity = int(order["quantity"])
#                 transaction_type = order["transaction_type"]
#                 product_type = order["product_type"]
#                 live_price = live_price_cache.get(security_id, entry_price)

#                 pnl = (live_price - entry_price) * quantity if transaction_type == "BUY" else (entry_price - live_price) * quantity
#                 pnl_percentage = round((pnl / (entry_price * quantity)) * 100, 2) if entry_price * quantity else 0
#                 total_pnl += pnl

#                 order_data = {
#                     "order_id": order["order_id"],
#                     "security_id": security_id,
#                     "entry_price": entry_price,
#                     "current_price": live_price,
#                     "quantity": quantity,
#                     "transaction_type": transaction_type,
#                     "product_type": product_type,
#                     "pnl": round(pnl, 2),
#                     "pnl_percentage": pnl_percentage
#                 }
#                 pnl_report.append(order_data)

#                 # Log PnL details
#                 logger.info(f"Order {security_id}: entry_price={entry_price}, live_price={live_price}, "
#                             f"pnl={pnl}, pnl_percentage={pnl_percentage}%, transaction_type={transaction_type}")

#                 # Check PnL thresholds and trigger sell order
#                 if transaction_type == "BUY":
#                     if pnl_percentage >= 30.0:
#                         logger.info(f"Profit threshold (5%) met for {security_id}: {pnl_percentage}%")
#                         if trigger_sell_order(order):
#                             logger.info(f"Sell triggered and successful for {security_id}")
#                             continue  # Skip adding to orders_to_keep if sold
#                         else:
#                             logger.warning(f"Sell trigger failed for {security_id}")
#                     elif pnl_percentage <= -15.0:
#                         logger.info(f"Loss threshold (-2%) met for {security_id}: {pnl_percentage}%")
#                         if trigger_sell_order(order):
#                             logger.info(f"Sell triggered and successful for {security_id}")
#                             continue  # Skip adding to orders_to_keep if sold
#                         else:
#                             logger.warning(f"Sell trigger failed for {security_id}")
#                     orders_to_keep.append(order)  # Keep monitoring if no sell triggered
#                 else:
#                     orders_to_keep.append(order)  # Keep SELL orders in monitoring

#             orders = orders_to_keep  # Update list to exclude sold orders

#             data_to_send = {
#                 "status": "success",
#                 "prices": {order["security_id"]: live_price_cache.get(order["security_id"], 0.0) for order in orders},
#                 "pnl_report": pnl_report,
#                 "total_pnl": round(total_pnl, 2)
#             }

#             logger.info(f"Sending to frontend: {json.dumps(data_to_send, indent=2)}")
#             socketio.emit("price_update", data_to_send)
#             logger.info(f"Emitted price update for {len(orders)} securities")
#             time.sleep(2)
#     except Exception as e:
#         logger.error(f"Error in stream_pnl: {e}")


# # PnL report API
# @pnl_report_bp.route("/pnl-report", methods=["GET"])
# def pnl_report():
#     orders = get_orders_from_db()
#     live_prices = {order["security_id"]: live_price_cache.get(order["security_id"], 0.0) for order in orders}
#     return jsonify({"status": "success", "orders": orders, "live_prices": live_prices})

# # WebSocket connection with auto-reconnect
# def start_websocket():
#     while True:
#         try:
#             logger.info("Starting WebSocket connection...")
#             ws = websocket.WebSocketApp(ws_url, on_open=on_open, on_message=on_message, on_error=on_error, on_close=on_close)
#             ws.run_forever(ping_interval=10, ping_timeout=5)
#         except Exception as e:
#             logger.error(f"WebSocket connection failed: {e}. Retrying in 5 seconds...")
#             time.sleep(5)

# # Start WebSocket thread
# websocket_thread = threading.Thread(target=start_websocket, daemon=True)
# websocket_thread.start()

# # Start PnL stream using Flask-SocketIO's background task
# def start_pnl_stream():
#     logger.info("Initializing PnL stream thread...")
#     try:
#         socketio.start_background_task(stream_pnl)
#         logger.info("PnL stream background task started successfully.")
#     except Exception as e:
#         logger.error(f"Failed to start PnL stream background task: {e}")

# # Start PnL stream directly
# start_pnl_stream()


# @socketio.on("connect")
# def handle_connect():
#     logger.info("Client connected to SocketIO")
#     orders = get_orders_from_db()
#     live_prices = {order["security_id"]: live_price_cache.get(order["security_id"], 0.0) for order in orders}
#     emit("price_update", {"status": "success", "message": "Connected to server", "prices": live_prices})
#     print("✅ Sent live price data to frontend.", live_prices, flush=True)















from flask import Blueprint, jsonify
from flask_socketio import SocketIO, emit
from config import client_id, access_token
from db import get_db_connection
import websocket
import json
import struct
import threading
import logging
import mysql.connector
import time
import requests  # Add this for HTTP requests

# Logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Flask Blueprint
pnl_report_bp = Blueprint("pnl_report", __name__)
socketio = SocketIO()  # Initialized in app.py
live_price_cache = {}

# WebSocket URL for Dhan API
ws_url = f"wss://api-feed.dhan.co?version=2&token={access_token}&clientId={client_id}&authType=2"

# Base URL for internal API calls
BASE_URL = "http://127.0.0.1:5000/api"

# Retrieve executed orders from the database
def get_orders_from_db():
    connection = None
    orders = []
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT order_id, order_symbol, security_id, exchange_segment, transaction_type, quantity, product_type, price FROM offline_order WHERE status = 'EXECUTED'")
        orders = cursor.fetchall()
        # print("======================",orders)
        for order in orders:
            if float(order["price"]) == 0.00:
                order["price"] = live_price_cache.get(order["security_id"], 0.0)
    except mysql.connector.Error as e:
        logger.error(f"Database error: {e}")
    finally:
        if connection and connection.is_connected():
            connection.close()
    return orders

# WebSocket event handlers
def on_open(ws):
    logger.info("WebSocket opened")
    update_subscriptions(ws)

def on_message(ws, message):
    """
    Process incoming WebSocket messages to extract and emit LTP updates.
    
    Args:
        ws: WebSocket connection object.
        message: Incoming message (expected as bytes).
    """
    global live_price_cache
    logger.info(f"Raw message length: {len(message)} bytes")
    logger.info(f"Raw message bytes: {message.hex()}")

    if isinstance(message, bytes) and len(message) >= 12:
        try:
            sec_id_bytes = message[4:8]
            ltp_bytes = message[8:12]
            logger.info(f"Raw bytes (4-7): {sec_id_bytes.hex()}, (8-11): {ltp_bytes.hex()}")

            # Parse security_id (try both endianness)
            security_id_be = struct.unpack('>I', sec_id_bytes)[0]
            security_id_le = struct.unpack('<I', sec_id_bytes)[0]
            security_id = str(security_id_le if security_id_le < 1000000 else security_id_be)
            logger.info(f"Security ID - BE: {security_id_be}, LE: {security_id_le}, Chosen: {security_id}")

            # Parse LTP (try both endianness)
            last_price_be = struct.unpack('>f', ltp_bytes)[0]
            last_price_le = struct.unpack('<f', ltp_bytes)[0]
            logger.info(f"LTP - BE: {last_price_be}, LE: {last_price_le}")

            # Determine segment (placeholder; replace with actual mapping if available)
            is_options = int(security_id) > 30000  # Assume NSE_FNO for IDs > 30000
            min_price = 0.05 if is_options else 0.1  # Lower threshold for options
            max_price = 100000 if is_options else 50000

            # Select realistic price
            last_price = None
            if min_price <= last_price_be <= 100000:
                last_price = last_price_be
            elif min_price <= last_price_le <= 100000:
                last_price = last_price_le
            else:
                # Try paisa conversion
                last_price_be_paisa = last_price_be / 100
                last_price_le_paisa = last_price_le / 100
                if min_price <= last_price_be_paisa <= 100000:
                    last_price = last_price_be_paisa
                    logger.info(f"Interpreted BE LTP as paisa: {last_price_be} -> {last_price}")
                elif min_price <= last_price_le_paisa <= 100000:
                    last_price = last_price_le_paisa
                    logger.info(f"Interpreted LE LTP as paisa: {last_price_le} -> {last_price}")

            if last_price is None:
                # Use last known price or skip
                last_known_price = live_price_cache.get(security_id, None)
                if last_known_price and min_price <= last_known_price <= 10000:
                    logger.warning(f"Unrealistic price - BE: {last_price_be}, LE: {last_price_le}, using last known: {last_known_price}")
                    last_price = last_known_price
                else:
                    logger.warning(f"Unrealistic price - BE: {last_price_be}, LE: {last_price_le}, skipping")
                    return

            # Format to 2 decimal places
            last_price = round(float(last_price), 2)
            logger.info(f"Parsed - Security ID: {security_id}, LTP: {last_price}, Is Options: {is_options}")

            # Final validation
            if min_price <= last_price <= 100000:
                live_price_cache[security_id] = last_price
                formatted_prices = {key: round(value, 2) for key, value in live_price_cache.items()}
                logger.info(f"Updated live_price_cache: {formatted_prices}")

                # Emit LTP data to frontend
                ltp_data = {
                    "status": "success",
                    "security_id": security_id,
                    "ltp": last_price,
                    "segment": "NSE_FNO" if is_options else "NSE_EQ",
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
                }
                socketio.emit("ltp_update", ltp_data)
                logger.info(f"Emitted LTP update: {json.dumps(ltp_data)}")
            else:
                logger.warning(f"Price out of realistic range after rounding: {last_price}")

        except Exception as e:
            logger.error(f"Parsing error: {e}")
    else:
        logger.warning(f"Message invalid - Type: {type(message)}, Length: {len(message)}, Content: {message.hex() if isinstance(message, bytes) else message}")


def on_error(ws, error):
    logger.error(f"WebSocket error: {error}")

def on_close(ws, code, reason):
    logger.info(f"WebSocket closed: {code}, {reason}")

def update_subscriptions(ws):
    """
    Subscribe to live price updates for all executed orders' security IDs.
    
    Args:
        ws: WebSocket connection object.
    """
    orders = get_orders_from_db()
    if not orders:
        logger.info("No executed orders to subscribe to")
        return

    # Group security IDs by exchange segment
    segment_map = {}
    for order in orders:
        security_id = order["security_id"]
        exchange_segment = order.get("exchange_segment", "NSE_EQ")  # Fallback to NSE_EQ
        if exchange_segment not in ["NSE_EQ", "NSE_FNO"]:
            logger.warning(f"Invalid exchange_segment {exchange_segment} for order {order.get('order_id')}; defaulting to NSE_EQ")
            exchange_segment = "NSE_EQ"
        if exchange_segment not in segment_map:
            segment_map[exchange_segment] = set()
        segment_map[exchange_segment].add(security_id)

    # Build subscription message
    instrument_list = []
    for exchange_segment, security_ids in segment_map.items():
        instrument_list.extend(
            [{"ExchangeSegment": exchange_segment, "SecurityId": sid} for sid in security_ids]
        )

    if not instrument_list:
        logger.info("No valid instruments to subscribe to")
        return

    subscription = {
        "RequestCode": 15,
        "InstrumentCount": len(instrument_list),
        "InstrumentList": instrument_list
    }

    # Send subscription
    try:
        ws.send(json.dumps(subscription))
        logger.info(f"Subscription sent: {json.dumps(subscription, indent=2)}")
        # Log segment-wise subscriptions
        for exchange_segment, security_ids in segment_map.items():
            logger.info(f"Subscribed {exchange_segment}: {list(security_ids)}")
    except Exception as e:
        logger.error(f"Failed to send subscription: {e}")



# Trigger sell order via internal API call
def trigger_sell_order(order):
    try:
        sell_payload = {
            "security_id": order["security_id"],
            "exchange_segment": order.get("exchange_segment", "NSE_EQ"),
            "quantity": order["quantity"],
            "order_type": "MARKET",
            "product_type": order.get("product_type", "CNC"),
            "price": live_price_cache.get(order["security_id"], 0.0)
        }
        logger.info(f"Triggering sell order with payload: {sell_payload}")

        response = requests.post(
            f"{BASE_URL}/place_sell_order",
            json=sell_payload,
            headers={"Content-Type": "application/json"}
        )
        response_data = response.json()
        logger.info(f"Sell order response: status_code={response.status_code}, data={response_data}")

        if response.status_code == 200 and response_data.get("status") in ["success", "offline"]:
            logger.info(f"Sell order successful for {order['security_id']}: {response_data}")
            return True
        else:
            logger.warning(f"Sell order failed for {order['security_id']}: {response_data}")
            return False
    except Exception as e:
        logger.error(f"Failed to trigger sell order for {order['security_id']}: {e}")
        return False

# Stream PnL to frontend and trigger sell orders
def stream_pnl():
    try:
        orders = get_orders_from_db()
        logger.info("✅ Starting PnL stream with {} orders".format(len(orders)))
        while True:
            if not orders:
                data = {"status": "error", "message": "No executed orders found", "pnl_report": []}
                logger.info(f"Sending to frontend: {json.dumps(data)}")
                socketio.emit("price_update", data)
                time.sleep(2)
                orders = get_orders_from_db()
                continue

            pnl_report = []
            total_pnl = 0
            orders_to_keep = []
            for order in orders:
                security_id = order["security_id"]
                order_symbol = order["order_symbol"]
                entry_price = float(order["price"])
                quantity = int(order["quantity"])
                transaction_type = order["transaction_type"]
                product_type = order["product_type"]
                live_price = live_price_cache.get(security_id, entry_price)

                pnl = (live_price - entry_price) * quantity if transaction_type == "BUY" else (entry_price - live_price) * quantity
                pnl_percentage = round((pnl / (entry_price * quantity)) * 100, 2) if entry_price * quantity else 0
                total_pnl += pnl

                order_data = {
                    "order_id": order["order_id"],
                    "security_id": security_id,
                    "order_symbol": order_symbol,
                    "entry_price": entry_price,
                    "current_price": live_price,
                    "quantity": quantity,
                    "transaction_type": transaction_type,
                    "product_type": product_type,
                    "pnl": round(pnl, 2),
                    "pnl_percentage": pnl_percentage
                }
                pnl_report.append(order_data)

                # Log PnL details
                logger.info(f"Order {security_id}: entry_price={entry_price}, live_price={live_price}, "
                            f"pnl={pnl}, pnl_percentage={pnl_percentage}%, transaction_type={transaction_type}")

                # Check PnL thresholds and trigger sell order
                if transaction_type == "BUY":
                    if pnl_percentage >= 30.0:
                        logger.info(f"Profit threshold (5%) met for {security_id}: {pnl_percentage}%")
                        if trigger_sell_order(order):
                            logger.info(f"Sell triggered and successful for {security_id}")
                            continue  # Skip adding to orders_to_keep if sold
                        else:
                            logger.warning(f"Sell trigger failed for {security_id}")
                    elif pnl_percentage <= -15.0:
                        logger.info(f"Loss threshold (-2%) met for {security_id}: {pnl_percentage}%")
                        if trigger_sell_order(order):
                            logger.info(f"Sell triggered and successful for {security_id}")
                            continue  # Skip adding to orders_to_keep if sold
                        else:
                            logger.warning(f"Sell trigger failed for {security_id}")
                    orders_to_keep.append(order)  # Keep monitoring if no sell triggered
                else:
                    orders_to_keep.append(order)  # Keep SELL orders in monitoring

            orders = orders_to_keep  # Update list to exclude sold orders

            data_to_send = {
                "status": "success",
                "prices": {order["security_id"]: live_price_cache.get(order["security_id"], 0.0) for order in orders},
                "pnl_report": pnl_report,
                "total_pnl": round(total_pnl, 2)
            }

            logger.info(f"Sending to frontend: {json.dumps(data_to_send, indent=2)}")
            socketio.emit("price_update", data_to_send)
            logger.info(f"Emitted price update for {len(orders)} securities")
            time.sleep(2)
    except Exception as e:
        logger.error(f"Error in stream_pnl: {e}")


# PnL report API
@pnl_report_bp.route("/pnl-report", methods=["GET"])
def pnl_report():
    orders = get_orders_from_db()
    live_prices = {order["security_id"]: live_price_cache.get(order["security_id"], 0.0) for order in orders}
    return jsonify({"status": "success", "orders": orders, "live_prices": live_prices})

# WebSocket connection with auto-reconnect
def start_websocket():
    while True:
        try:
            logger.info("Starting WebSocket connection...")
            ws = websocket.WebSocketApp(ws_url, on_open=on_open, on_message=on_message, on_error=on_error, on_close=on_close)
            ws.run_forever(ping_interval=10, ping_timeout=5)
        except Exception as e:
            logger.error(f"WebSocket connection failed: {e}. Retrying in 5 seconds...")
            time.sleep(5)

# Start WebSocket thread
websocket_thread = threading.Thread(target=start_websocket, daemon=True)
websocket_thread.start()

# Start PnL stream using Flask-SocketIO's background task
def start_pnl_stream():
    logger.info("Initializing PnL stream thread...")
    try:
        socketio.start_background_task(stream_pnl)
        logger.info("PnL stream background task started successfully.")
    except Exception as e:
        logger.error(f"Failed to start PnL stream background task: {e}")

# Start PnL stream directly
start_pnl_stream()


@socketio.on("connect")
def handle_connect():
    logger.info("Client connected to SocketIO")
    orders = get_orders_from_db()
    live_prices = {order["security_id"]: live_price_cache.get(order["security_id"], 0.0) for order in orders}
    emit("price_update", {"status": "success", "message": "Connected to server", "prices": live_prices})
    print("✅ Sent live price data to frontend.", live_prices, flush=True)








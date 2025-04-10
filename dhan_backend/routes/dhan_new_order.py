


# from flask import Flask, jsonify, request, Blueprint
# from dhanhq import dhanhq
# import datetime
# import json
# from config import client_id, access_token
# from db import save_offline_order, get_db_connection
# from apscheduler.schedulers.background import BackgroundScheduler

# # Initialize Dhan API Client
# dhan = dhanhq(client_id, access_token)
# place_order_bp = Blueprint("place_order", __name__)

# # Function to check if the market is open
# def is_market_open():
#     """Returns True if the stock market is open."""
#     now = datetime.datetime.now()
#     return now.weekday() < 5 and 9 <= now.hour < 15  # Market open 9 AM - 3 PM

# @place_order_bp.route('/place-order', methods=['POST'])
# def place_order():
#     """Handles both online and offline order placement."""
#     try:
#         data = request.get_json()

#         # Validate required fields
#         required_fields = ["security_id", "exchange_segment", "transaction_type", "quantity", "order_type", "product_type"]
#         if data.get("order_type") in ["LIMIT", "STOP_LOSS"]:
#             required_fields.append("price")
#         if data.get("order_type") in ["STOP_LOSS", "STOP_LOSS_MARKET"]:
#             required_fields.append("trigger_price")

#         for field in required_fields:
#             if field not in data:
#                 return jsonify({"error": f"Missing required field: {field}"}), 400

#         # Extract and process input data
#         security_id = str(data["security_id"])
#         exchange_segment = data["exchange_segment"]
#         transaction_type = data["transaction_type"].upper()
#         order_type = data["order_type"].upper()
#         quantity = int(data["quantity"])
#         product_type = data["product_type"].upper()

#         price = float(data["price"]) if "price" in data and data["price"] is not None else 0.0
#         trigger_price = float(data["trigger_price"]) if "trigger_price" in data and data["trigger_price"] is not None else None

#         # Validate input fields
#         if exchange_segment not in ["NSE_EQ", "BSE_EQ", "NSE_FNO", "MCX_COM"]:
#             return jsonify({"status": "error", "message": "Invalid exchange segment"}), 400

#         if transaction_type not in ["BUY", "SELL"]:
#             return jsonify({"error": "Invalid transaction type"}), 400

#         if product_type not in ["CNC", "INTRADAY", "MARGIN"]:
#             return jsonify({"error": "Invalid product type"}), 400

#         # Construct order payload
#         order_payload = {
#             "security_id": security_id,
#             "exchange_segment": exchange_segment,
#             "transaction_type": transaction_type,
#             "quantity": quantity,
#             "order_type": order_type,
#             "product_type": product_type,
#             "price": price if order_type in ["LIMIT", "STOP_LOSS"] else 0,
#             "trigger_price": trigger_price if order_type in ["STOP_LOSS", "STOP_LOSS_MARKET"] else 0
#         }

#         if order_type == "MARKET":
#             order_payload.pop("price", None)
#             order_payload.pop("trigger_price", None)
#         if order_type not in ["STOP_LOSS", "STOP_LOSS_MARKET"]:
#             order_payload.pop("trigger_price", None)
#         if order_type not in ["LIMIT", "STOP_LOSS"]:
#             order_payload["price"] = 0

#         print(f"📦 Sending Order Payload to Dhan API: {order_payload}")

#         # If market is open, place the order immediately
#         if is_market_open():
#             order_response = dhan.place_order(**order_payload)
#             print(f"🚨 Order Response from Dhan: {order_response}")

#             if order_response.get("status") == "success":
#                 order_id = order_response["data"].get("orderId")
#                 if not order_id:
#                     return jsonify({"error": "Order ID missing from response"}), 400

#                 save_offline_order(order_id, security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, "EXECUTED")

#                 return jsonify({
#                     "status": "success",
#                     "message": "Order placed and executed successfully",
#                     "order_id": order_id,
#                     "saved_data": order_payload
#                 }), 200

#             return jsonify({
#                 "status": "error",
#                 "message": "Order placement failed",
#                 "details": order_response
#             }), 400

#         # If market is closed, save the order as PENDING
#         else:
#             test_order_id = f"TEST_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
#             save_offline_order(test_order_id, security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, "PENDING")

#             return jsonify({
#                 "status": "offline",
#                 "message": "Market closed. Order saved for execution when market opens.",
#                 "test_order_id": test_order_id,
#                 "saved_data": [order_payload]
#             }), 200

#     except Exception as e:
#         print(f"⚠️ Error: {e}")
#         return jsonify({"error": "Internal Server Error", "details": str(e)}), 500
# # Function to process and execute PENDING orders when market opens
# def process_offline_orders(): 
#     """Executes stored offline orders when the market opens and updates status."""
#     if is_market_open():
#         conn = get_db_connection()
#         cursor = conn.cursor(dictionary=True)
#         cursor.execute("SELECT * FROM offline_order WHERE status = 'PENDING'")
#         orders = cursor.fetchall()

#         for order in orders:
#             try:
#                 # Convert Decimal values to float
#                 price = float(order["price"]) if order["price"] is not None else 0.0
#                 trigger_price = float(order["trigger_price"]) if order["trigger_price"] is not None else 0.0

#                 # Validate Order Type
#                 valid_order_types = ["MARKET", "LIMIT", "STOP_LOSS", "STOP_LOSS_MARKET"]
#                 if order["order_type"] not in valid_order_types:
#                     print(f"⚠️ Invalid order type: {order['order_type']}")
#                     continue  # Skip this order

#                 # Construct payload for Dhan API
#                 order_payload = {
#                     "security_id": order["security_id"],
#                     "exchange_segment": order["exchange_segment"],
#                     "transaction_type": order["transaction_type"],
#                     "quantity": order["quantity"],
#                     "order_type": order["order_type"],
#                     "product_type": order["product_type"],
#                     "price": price,  # if order["order_type"] in ["LIMT","STOP_LOSS"] else 0,
#                     "trigger_price": trigger_price # if order["order_type"] in ["STOP_LOSS", "STOP_LOSS_MARKET"] else 0
#                 }

                
#                 if order["order_type"] == "MARKET":
#                     order_payload.pop("price", 0.0)  
#                     order_payload.pop("trigger_price", 0.0)  

#                 print(f"📦 Processing Pending Order: {order_payload}")

                
#                 order_response = dhan.place_order(
#                     security_id=order_payload["security_id"],
#                     exchange_segment=order_payload["exchange_segment"],
#                     transaction_type=order_payload["transaction_type"],
#                     quantity=order_payload["quantity"],
#                     order_type=order_payload["order_type"],
#                     product_type=order_payload["product_type"],
#                     price=order_payload.get("price", 0.0),  # ✅ Ensure price is explicitly set
#                     trigger_price=order_payload.get("trigger_price", 0.0)
#                 )

#                 print(f"🚀 Order Response: {order_response}")

#                 if order_response.get("status") == "success":
#                     order_id = order_response["data"].get("orderId")  # ✅ Fix: Get orderId directly
#                     order_status = order_response["data"].get("orderStatus", "UNKNOWN")

#                     # Update order status in the database
#                     cursor.execute("UPDATE offline_order SET status = %s, order_id = %s WHERE id = %s",
#                                 (order_status, order_id, order["id"]))
#                     conn.commit()


#                 else:
#                     print(f"⚠️ Order execution failed: {order_response}")

#             except Exception as e:
#                 print(f"⚠️ Error processing pending order {order['id']}: {e}")

#         cursor.close()
#         conn.close()

# # Background job scheduler to process offline orders every morning
# scheduler = BackgroundScheduler()
# scheduler.add_job(process_offline_orders, 'interval', minutes=1)  # Runs every minute
# scheduler.start()


# def search():
#     query = request.args.get('query')
#     if not query:
#         return jsonify({"error": "Query parameter is missing"}), 400

#     # ✅ Search in all five columns and return a single row
#     sql = """
#     SELECT Exchange_segment, Security_ID, Instrument_Type, Lot_Size, Symbol_Name
#     FROM trading_data 
#     WHERE Exchange_segment LIKE %s 
#     OR Security_ID = %s
#     OR Instrument_Type LIKE %s
#     OR Lot_Size = %s
#     OR Symbol_Name LIKE %s
#     LIMIT 1
#     """

#     # ✅ Searching exactly for `Security_ID` & `Lot_Size`, loosely for others
#     cursor.execute(sql, (f"%{query}%", query, f"%{query}%", query, f"%{query}%"))
#     result = cursor.fetchone()

#     return jsonify(result) if result else jsonify({"message": "No data found"})



















from flask import Flask, jsonify, request, Blueprint
from dhanhq import dhanhq
import datetime
import json
from config import client_id, access_token
from db import save_offline_order, get_db_connection
from apscheduler.schedulers.background import BackgroundScheduler

# Initialize Dhan API Client
dhan = dhanhq(client_id, access_token)
place_order_bp = Blueprint("place_order", __name__)

# Market hours (9:15 AM to 3:30 PM IST)
def is_market_open():
    now = datetime.datetime.now()
    weekday = now.weekday()
    hour = now.hour
    minute = now.minute
    
    # Monday to Friday
    if weekday < 5:
        # Pre-market (9:00-9:15)
        if (hour == 9 and minute >= 0) or (hour == 9 and minute < 15):
            return False
        # Market hours (9:15-15:30)
        return (9 <= hour < 15) or (hour == 15 and minute <= 30)
    return False

@place_order_bp.route('/place-order', methods=['POST'])

def place_order():
    """Handles both equity and F&O (derivatives) orders with offline support"""
    try:
        data = request.get_json()

        # Required fields for all order types
        required_fields = [
            "security_id", "exchange_segment", "transaction_type",
            "quantity", "order_type", "product_type"
        ]

        # Extra checks for certain order types
        if data.get("order_type", "").upper() in ["LIMIT", "STOP_LOSS"]:
            required_fields.append("price")
        if data.get("order_type", "").upper() in ["STOP_LOSS", "STOP_LOSS_MARKET"]:
            required_fields.append("trigger_price")

        # Check for missing fields
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Extract data
        security_id = str(data["security_id"])
        exchange_segment = data["exchange_segment"]
        transaction_type = data["transaction_type"].upper()
        order_type = data["order_type"].upper()
        quantity = int(data["quantity"])
        product_type = data["product_type"].upper()
        price = float(data["price"]) if "price" in data else 0.0
        trigger_price = float(data["trigger_price"]) if "trigger_price" in data else 0.0

        # Validate values
        valid_segments = ["NSE_EQ", "BSE_EQ", "NSE_FNO", "BSE_FNO"]
        valid_products = ["CNC", "INTRADAY", "MARGIN"]
        if exchange_segment not in valid_segments:
            return jsonify({"error": f"Invalid exchange segment. Valid: {valid_segments}"}), 400
        if transaction_type not in ["BUY", "SELL"]:
            return jsonify({"error": "Invalid transaction type. Use BUY or SELL"}), 400
        if product_type not in valid_products:
            return jsonify({"error": f"Invalid product type. Valid: {valid_products}"}), 400

        # Set product_type to MARGIN for F&O orders automatically
        if exchange_segment in ["NSE_FNO", "BSE_FNO"]:
            product_type = "MARGIN"

        # Construct order payload (includes F&O required fields)
        order_payload = {
            "transaction_type": transaction_type,
            "exchange_segment": exchange_segment,
            "product_type": product_type,
            "order_type": order_type,
            "validity": "DAY",
            "security_id": security_id,
            "quantity": quantity,
            "disclosed_quantity": 0,
            "price": price if order_type in ["LIMIT", "STOP_LOSS"] else 0.0,
            "trigger_price": trigger_price if order_type in ["STOP_LOSS", "STOP_LOSS_MARKET"] else 0.0,
            "after_market_order": False,
            "amo_time": "",
            "bo_profit_value": 0.0,
        }

        # Remove fields not needed for specific order types
        if order_type == "MARKET":
            order_payload["price"] = 0.0
            order_payload["trigger_price"] = 0.0
        if order_type not in ["STOP_LOSS", "STOP_LOSS_MARKET"]:
            order_payload.pop("trigger_price", None)

        print(f"📦 Final Order Payload: {order_payload}")

        if is_market_open():
            # Place order via Dhan API
            order_response = dhan.place_order(**order_payload)
            print(f"✅ Live Order Response: {order_response}")

            if order_response.get("status") == "success":
                order_id = order_response["data"].get("orderId")
                # order_symbole = order_response["data"].get("symbol")
                save_offline_order(
                    order_id, security_id, exchange_segment,
                    transaction_type, quantity, order_type,
                    product_type, price, trigger_price, "EXECUTED"
                )

                return jsonify({
                    "status": "success",
                    "order_id": order_id,
                    "message": "Order placed and executed successfully",
                    "details": order_response.get("data")
                }), 200

            return jsonify({
                "status": "error",
                "message": "Order placement failed",
                "details": order_response
            }), 400

        else:
            # Market is closed - save offline order
            test_order_id = f"TEST_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
            save_offline_order(
                test_order_id, security_id, exchange_segment,
                transaction_type, quantity, order_type,
                product_type, price, trigger_price, "PENDING"
            )

            return jsonify({
                "status": "offline",
                "test_order_id": test_order_id,
                "message": "Market closed. Order saved for execution when market opens",
                "saved_data": order_payload
            }), 200

    except Exception as e:
        print(f"⚠️ Error placing order: {e}")
        return jsonify({"error": str(e)}), 500


@place_order_bp.route('/search', methods=['GET'])
def search():
    """Unified search for both equities and options"""
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Query parameter required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Try exact match first (for security IDs)
        cursor.execute("""
            SELECT * FROM trading_data 
            WHERE Security_ID = %s 
            LIMIT 1
        """, (query,))
        result = cursor.fetchone()
        
        if not result:
            # Fallback to symbol search
            cursor.execute("""
                SELECT * FROM trading_data 
                WHERE Symbol_Name LIKE %s
                ORDER BY CASE 
                    WHEN Exchange_segment = 'NSE_EQ' THEN 1
                    WHEN Exchange_segment = 'NSE_FNO' THEN 2
                    ELSE 3
                END
                LIMIT 10
            """, (f"%{query}%",))
            result = cursor.fetchall()

        return jsonify(result if result else {"message": "No instruments found"})

    finally:
        cursor.close()
        conn.close()

@place_order_bp.route('/search-options', methods=['GET'])
def search_options():
    """Advanced options search with step-by-step filters for NSE options data"""
    symbol = request.args.get('symbol')  # e.g., BANKNIFTY, NIFTY
    expiry = request.args.get('expiry')  # e.g., 2025-04-24
    option_type = request.args.get('type')  # e.g., CE, PE
    strike = request.args.get('strike')  # e.g., 33400 (optional)

    # Pagination
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('limit', 20))
    offset = (page - 1) * per_page

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        base_query = """
            SELECT 
                EXCHANGE_SEGMENT,
                SECURITY_ID,
                INSTRUMENT_NAME,
                SYMBOL_NAME,
                LOT_SIZE,
                STRIKE_PRICE,
                OPTION_TYPE,
                EXPIRY
            FROM options_data 
            WHERE EXCHANGE_SEGMENT = 'NSE_FNO'
            AND INSTRUMENT_NAME = 'OPTIDX'
        """
        params = []

        # Step 1: Filter by symbol (required first filter)
        if symbol:
            base_symbol = symbol.upper()
            # Extract base symbol from SYMBOL_NAME using string manipulation
            base_query += " AND LEFT(SYMBOL_NAME, INSTR(SYMBOL_NAME, '-') - 1) = %s"
            params.append(base_symbol)
        else:
            return jsonify({"error": "Symbol is required"}), 400

        # Step 2: Filter by expiry if provided
        if expiry:
            try:
                expiry_date = datetime.datetime.strptime(expiry, '%Y-%m-%d')
                base_query += " AND EXPIRY = %s"
                params.append(expiry)
            except ValueError:
                return jsonify({"error": "Invalid expiry date format. Use YYYY-MM-DD"}), 400

        # Step 3: Filter by option type if provided
        if option_type:
            option_type = option_type.upper()
            if option_type in ['CE', 'CALL']:
                base_query += " AND (OPTION_TYPE = 'CE' OR OPTION_TYPE = 'CALL')"
            elif option_type in ['PE', 'PUT']:
                base_query += " AND (OPTION_TYPE = 'PE' OR OPTION_TYPE = 'PUT')"
            else:
                return jsonify({"error": "Invalid option type. Use CE/CALL or PE/PUT"}), 400

        # Step 4: Filter by exact strike price if provided
        if strike:
            try:
                strike_value = float(strike)
                base_query += " AND STRIKE_PRICE = %s"
                params.append(strike_value)
            except ValueError:
                return jsonify({"error": "Invalid strike price"}), 400

        # Always sort by EXPIRY and STRIKE_PRICE for consistent results
        base_query += " ORDER BY EXPIRY ASC, STRIKE_PRICE ASC LIMIT %s OFFSET %s"
        params.extend([per_page, offset])

        # Debugging logs
        # print("-------------------------------------")
        # print(base_query)
        # print("symbol, expiry, option_type, strike")
        # print(f"{symbol}, {expiry}, {option_type}, {strike}")
        # print("=======================================")
        # print("Executing SQL with params:", params)

        cursor.execute(base_query, params)
        results = cursor.fetchall()
        # print("=======================================")
        # print("Results:", results)

        formatted_results = []
        for row in results:
            formatted_results.append({
                "Exchange_segment": row['EXCHANGE_SEGMENT'],
                "Security_ID": row['SECURITY_ID'],
                "Instrument_Type": row['INSTRUMENT_NAME'],
                "Symbol_Name": row['SYMBOL_NAME'].split('-')[0].upper(),  # Extract base symbol
                "Lot_Size": row['LOT_SIZE'],
                "Strike_Price": row['STRIKE_PRICE'],
                "Option_Type": row['OPTION_TYPE'],
                "Expiry_Date": row['EXPIRY'].strftime('%Y-%m-%d') if row['EXPIRY'] else None
            })

        return jsonify({
            "page": page,
            "limit": per_page,
            "count": len(formatted_results),
            "results": formatted_results
        })

    except Exception as e:
        print(f"Error in options search: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

def process_offline_orders():
    """Process pending orders when market opens"""
    if is_market_open():
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            cursor.execute("SELECT * FROM offline_order WHERE status = 'PENDING'")
            pending_orders = cursor.fetchall()

            for order in pending_orders:
                try:
                    order_payload = {
                        "security_id": order["security_id"],
                        "exchange_segment": order["exchange_segment"],
                        "transaction_type": order["transaction_type"],
                        "quantity": order["quantity"],
                        "order_type": order["order_type"],
                        "product_type": order["product_type"],
                        "price": float(order["price"]) if order["price"] else 0,
                        "trigger_price": float(order["trigger_price"]) if order["trigger_price"] else 0
                    }

                    # Clean up payload
                    if order["order_type"] == "MARKET":
                        order_payload.pop("price", None)
                        order_payload.pop("trigger_price", None)

                    response = dhan.place_order(**order_payload)
                    
                    if response.get("status") == "success":
                        cursor.execute("""
                            UPDATE offline_order 
                            SET status = %s, order_id = %s 
                            WHERE id = %s
                        """, (
                            response["data"].get("orderStatus", "EXECUTED"),
                            response["data"].get("orderId"),
                            order["id"]
                        ))
                        conn.commit()

                except Exception as e:
                    print(f"Failed to process order {order['id']}: {str(e)}")
                    continue

        finally:
            cursor.close()
            conn.close()

# Schedule offline order processing
scheduler = BackgroundScheduler()
scheduler.add_job(process_offline_orders, 'interval', minutes=1)
scheduler.start()























































# def search_options():
#     """Advanced options search with filters for NSE options data"""
#     symbol = request.args.get('symbol')  # comma-separated e.g., NIFTY,BANKNIFTY
#     expiry = request.args.get('expiry')
#     expiry_after = request.args.get('expiry_after')
#     option_type = request.args.get('type')
#     strike = request.args.get('strike')
#     strike_min = request.args.get('strike_min')
#     strike_max = request.args.get('strike_max')
#     instrument = request.args.get('instrument', 'OPTIDX')

#     # Pagination
#     page = int(request.args.get('page', 1))
#     per_page = int(request.args.get('limit', 50))
#     offset = (page - 1) * per_page

#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)

#     try:
#         base_query = """
#             SELECT 
#                 EXCHANGE_SEGMENT,
#                 SECURITY_ID,
#                 INSTRUMENT_NAME,
#                 SYMBOL_NAME,
#                 LOT_SIZE,
#                 STRIKE_PRICE,
#                 OPTION_TYPE,
#                 EXPIRY
#             FROM options_data 
#             WHERE EXCHANGE_SEGMENT = 'NSE_FNO'
#             AND INSTRUMENT_NAME = %s
#         """
#         params = [instrument]

#         if symbol:
#             symbols = [s.strip() for s in symbol.split(',')]
#             placeholders = ','.join(['%s'] * len(symbols))
#             base_query += f" AND SYMBOL_NAME IN ({placeholders})"
#             params.extend(symbols)
#         else:
#             return jsonify({"error": "Symbol is required"}), 400


#         if expiry:
#             try:
#                 datetime.datetime.strptime(expiry, '%Y-%m-%d')
#                 base_query += " AND EXPIRY = %s"
#                 params.append(expiry)
#             except ValueError:
#                 return jsonify({"error": "Invalid expiry date format. Use YYYY-MM-DD"}), 400

#         if expiry_after:
#             try:
#                 datetime.datetime.strptime(expiry_after, '%Y-%m-%d')
#                 base_query += " AND EXPIRY >= %s"
#                 params.append(expiry_after)
#             except ValueError:
#                 return jsonify({"error": "Invalid expiry_after date format. Use YYYY-MM-DD"}), 400

#         if option_type:
#             option_type = option_type.upper()
#             if option_type in ['CE', 'CALL']:
#                 base_query += " AND (OPTION_TYPE = 'CE' OR OPTION_TYPE = 'CALL')"
#             elif option_type in ['PE', 'PUT']:
#                 base_query += " AND (OPTION_TYPE = 'PE' OR OPTION_TYPE = 'PUT')"
#             else:
#                 return jsonify({"error": "Invalid option type. Use CE/CALL or PE/PUT"}), 400

#         if strike:
#             try:
#                 base_query += " AND STRIKE_PRICE = %s"
#                 params.append(float(strike))
#             except ValueError:
#                 return jsonify({"error": "Invalid strike price"}), 400

#         if strike_min and strike_max:
#             try:
#                 base_query += " AND STRIKE_PRICE BETWEEN %s AND %s"
#                 params.extend([float(strike_min), float(strike_max)])
#             except ValueError:
#                 return jsonify({"error": "Invalid strike price range"}), 400

#         base_query += " ORDER BY EXPIRY ASC, STRIKE_PRICE ASC LIMIT %s OFFSET %s"
#         params.extend([per_page, offset])

#         print("-------------------------------------")
#         print(base_query)
#         print("symbol, expiry, expiry_after, option_type, strike, strike_min, strike_max, instrument")
#         print(f"{symbol}, {expiry}, {expiry_after}, {option_type}, {strike}, {strike_min}, {strike_max}, {instrument}")

#         cursor.execute(base_query, params)
#         results = cursor.fetchall()
#         print("=============================")
#         print(results)

#         formatted_results = []
#         for row in results:
#             formatted_results.append({
#                 "Exchange_segment": row['EXCHANGE_SEGMENT'],
#                 "Security_ID": row['SECURITY_ID'],
#                 "Instrument_Type": row['INSTRUMENT_NAME'],
#                 "Symbol_Name": row['SYMBOL_NAME'],
#                 "Lot_Size": row['LOT_SIZE'],
#                 "Strike_Price": row['STRIKE_PRICE'],
#                 "Option_Type": row['OPTION_TYPE'],
#                 "Expiry_Date": row['EXPIRY'].strftime('%Y-%m-%d') if row['EXPIRY'] else None
#             })

#         return jsonify({
#             "page": page,
#             "limit": per_page,
#             "count": len(formatted_results),
#             "results": formatted_results
#         })

#     except Exception as e:
#         print(f"Error in options search: {str(e)}")
#         return jsonify({"error": "Internal server error"}), 500
#     finally:
#         cursor.close()
#         conn.close()







# def place_order():
#     """Handles both equity and option orders with offline support"""
#     try:
#         data = request.get_json()

#         # Common validation for all orders
#         required_fields = ["security_id", "exchange_segment", "transaction_type", 
#                          "quantity", "order_type", "product_type"]
        
#         # Additional validations based on order type
#         if data.get("order_type") in ["LIMIT", "STOP_LOSS"]:
#             required_fields.append("price")
#         if data.get("order_type") in ["STOP_LOSS", "STOP_LOSS_MARKET"]:
#             required_fields.append("trigger_price")

#         # Check missing fields
#         for field in required_fields:
#             if field not in data:
#                 return jsonify({"error": f"Missing required field: {field}"}), 400

#         # Process input data
#         security_id = str(data["security_id"])
#         exchange_segment = data["exchange_segment"]
#         transaction_type = data["transaction_type"].upper()
#         order_type = data["order_type"].upper()
#         quantity = int(data["quantity"])
#         product_type = data["product_type"].upper()

#         # Price validations
#         price = float(data["price"]) if "price" in data and data["price"] is not None else 0.0
#         trigger_price = float(data["trigger_price"]) if "trigger_price" in data and data["trigger_price"] is not None else None
        
#         # Special handling for F&O orders
#         if exchange_segment in ["NSE_FNO", "BSE_FNO"]:
#             # Force MARGIN product for derivatives
#             product_type = "MARGIN"
            
#             # # Validate option contract format
#             # if not security_id.startswith(("OPTIDX", "OPTSTK")):
#             #     return jsonify({"error": "Invalid option contract ID"}), 400



#         # Validate exchange segments
#         valid_segments = ["NSE_EQ", "BSE_EQ", "NSE_FNO", "BSE_FNO", "MCX_COM"]
#         if exchange_segment not in valid_segments:
#             return jsonify({"error": f"Invalid exchange segment. Valid: {valid_segments}"}), 400

#         # Validate transaction type
#         if transaction_type not in ["BUY", "SELL"]:
#             return jsonify({"error": "Invalid transaction type. Use BUY/SELL"}), 400

#         # Validate product type
#         valid_products = ["CNC", "INTRADAY", "MARGIN"]
#         if product_type not in valid_products:
#             return jsonify({"error": f"Invalid product type. Valid: {valid_products}"}), 400

#         # Construct order payload
#         order_payload = {
#             "security_id": security_id,
#             "exchange_segment": exchange_segment,
#             "transaction_type": transaction_type,
#             "quantity": quantity,
#             "order_type": order_type,
#             "product_type": product_type,
#             "price": price if order_type in ["LIMIT", "STOP_LOSS"] else 0,
#             "trigger_price": trigger_price if order_type in ["STOP_LOSS", "STOP_LOSS_MARKET"] else 0
#         }

#         # Clean up payload based on order type
#         if order_type == "MARKET":
#             order_payload.pop("price", None)
#             order_payload.pop("trigger_price", None)
#         if order_type not in ["STOP_LOSS", "STOP_LOSS_MARKET"]:
#             order_payload.pop("trigger_price", None)
#         if order_type not in ["LIMIT", "STOP_LOSS"]:
#             order_payload["price"] = 0

#         print(f"📦 Sending Order Payload to Dhan API: {order_payload}")

#         # Market open - execute immediately
#         if is_market_open():
#             order_response = dhan.place_order(**order_payload)
#             print(f"🚀 Order Response: {order_response}")

#             if order_response.get("status") == "success":
#                 order_id = order_response["data"].get("orderId")
#                 if not order_id:
#                     return jsonify({"error": "Order ID missing from response"}), 400

#                 save_offline_order(
#                     order_id, security_id, exchange_segment, 
#                     transaction_type, quantity, order_type,
#                     product_type, price, trigger_price, "EXECUTED"
#                 )

#                 return jsonify({
#                     "status": "success",
#                     "order_id": order_id,
#                     "message": "Order placed and executed successfully",
#                     "details": order_response.get("data")
#                 }), 200

#             return jsonify({
#                 "status": "error",
#                 "message": "Order placement failed",
#                 "details": order_response
#             }), 400

#         # Market closed - save for later execution
#         else:
#             test_order_id = f"TEST_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
#             save_offline_order(
#                 test_order_id, security_id, exchange_segment,
#                 transaction_type, quantity, order_type,
#                 product_type, price, trigger_price, "PENDING"
#             )

#             return jsonify({
#                 "status": "offline",
#                 "test_order_id": test_order_id,
#                 "message": "Market closed. Order saved for execution when market opens",
#                 "saved_data": order_payload
#             }), 200

#     except Exception as e:
#         print(f"⚠️ Error: {e}")
#         return jsonify({"error": str(e)}), 500


# from flask import Blueprint, jsonify
# from extensions import db
# from models.Order import Order
# from config import API_KEY, API_SECRET
# import sys
# import os
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# from binance.client import Client
# import os

# # Load Binance API Keys
# binance_client = Client(API_KEY, API_SECRET)

# dummy_pnl_report_bp = Blueprint("pnl", __name__)

# def get_live_price(symbol):
#     """ Fetches live price from Binance """
#     try:
#         ticker = binance_client.get_symbol_ticker(symbol=symbol)
#         return float(ticker["price"])
#     except Exception as e:
#         print(f"Error fetching price for {symbol}: {e}")
#         return None

# @dummy_pnl_report_bp.route("/dummy_pnl_report", methods=["GET"])
# def dummy_pnl_report():   
#     """ Generates PnL report for dummy and actual orders """
#     try:
#         orders = Order.query.all()
#         if not orders:
#             return jsonify({"message": "No orders found."}), 404

#         report_data = []
        
#         for order in orders:
#             live_price = get_live_price(order.symbol)
#             if live_price is None:
#                 continue  # Skip if price retrieval fails

#             unrealized_pnl = (live_price - order.buy_price) * order.quantity
#             pnl_percentage = ((live_price - order.buy_price) / order.buy_price) * 100

#             report_entry = {
#                 "order_id": order.order_id,
#                 "symbol": order.symbol,
#                 "buy_price": order.buy_price,
#                 "live_price": live_price,
#                 "quantity": order.quantity,
#                 "unrealized_pnl": unrealized_pnl,
#                 "pnl_percentage": round(pnl_percentage, 2),
#                 "order_type": order.order_type
#             }
#             report_data.append(report_entry)

#         return jsonify(report_data)

#     except Exception as err:
#         return jsonify({"error": str(err)}), 500






# from flask import Blueprint, jsonify
# from extensions import db
# from models import Order  # ✅ Fixed import
# from config import API_KEY, API_SECRET
# from binance.client import Client
# import sys

# # Load Binance API Keys
# binance_client = Client(API_KEY, API_SECRET)

# dummy_pnl_report_bp = Blueprint("pnl", __name__)

# def get_live_price(symbol):
#     """ Fetches live price from Binance """
#     try:
#         formatted_symbol = symbol.upper().replace(" ", "")  # ✅ Format symbol
#         ticker = binance_client.get_symbol_ticker(symbol=formatted_symbol)
#         return float(ticker["price"])
#     except Exception as e:
#         print(f"Error fetching price for {symbol}: {e}")
#         return None

# @dummy_pnl_report_bp.route("/dummy_pnl_report", methods=["GET"])
# def dummy_pnl_report():   
#     """ Generates PnL report for dummy and actual orders """
#     try:
#         orders = Order.query.all()
#         print("==============",orders)
#         if not orders:
#             return jsonify({"message": "No orders found."}), 404

#         report_data = []
        
#         for order in orders:
#             print("==============",order)
#             live_price = get_live_price(order.symbol)
#             print("=||||||||||||||||=",live_price)
#             unrealized_pnl = (live_price - order.price) * order.quantity if live_price else 0
#             pnl_percentage = ((live_price - order.price) / order.price) * 100 if live_price else 0

#             report_entry = {
#                 "order_id": order.id,  # ✅ Ensure correct ID
#                 "symbol": order.symbol,
#                 "price": order.price,
#                 "live_price": live_price if live_price else order.price,  # ✅ Use buy_price if price fetch fails
#                 "quantity": order.quantity,
#                 "unrealized_pnl": round(unrealized_pnl, 2),
#                 "pnl_percentage": round(pnl_percentage, 2),
#                 "order_type": order.order_type
#             }
#             report_data.append(report_entry)

#         return jsonify(report_data)

#     except Exception as err:
#         print(f"Error in dummy_pnl_report: {err}", file=sys.stderr)  # ✅ Log error
#         return jsonify({"error": "Internal server error. Check logs."}), 500






from flask import Blueprint, jsonify
from extensions import db
from models import Order  # ✅ Fixed import
from config import API_KEY, API_SECRET
from binance.client import Client
import sys

# Load Binance API Keys
binance_client = Client(API_KEY, API_SECRET)

dummy_pnl_report_bp = Blueprint("pnl", __name__)

def get_live_price(symbol):
    """ Fetches live price from Binance """
    try:
        formatted_symbol = symbol.upper().replace(" ", "")  # ✅ Format symbol
        print("==============",formatted_symbol)
        ticker = binance_client.get_symbol_ticker(symbol=formatted_symbol)
        return float(ticker["price"])
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return None

@dummy_pnl_report_bp.route("/dummy_pnl_report", methods=["GET"])
def dummy_pnl_report():   
    """ Generates PnL report for dummy and actual orders """
    try:
        orders = Order.query.all()
        print("==______+++++++++____________===",orders)
        if not orders:
            return jsonify({"message": "No orders found."}), 404

        report_data = []
        
        for order in orders:
            live_price = get_live_price(order.symbol)
            print("=||||||||||||||||=",live_price)  

            # ✅ Ensure valid values for calculations
            order_price = order.price if order.price is not None else 0
            order_quantity = order.quantity if order.quantity is not None else 0
            live_price = live_price if live_price is not None else order_price  # ✅ Use order price if live price fails

            unrealized_pnl = (live_price - order_price) * order_quantity
            pnl_percentage = ((live_price - order_price) / order_price) * 100 if order_price != 0 else 0

            report_entry = {
                "order_id": order.order_id,  # ✅ Ensure correct ID
                "symbol": order.symbol,
                "price": order_price,
                "live_price": live_price,  # ✅ Default to order price if live price is None
                "quantity": order_quantity,
                "unrealized_pnl": round(unrealized_pnl, 2),
                "pnl_percentage": round(pnl_percentage, 2),
                "order_type": order.order_type
            }
            report_data.append(report_entry)

        return jsonify(report_data)

    except Exception as err:
        print(f"Error in dummy_pnl_report: {err}", file=sys.stderr)  # ✅ Log error
        return jsonify({"error": "Internal server error. Check logs."}), 500

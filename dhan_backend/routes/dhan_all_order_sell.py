from flask import Flask, jsonify, Blueprint
from binance.client import Client
from config import API_KEY, API_SECRET, BASE_URL  # Ensure API_SECRET is imported


sell_all_orders_bp = Blueprint("sell_all_orders", __name__)


# Initialize Binance client
client = Client(API_KEY, API_SECRET)


@sell_all_orders_bp.route("/sell_all_orders", methods=["POST"])
def sell_all_orders():
    """Sell all active orders at market price."""
    try:
        open_orders = client.get_open_orders()
        sold_orders = []

        for order in open_orders:
            symbol = order["symbol"]
            order_id = order["orderId"]
            side = order["side"]  # Buy or Sell
            quantity = float(order["origQty"]) - float(order["executedQty"])  # Remaining amount to sell
            
            # Only process open SELL orders
            if side == "SELL" and quantity > 0:
                # Cancel the existing order first
                client.cancel_order(symbol=symbol, orderId=order_id)
                
                # Place a Market Sell order for the remaining quantity
                client.order_market_sell(symbol=symbol, quantity=quantity)
                
                sold_orders.append({"symbol": symbol, "quantity_sold": quantity})

        return jsonify({"message": "All sell orders executed at market price", "sold_orders": sold_orders})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



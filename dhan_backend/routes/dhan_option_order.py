from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Dhan API Credentials
DHAN_API_KEY = "your_api_key"
DHAN_CLIENT_ID = "your_client_id"
DHAN_BASE_URL = "https://api.dhan.co"

HEADERS = {
    "accept": "application/json",
    "X-Dhan-Client-Id": DHAN_CLIENT_ID,
    "X-Dhan-API-Key": DHAN_API_KEY
}

# Place Options Order
@app.route("/place_option_order", methods=["POST"])
def place_option_order():
    try:
        data = request.json
        order_payload = {
            "security_id": data["security_id"],
            "exchange_segment": "NSE_FNO",
            "transaction_type": data["transaction_type"],
            "quantity": data["quantity"],
            "order_type": data["order_type"],
            "product_type": data["product_type"],
            "price": data.get("price", 0),
            "trigger_price": data.get("trigger_price", 0)
        }
        
        response = requests.post(f"{DHAN_BASE_URL}/orders/options", json=order_payload, headers=HEADERS)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)})

# Fetch Available Option Contracts
@app.route("/fetch_option_chain/<symbol>", methods=["GET"])
def fetch_option_chain(symbol):
    try:
        response = requests.get(f"{DHAN_BASE_URL}/options/chain/{symbol}", headers=HEADERS)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)})

# Check Order Status
@app.route("/order_status/<order_id>", methods=["GET"])
def order_status(order_id):
    try:
        response = requests.get(f"{DHAN_BASE_URL}/orders/status/{order_id}", headers=HEADERS)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)


import sys
import os
from flask import Flask
from flask_cors import CORS
from extensions import socketio
import logging
from routes.dhan_new_order import place_order_bp
from routes.dhan_security_id_search import search_bp
from routes.dhan_pnl import pnl_report_bp, socketio, start_pnl_stream
from routes.dhan_login import auth_bp
from routes.dhan_sell_order import place_sell_order_bp, process_offline_orders
from routes.dhan_user_login import user_login_bp
from routes.dhan_chart_data import chart_data_bp
from routes.dhan_trading_bot import trading_bot_bp

# Fix ImportError by adding project root to Python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Initialize Flask App
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
app = Flask(__name__)

# Load Configurations
app.config.from_object("config")

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Initialize Flask-SocketIO
# socketio = SocketIO(app, cors_allowed_origins="*")  # Allow CORS for local development
socketio.init_app(app, cors_allowed_origins="http://localhost:3000", logger=True, engineio_logger=True)

# Register Blueprints
app.register_blueprint(place_order_bp, url_prefix="/api")
app.register_blueprint(search_bp, url_prefix="/api")
app.register_blueprint(pnl_report_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(place_sell_order_bp, url_prefix="/api")
app.register_blueprint(user_login_bp, url_prefix="/api")
app.register_blueprint(chart_data_bp, url_prefix="/api")
app.register_blueprint(trading_bot_bp, url_prefix="/api")


logger.info("Flask app initialized, attempting to start PnL stream...")
try:
    start_pnl_stream()  # Start the PnL stream after SocketIO initialization
    logger.info("PnL stream startup initiated successfully.")
except Exception as e:
    logger.error(f"Failed to initiate PnL stream: {e}")

# Run Flask App with WebSocket Support
if __name__ == "__main__":
    start_pnl_stream()
    print("🚀 Starting Flask app with WebSocket support...")
    logger.info("Starting Flask-SocketIO server...")
    socketio.run(app, host="127.0.0.1", port=5000, debug=True)


from app import app
from dhan_backend.routes.dhan_new_order import place_order_bp
from dhan_backend.routes.dhan_order_cencel import cancel_order_bp
from dhan_backend.routes.dhan_order_modify import modify_order_bp
from dhan_backend.routes.dhan_pnl import pnl_report_bp

# Register Blueprints
app.register_blueprint(place_order_bp, url_prefix="/api")
app.register_blueprint(pnl_report_bp, url_prefix="/api")
app.register_blueprint(modify_order_bp, url_prefix="/api")
app.register_blueprint(cancel_order_bp, url_prefix="/api")

from extensions import db

class Order(db.Model):
    __tablename__ = "order"     # ✅ Table name specified

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.String(50), unique=True, nullable=False)
    symbol = db.Column(db.String(50), nullable=False)
    side = db.Column(db.String(10), nullable=False)
    order_type = db.Column(db.String(30), nullable=False)  # "dummy" ya "actual"
    quantity = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=True)
    stop_price = db.Column(db.Float, nullable=True)
    activate_price = db.Column(db.Float, nullable=True)
    price_rate = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    # ✅ Data store and fetch methods   
    def to_dict(self):
        return {
            "order_id": self.order_id,
            "symbol": self.symbol,
            "price": self.price,
            "quantity": self.quantity,
            "order_type": self.order_type,
            "side": self.side,
            "status": self.status,
            "timestamp": self.timestamp
        }

    def __repr__(self):
        return f"<Order {self.order_id}>"

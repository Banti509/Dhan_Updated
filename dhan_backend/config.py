

BASE_URL = "https://api.dhan.co/v2" 
ORDER_URL = f"{BASE_URL}/orders"
MARKET_PRICE_URL = f"{BASE_URL}/market/v2/quotes"
DHAN_LTP_URL = "https://api.dhan.co/market/ltp"  # <-- Verify the correct endpoint
market_feed_wss = 'wss://api-feed.dhan.co'
# DHAN_BASE_URL = "https://api.dhan.co/v2"


client_id = "1106317221" 
access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzQ5NjQ2Nzk5LCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwNjMxNzIyMSJ9.82INMERBBo2nG7hhpHzvAy0LsVrCVm-3vVDmrg64gcRC9PDDxjeCb7NGbUwk8rw8MEIBowl5rFF3EH4RccTj9Q"


HEADERS = {
    "Content-Type": "application/json",
    "access-token": access_token,
    "client-id": client_id, 
}

# Database Configuration
class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://username:password@localhost/dhan_database' 
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "supersecretkey"

# Database Configuration
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = ""
MYSQL_DATABASE = "dhan_database"
# MYSQL_DATABASE = "trading_bot"

# SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://username:password@localhost/dhan_database'
# SQLALCHEMY_TRACK_MODIFICATIONS = False


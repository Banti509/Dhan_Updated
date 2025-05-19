import mysql.connector
from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

def get_db_connection():
    return  mysql.connector.connect(
        host=MYSQL_HOST,        
        user=MYSQL_USER,        
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE 
    )
    
    cursor = conn.cursor()
    connection = get_db_connection()  # ✅ Make sure this is called correctly

    cursor = conn.cursor(dictionary=True)
    return conn, cursor


def save_offline_order(order_id, security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, status, order_symbol):
    """Saves order details into the database."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        INSERT INTO offline_order 
        (order_id, security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, status, created_at, order_symbol)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s,  NOW(), %s)
    """

    # query = """
    #     INSERT INTO offline_order 
    #     (order_id, security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, status, created_at)
    #     SELECT %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
    #     WHERE NOT EXISTS (
    #         SELECT 1 FROM offline_order 
    #         WHERE security_id = %s AND transaction_type = 'SELL'
    #     );
    #     """
    cursor.execute(query, (order_id,  security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, status, order_symbol))

    conn.commit()
    cursor.close()
    conn.close()




def save_watchlist_to_db(watchlist):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE IF NOT EXISTS watchlist (symbol VARCHAR(50), security_id VARCHAR(20))")
    cursor.execute("TRUNCATE TABLE watchlist")
    for item in watchlist:
        cursor.execute("INSERT INTO watchlist (symbol, security_id) VALUES (%s, %s)", (item['symbol'], item['security_id']))
    conn.commit()
    cursor.close()
    conn.close()






# import mysql.connector
# from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

# def get_db_connection():
#     """Establishes and returns a MySQL connection."""
#     try:
#         return  mysql.connector.connect(
#             host=MYSQL_HOST,
#             user=MYSQL_USER,
#             password=MYSQL_PASSWORD,
#             database=MYSQL_DATABASE
#         )
#         cursor = conn.cursor()
#         connection = get_db_connection()  # ✅ Make sure this is called correctly

#         cursor = conn.cursor(dictionary=True)
#         return conn, cursor

#     except mysql.connector.Error as err:
#         print(f"Error connecting to database: {err}")
#         raise

# def save_offline_order(user_id, order_id, security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, status, order_symbol):
#     """Saves order details into the database for a specific user."""
#     conn = None
#     cursor = None
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor(dictionary=True)

#         query = """
#             INSERT INTO offline_order 
#             (user_id, order_id, security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, status, order_symbol, created_at)
#             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, % got, %s, %s, NOW())
#         """
#         cursor.execute(query, (user_id, order_id, security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, status, order_symbol))

#         conn.commit()
#         print(f"Order {order_id} saved for user {user_id}")
#     except mysql.connector.Error as err:
#         print(f"Error saving order: {err}")
#         raise
#     finally:
#         if cursor:
#             cursor.close()
#         if conn:
#             conn.close()
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


def save_offline_order(order_id, security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, status):
    """Saves order details into the database."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        INSERT INTO offline_order 
        (order_id, security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, status, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
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
    cursor.execute(query, (order_id, security_id, exchange_segment, transaction_type, quantity, order_type, product_type, price, trigger_price, status))

    conn.commit()
    cursor.close()
    conn.close()





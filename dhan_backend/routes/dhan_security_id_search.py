from flask import Flask, request, jsonify, Blueprint
from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
from flask_cors import CORS
import mysql.connector
# from extensions import db
from db import get_db_connection

search_bp = Blueprint("search", __name__)

@search_bp.route('/search', methods=['GET'])
def search():
    response = []
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Query parameter is missing"}), 400
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # ✅ Open a new cursor inside the request scope
        # cursor = db.cursor(dictionary=True)

        # ✅ Search in all five columns and return a single row
        sql = """
        SELECT Exchange_segment, Security_ID, Instrument_Type, Lot_Size, Symbol_Name
        FROM trading_data 
        WHERE Exchange_segment LIKE %s 
        OR Security_ID = %s
        OR Instrument_Type LIKE %s
        OR Lot_Size = %s
        OR Symbol_Name LIKE %s
        LIMIT 1
        """
        # print(sql, (f"%{query}%", query, f"%{query}%", query, f"%{query}%"),"---------------------------")
        # ✅ Searching exactly for `Security_ID` & `Lot_Size`, loosely for others
        cursor.execute(sql, (f"%{query}%", query, f"%{query}%", query, f"%{query}%"))
        result = cursor.fetchone()
        # print(result,"---------------------------")
        response.append(result)
        cursor.close()  # ✅ Close the cursor after executing the query

        # return jsonify(result) if result else jsonify({"message": "No data found"})
        return response

    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500

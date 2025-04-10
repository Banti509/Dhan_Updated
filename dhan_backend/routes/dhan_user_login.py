

from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
import mysql.connector
from db import get_db_connection

app = Flask(__name__)
CORS(app)

user_login_bp = Blueprint("user_login", __name__)

@user_login_bp.route("/user_login", methods=["POST"])
def user_login():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    data = request.json
    action = data.get("action")  # Expected values: "signup", "login"

    if action == "signup":
        name = data.get("name")
        client_id = data.get("client_id")
        access_token = data.get("access_token")

        cursor.execute("SELECT * FROM user_credentials WHERE client_id = %s", (client_id,))
        if cursor.fetchone():
            return jsonify({"error": "User already exists"}), 400

        cursor.execute("INSERT INTO user_credentials (name, client_id, access_token) VALUES (%s, %s, %s)", 
                       (name, client_id, access_token))
        db.commit()
        return jsonify({"message": "Account created successfully"}), 201

    elif action == "login":
        client_id = data.get("client_id")
        access_token = data.get("access_token")

        cursor.execute("SELECT name FROM user_credentials WHERE client_id = %s AND access_token = %s", 
                       (client_id, access_token))
        user = cursor.fetchone()

        if user:
            return jsonify({"message": "Login successful", "user": user["name"]}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    else:
        return jsonify({"error": "Invalid action"}), 400

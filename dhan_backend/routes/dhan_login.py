

from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
import mysql.connector
from db import get_db_connection

app = Flask(__name__)
CORS(app)

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/auth", methods=["POST"])
def auth():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    data = request.json
    action = data.get("action")  # Expected values: "signup", "login", "google_login"

    if action == "signup":
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "User already exists"}), 400

        cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)", (name, email, password))
        db.commit()
        return jsonify({"message": "Account created successfully"}), 201

    elif action == "login":
        email = data.get("email")
        password = data.get("password")

        cursor.execute("SELECT name FROM users WHERE email = %s AND password = %s", (email, password))
        user = cursor.fetchone()

        if user:
            return jsonify({"message": "Login successful", "user": user["name"]}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    elif action == "google_login":
        email = data.get("email")
        name = data.get("name")

        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if not cursor.fetchone():
            cursor.execute("INSERT INTO users (name, email) VALUES (%s, %s)", (name, email))
            db.commit()

        return jsonify({"message": "Google login successful", "user": name}), 200

    else:
        return jsonify({"error": "Invalid action"}), 400






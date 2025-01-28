from flask import request, jsonify, current_app
from app.blueprints.auth import auth_bp
from app import mongo_db as db


import bcrypt
import jwt


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    username = data.get("username")

    user = db["users"].find_one({"username": username})
    password = data.get("password")
    if user:
        if bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            token = jwt.encode({"username": username, "sub": username}, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")
            return jsonify({"token": token}, 200)
        else:
            return jsonify({"message": "Invalid password"}), 401
    else:
        return jsonify({"message": "User not found"}), 404

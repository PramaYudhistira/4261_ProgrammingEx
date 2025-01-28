from flask import request, jsonify, current_app
from app.blueprints.auth import auth_bp
from app import mongo_db as db


import bcrypt
import jwt


@auth_bp.route('/login', methods=['POST'])
def login():
    print("BEFORE CALLING get_json")

    data = request.get_json()

    print("CHECK")
    username = data.get("username")

    user = db["users"].find_one({"username": username})
    password = data.get("password")
    if user:
        if bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            token = jwt.encode({"username": username}, current_app.config["SECRET_KEY_JWT"], algorithm="HS256")
            return jsonify({"token": token}, 200)
        else:
            return jsonify({"message": "Invalid password"}), 401
    else:
        return jsonify({"message": "User not found"}), 404


#this function is only for dummy token
@auth_bp.route("/get_token", methods=["GET"])
def get_token():
    token = jwt.encode({"dummy": "data"}, current_app.config["SECRET_KEY_JWT"], algorithm="HS256")
    return jsonify({"token": token, "message": "backend connected!!!"}), 200


@auth_bp.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "hello from auth blueprint"}), 200

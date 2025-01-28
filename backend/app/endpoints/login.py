from flask import request, jsonify, current_app
from app.blueprints.auth import auth_bp
from app import mongo_db


import bcrypt
import jwt


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    #SAVE USERNAME AND HASHED PASSWORD TO DB

    return jsonify({"message": "endpoint hit"}, 201)


@auth_bp.route('/login', methods=['POST'])
def login():
    print("BEFORE CALLING get_json")

    data = request.get_json()

    print("CHECK")
    username = data.get("username")
    password = data.get("password")

    #for now, we dont need password, just need to see if it returns token
    token = jwt.encode({"username": username}, current_app.config["SECRET_KEY_JWT"], algorithm="HS256")

    return jsonify({"token": token}, 200)


#this function is only for dummy token
@auth_bp.route("/get_token", methods=["GET"])
def get_token():
    token = jwt.encode({"dummy": "data"}, current_app.config["SECRET_KEY_JWT"], algorithm="HS256")
    return jsonify({"token": token, "message": "backend connected!!!"}), 200


@auth_bp.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "hello from auth blueprint"}), 200

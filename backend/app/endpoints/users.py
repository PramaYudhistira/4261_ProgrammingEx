from flask import jsonify, request
from app import mongo_db as db
from app.blueprints.default import default_bp
from flask_jwt_extended import jwt_required, get_jwt_identity

import bcrypt


@default_bp.route("/user_test", methods=["GET"])
def get_user_test():
    test_user = {"username": "testUsername"}
    print("going to mongo")
    print(db)
    user = db["users"].find_one(test_user)
    print('found')

    if user:
        user["_id"] = str(user["_id"])
        return jsonify(user), 200


@default_bp.route("/add_task", methods=["POST"])
@jwt_required()
def add_task():
    try:
        data = request.get_json()
        task = data.get("task")
        
        current_user = get_jwt_identity() # this will return the username from the JWT

        if not task:
            return jsonify({"error": "Task is required"}), 400

        db["users"].update_one({"username": current_user}, {"$push": {"tasks": task}})

        return jsonify({"message": "Task added successfully"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@default_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()  # Get JSON data from the request

        username = data.get("username")
        user = db["users"].find_one({"username": username})
        if user:
            return jsonify({"error": "Username already exists"}), 400

        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        user = {"username": username, "password": hashed_password.decode('utf-8'), "tasks": []}
        db.users.insert_one(user)

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

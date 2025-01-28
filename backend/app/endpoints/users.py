from flask import jsonify, request
from app import mongo_db as db
from app.blueprints.default import default_bp
from flask_jwt_extended import jwt_required, get_jwt_identity

import bcrypt


@default_bp.route("/user_test", methods=["GET"])
def get_user_test():
    test_user = {"username": "testUsername"}

    user = db["users"].find_one(test_user)

    if user:
        user["_id"] = str(user["_id"])
        return jsonify(user), 200


@default_bp.route("/add_task", methods=["POST"])
@jwt_required()
def add_task():
    try:
        print("trying this endpoint")
        data = request.get_json()
        print("checking task")
        task = data.get("task")
        print(task)

        task_name = task.get("title")
        
        current_user = get_jwt_identity() # this will return the username from the JWT

        if not task:
            return jsonify({"error": "Task is required"}), 400
        
        user = db["users"].find_one({"username": current_user})
        
        if user:
            for existing_task in user.get("tasks", []):
                print(existing_task)
                if existing_task.get("title") == task_name:
                    return jsonify({'error': "task already exists"}), 400

        db["users"].update_one({"username": current_user}, {"$push": {"tasks": task}})

        return jsonify({"message": "Task added successfully"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@default_bp.route("/get_tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    try:
        current_user = get_jwt_identity()  # this will return the username from the JWT

        user = db["users"].find_one({"username": current_user})
        tasks = user.get("tasks", [])

        return jsonify({"tasks": tasks}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    

@default_bp.route("/delete_task", methods=["DELETE"])
@jwt_required()
def delete_task():
    try:
        data = request.get_json()
        task_title = data.get("title")

        current_user = get_jwt_identity()  # this will return the username from the JWT

        if not task_title:
            return jsonify({"error": "Task is required"}), 400
        
        #check if task exists
        user = db["users"].find_one({"username": current_user, "tasks.title": task_title})
        if not user:
            return jsonify({"error": "Task not found"}), 404

        db["users"].update_one({"username": current_user}, {"$pull": {"tasks": {"title": task_title}}})

        return jsonify({"message": "Task deleted successfully"}), 200

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

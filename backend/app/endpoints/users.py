from flask import jsonify, request
from app import mongo_db as db
from app.blueprints.default import default_bp
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

@default_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()  # Get JSON data from the request

        username = data.get("username")
        password = data.get("password")
        print("1")

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        user = {"username": username, "password": hashed_password.decode('utf-8')}
        db.users.insert_one(user)

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
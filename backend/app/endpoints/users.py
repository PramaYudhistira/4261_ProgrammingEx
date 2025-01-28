from flask import jsonify
from app import mongo_db
from app.blueprints.default import default_bp


@default_bp.route("/user_test", methods=["GET"])
def get_user_test():
    test_user = {"username": "testUsername"}
    print("going to mongo")
    print(mongo_db)
    user = mongo_db["users"].find_one(test_user)
    print('found')

    if user:
        user["_id"] = str(user["_id"])
        return jsonify(user), 200

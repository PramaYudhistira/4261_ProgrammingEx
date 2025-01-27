from flask import request, jsonify, current_app
from app.blueprints.default import default_bp


@default_bp.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "hello"}), 200

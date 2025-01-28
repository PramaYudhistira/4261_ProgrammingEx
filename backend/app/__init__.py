from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from pymongo import MongoClient
from app.config import DevConfig


import os


jwt = JWTManager()
mongo_client = None
mongo_db = None


def create_app(config=DevConfig):
    app = Flask(__name__)
    CORS(app)


    #JWT SECRET KEY:
    app.config["SECRET_KEY_JWT"] = config.SECRET_KEY_JWT

    #INITIALIZE JWT MANAGER
    jwt.init_app(app)


    #MONGO CONFIG
    mongo_uri = config.MONGO_URI
    global mongo_client, mongo_db
    mongo_client = MongoClient(mongo_uri)
    mongo_db = mongo_client.get_database("4261")
    

    #REGISTER BLUEPRINTS
    from app.blueprints.auth import auth_bp
    from app.blueprints.default import default_bp
    print("registering blueprints")
    app.register_blueprint(auth_bp)
    app.register_blueprint(default_bp)

    return app

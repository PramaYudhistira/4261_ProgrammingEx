from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.blueprints.auth import auth_bp
from app.blueprints.default import default_bp
import os


jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    CORS(app)


    #JWT SECRET KEY:
    app.config["SECRET_KEY_JWT"] = os.environ.get("SECRET_KEY_JWT")

    #INITIALIZE JWT MANAGER
    jwt.init_app(app)


    #DB CONFIG HERE


    #REGISTER BLUEPRINTS
    print("registering blueprints")
    app.register_blueprint(auth_bp)
    app.register_blueprint(default_bp)

    return app

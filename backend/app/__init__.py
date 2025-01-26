from flask import Flask
from flask_jwt_extended import JWTManager
from app.blueprints.auth import auth_bp
import os


jwt = JWTManager()


def create_app():
    app = Flask(__name__)


    #JWT SECRET KEY:
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY_JWT")
    app.config["test"] = "testing"


    #INITIALIZE JWT MANAGER
    jwt.init_app(app)


    #DB CONFIG HERE


    #REGISTER BLUEPRINTS
    app.register_blueprint(auth_bp)



    print("setup done")
    return app

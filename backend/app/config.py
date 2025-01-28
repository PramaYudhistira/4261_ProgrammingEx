import os


class DevConfig:
    DEBUG = True
    MONGO_URI = os.environ.get("MONGO_CONNECTION_STRING")
    SECRET_KEY_JWT = os.environ.get("SECRET_KEY_JWT")
    HOST = os.environ.get("HOST", "127.0.0.1")

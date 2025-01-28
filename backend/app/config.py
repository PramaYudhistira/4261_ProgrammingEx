import os


class DevConfig:
    DEBUG = True
    MONGO_URI = os.environ.get("MONGO_CONNECTION_STRING")
    SECRET_KEY_JWT = os.environ.get("SECRET_KEY_JWT")

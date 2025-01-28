from flask import Blueprint


default_bp = Blueprint('default', __name__)


from app.endpoints.test import *
from app.endpoints.users import *

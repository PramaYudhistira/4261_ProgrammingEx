from app import create_app
from app.config import DevConfig


app = create_app()


if __name__ == "__main__":
    print(f"RUNNING ON https://{DevConfig.HOST}:5000")
    app.run(debug=True, host=DevConfig.HOST)
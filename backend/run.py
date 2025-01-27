from app import create_app
from app.blueprints.auth import auth_bp


app = create_app()

if __name__ == "__main__":
    print(f"blueprint found: {auth_bp.name}")
    app.run(debug=True)
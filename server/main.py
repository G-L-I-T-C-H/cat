from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime

app = Flask(__name__)

# CORS setup - Allowing all origins (no credentials)
CORS(app, 
     resources={r"/api/*": {"origins": "*"}},
     supports_credentials=False,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

USERS = {
    "driver21": "password123",
    "driver22": "securepass456",
    "admin": "adminpass789"
}

latest_alert_text = {"message": ""}

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        # Preflight CORS response
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response, 200

    try:
        data = request.get_json()
        print("Received login data:", data)

        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        if username in USERS and USERS[username] == password:
            response = jsonify({
                "message": "Login successful!",
                "user": username
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200
        else:
            response = jsonify({"error": "Invalid username or password"})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 401

    except Exception as e:
        response = jsonify({"error": str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500
    


@app.route('/api/alert', methods=['POST'])
def receive_alert():
    try:
        data = request.get_json()
        print("Received alert:", data)
        message = data.get("text", "")
        if message:
            latest_alert_text["message"] = message
            return jsonify({"status": "Alert received", "message": message}), 200
        else:
            return jsonify({"error": "No alert text received"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/alert', methods=['GET'])
def get_latest_alert():
    return jsonify(latest_alert_text), 200


# (Keep the rest of your /api endpoints the same...)

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)

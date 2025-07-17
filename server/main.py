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

ess_data = {
    "engine_on": None,
    "seatbelt_status": None,
    "safety_alert_triggered": None
}

@app.route('/api/ess', methods=['POST'])
def receive_ess_data():
    global ess_data
    try:
        data = request.get_json()

        if not all(key in data for key in ["engine_on", "seatbelt_status", "safety_alert_triggered"]):
            return jsonify({"error": "Missing required keys"}), 400

        ess_data = {
            "engine_on": data["engine_on"],
            "seatbelt_status": data["seatbelt_status"],
            "safety_alert_triggered": data["safety_alert_triggered"]
        }

        print("Received ESS data:", ess_data)
        return jsonify({"message": "ESS data received successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET endpoint to serve data to frontend
@app.route('/api/ess', methods=['GET'])
def get_ess_data():
    print("Serving ESS data:", ess_data)
    return jsonify(ess_data), 200

latest_monitor_data = {
    'Hydraulic_Pressure': None,
    'Exhaust_Temperature': None,
    'Fuel_Pressure': None,
    'Transmission_Oil_Temp': None
}

@app.route('/api/moni', methods=['POST'])
def receive_monitor_data():
    global latest_monitor_data

    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No data received"}), 400

        print("✅ Full incoming data:", data, flush=True)

        # Extract only the required fields
        required_keys = latest_monitor_data.keys()
        for key in required_keys:
            if key in data:
                latest_monitor_data[key] = data[key]
                print(f"Updated {key}: {latest_monitor_data[key]}", flush=True)

        return jsonify({"message": "Monitor data received and stored successfully."}), 200

    except Exception as e:
        print("❌ Error while parsing incoming data:", e, flush=True)
        return jsonify({"error": "Invalid data format"}), 400

@app.route('/api/moni', methods=['GET'])
def get_selected_monitor_data():
    print("📤 Sending selected monitor data:", latest_monitor_data, flush=True)
    return jsonify(latest_monitor_data), 200

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)

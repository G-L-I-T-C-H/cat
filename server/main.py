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
    "admin": "adminpass789",
    "21": "123"
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


latest_anomaly = {
    "anomaly": None,
    "likelihood_percent": 0,
}

@app.route('/api/anomaly', methods=['POST'])
def receive_anomaly():
    global latest_anomaly  # ⬅️ Use global to update shared variable

    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No data received"}), 400

        print("✅ Incoming anomaly data:", data, flush=True)

        required_keys = {"anomaly", "likelihood_percent"}
        if not required_keys.issubset(data.keys()):
            missing = required_keys - data.keys()
            print("❌ Missing keys:", missing, flush=True)
            return jsonify({"error": f"Missing keys in data: {', '.join(missing)}"}), 400

        # Update only relevant fields
        latest_anomaly["anomaly"] = data["anomaly"]
        latest_anomaly["likelihood_percent"] = data["likelihood_percent"]

        print("✅ Updated latest anomaly:", latest_anomaly, flush=True)
        return jsonify({"message": "Anomaly data received successfully"}), 200

    except Exception as e:
        print("❌ Error while parsing anomaly data:", e, flush=True)
        return jsonify({"error": "Invalid data format"}), 400

@app.route('/api/anomaly', methods=['GET'])  # fixed route spelling
def send_anomaly():
    print("📤 Sending latest anomaly data:", latest_anomaly, flush=True)
    return jsonify(latest_anomaly), 200



latest_proxy_data = {
    'proximity_distance_m': 0.0,
    'direction': 'unknown',
    'danger_level': 'low',
    'proximity_alert_triggered': False,
    'message': ''
}

@app.route('/api/proxy', methods=['POST'])
def receive_proxy_data():
    global latest_proxy_data

    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No data received"}), 400

        print("✅ Incoming proxy data:", data, flush=True)

        # Required keys to validate
        required_keys = latest_proxy_data.keys()
        for key in required_keys:
            if key in data:
                latest_proxy_data[key] = data[key]
                print(f"🔁 Updated {key}: {latest_proxy_data[key]}", flush=True)
            else:
                print(f"⚠️ Missing key: {key} in incoming data", flush=True)

        return jsonify({"message": "Proxy data received and stored successfully."}), 200

    except Exception as e:
        print("❌ Error while parsing proxy data:", e, flush=True)
        return jsonify({"error": "Invalid data format"}), 400


@app.route('/api/proxy', methods=['GET'])
def send_proxy_data():
    print("📤 Sending latest proxy data:", latest_proxy_data, flush=True)
    return jsonify(latest_proxy_data), 200


latest_task_prediction = {
    "projected_minutes": None,
    "predicted_task_complexity": None,
    "temperature": None,
    "weather": None,
    "forecast_weather": None,
    "forecast_temperature": None
}

@app.route('/api/task/', methods=['POST'])
def receive_task_data():
    global latest_task_prediction
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No data received"}), 400

        print("📥 Task Data Received:", data, flush=True)

        key_map = {
            "Predicted Minutes": "projected_minutes",
            "Predicted Task Complexity": "predicted_task_complexity",
            "Temperature (°C)": "temperature",
            "Weather": "weather",
            "Weather (3hr Forecast)": "forecast_weather",
            "Temperature (°C, 3hr Forecast)": "forecast_temperature"
        }

        for incoming_key, internal_key in key_map.items():
            if incoming_key in data:
                latest_task_prediction[internal_key] = data[incoming_key]
                print(f"✅ Updated {internal_key}: {latest_task_prediction[internal_key]}", flush=True)

        return jsonify({"message": "Task data received successfully"}), 200

    except Exception as e:
        print("❌ Error in /api/task/:", e, flush=True)
        return jsonify({"error": "Invalid format"}), 400

@app.route('/api/task/', methods=['GET'])
def send_task_data():
    print("📤 Sending Task Data:", latest_task_prediction, flush=True)
    return jsonify(latest_task_prediction), 200












if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)

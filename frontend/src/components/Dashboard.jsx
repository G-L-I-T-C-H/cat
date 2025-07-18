import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Activity, Clock, Shield, GraduationCap, Calendar,
  ChevronRight, AlertTriangle, Thermometer,
  Scale, Zap, User, Radar
} from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Dashboard = ({ driverId, onNavigateToTasks, onNavigateToSafety, onNavigateToTraining }) => {


  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
const [aiQuery, setAiQuery] = useState("");

const handleVoiceInput = () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    setAiQuery(transcript);
  };

  recognition.onerror = function(event) {
    console.error("Speech recognition error", event);
  };

  recognition.start();
};

  const [remainingMinutes, setRemainingMinutes] = useState(null);


  const [fatigueAlert, setFatigueAlert] = useState('');
  const [machineParams, setMachineParams] = useState({
    Fuel_Pressure: null,
    Hydraulic_Pressure: null,
    Transmission_Oil_Temp: null,
    Exhaust_Temperature: null
  });

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const fetchFatigueAlert = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/alert');
      if (response.data && response.data.message) {
        setFatigueAlert(response.data.message);
      } else {
        setFatigueAlert('');
      }
    } catch (error) {
      console.error('Error fetching fatigue alert:', error);
    }
  };

  const fetchMachineParams = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/moni');
    const { Fuel_Pressure, Hydraulic_Pressure, Transmission_Oil_Temp, Exhaust_Temperature } = res.data;

    if (
      Fuel_Pressure !== undefined &&
      Hydraulic_Pressure !== undefined &&
      Transmission_Oil_Temp !== undefined &&
      Exhaust_Temperature !== undefined
    ) {
      setMachineParams({
        Fuel_Pressure,
        Hydraulic_Pressure,
        Transmission_Oil_Temp,
        Exhaust_Temperature,
      });
    }
  } catch (error) {
    console.error('Error fetching machine parameters:', error);
  }
};


  useEffect(() => {
    fetchFatigueAlert();
    fetchMachineParams();
    const alertInterval = setInterval(fetchFatigueAlert, 3000);
    const monitorInterval = setInterval(fetchMachineParams, 5000);
    return () => {
      clearInterval(alertInterval);
      clearInterval(monitorInterval);
    };
  }, []);

  const getFatigueLevelDisplay = () => {
    return (
      <span className={`${fatigueAlert ? 'text-orange-400' : 'text-green-400'} font-medium`}>
        {fatigueAlert || '15% - Normal'}
      </span>
    );
  };

  const {
  Fuel_Pressure,
  Hydraulic_Pressure,
  Transmission_Oil_Temp,
  Exhaust_Temperature,
} = machineParams;

const [anomaly, setAnomaly] = useState({
    type: null,
    likelihood: null,
  });

const fetchAnomalyData = async () => {
  try {
   const res = await axios.get("http://localhost:5000/api/anomaly");
    const data = res.data;
    if (data && data.anomaly && data.likelihood_percent !== null) {
      setAnomaly({
        type: data.anomaly,
        likelihood: data.likelihood_percent,
      });
    }
  } catch (error) {
    console.error("Error fetching anomaly data:", error);
  }
};

useEffect(() => {
  fetchAnomalyData(); // Initial fetch

  const interval = setInterval(() => {
    fetchAnomalyData(); // Fetch every 10 seconds
  }, 1000);

  return () => clearInterval(interval); // Cleanup on unmount
}, []);


const [proximityData, setProximityData] = useState({
    message: '',
    proximity_distance_m: 0.0,
    direction: '',
    danger_level: '',
    proximity_alert_triggered: false
  });

  useEffect(() => {
    const fetchProximityData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/proxy');
        const data = await response.json();
        console.log("📥 Proximity Data Received:", data);
        setProximityData(data);
      } catch (error) {
        console.error("❌ Failed to fetch proximity data:", error);
      }
    };

    const interval = setInterval(fetchProximityData, 2000); // update every 2s
    return () => clearInterval(interval);
  }, []);

  const [taskData, setTaskData] = useState({
    projected_minutes: '',
    predicted_task_complexity: '',
    temperature: '',
    weather: '',
    forecast_weather: '',
    forecast_temperature: ''
  });

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/task/');
        const data = await response.json();
        console.log("📥 Received Task Data:", data);
        setTaskData(data);
        setRemainingMinutes(parseInt(data.projected_minutes)); // Initialize countdown

      } catch (error) {
        console.error("❌ Error fetching task data:", error);
      }
    };

    fetchTaskData(); // fetch on first mount
    const interval = setInterval(fetchTaskData, 3000); // fetch every 3s

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  useEffect(() => {
  if (remainingMinutes === null) return;
  if (remainingMinutes <= 0) return;

  const interval = setInterval(() => {
    setRemainingMinutes(prev => {
      if (prev > 0) {
        return prev - 1;
      } else {
        clearInterval(interval);
        return 0;
      }
    });
  }, 60000); // 60,000 ms = 1 minute

  return () => clearInterval(interval);
}, [remainingMinutes]);

console.log("⏳ Remaining Minutes:", remainingMinutes);
console.log("🗓️ Projected Minutes from Task Data:", taskData.projected_minutes);
  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#54535340' }}>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Welcome Header */}
        <div className=" flex justify-between items-center">
          <div  style={{ backgroundColor: '#FFB500' }} className="rounded-lg p-6">
            <h2 className="text-4xl font-bold text-gray-800">Welcome back, Operator {driverId}</h2>
            <p className="text-gray-700 mt-1">Ready to start your shift? Here's your overview for today.</p>
          </div>
          <div className="text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{driverId}</span>
            <span className="ml-4">{currentTime}</span>
          </div>

         <button
              onClick={() => setIsAIModalOpen(true)}
            className="bg-green-600 text-green-100 px-3 py-1 rounded-full text-xs font-medium"
          >
           AI
          </button>


        </div>

        {isAIModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-md">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Ask AI Insights</h2>
      <textarea
        rows={4}
        value={aiQuery}
        onChange={(e) => setAiQuery(e.target.value)}
        placeholder="Type your question here..."
        className="w-full border border-gray-300 p-2 rounded resize-none"
      />
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handleVoiceInput}
          className="flex items-center gap-2 text-white font-medium"
        >
          🎤 Mic
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // You can later call your AI API here with aiQuery
              console.log("User asked:", aiQuery);
              setIsAIModalOpen(false);
              setAiQuery("");
            }}
            className="bg-green-600 text-white px-4 py-1 rounded"
          >
            Ask
          </button>
          <button
            onClick={() => setIsAIModalOpen(false)}
            className="bg-gray-300 px-4 py-1 rounded text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

        

        {/* Machine Operating Status */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-semibold text-white">Machine Operating Status</h2>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <p className="text-gray-300 mb-4">Real-time monitoring of critical machine parameters</p>

          <div className="bg-yellow-800 text-yellow-100 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 w-fit">
            <AlertTriangle className="w-5 h-5" />
            <span>1 parameter(s) require attention</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hydraulic Pressure */}
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-gray-300" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {machineParams.Hydraulic_Pressure !== null ? `${machineParams.Hydraulic_Pressure} PSI` : 'Loading...'}
              </div>
              <div className="text-gray-300 text-sm mb-3">Hydraulic Pressure</div>
              <span className="bg-yellow-600 text-yellow-100 px-3 py-1 rounded-full text-xs font-medium">
                WARNING
              </span>
            </div>

            {/* Trans Oil Temp */}
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Thermometer className="w-6 h-6 text-gray-300" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {machineParams.Transmission_Oil_Temp !== null ? `${machineParams.Transmission_Oil_Temp}°F` : 'Loading...'}
              </div>
              <div className="text-gray-300 text-sm mb-3">Trans oil Temp</div>
              <span className="bg-green-600 text-green-100 px-3 py-1 rounded-full text-xs font-medium">
                NORMAL
              </span>
            </div>

            {/* Fuel Pressure */}
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Scale className="w-6 h-6 text-gray-300" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {machineParams.Fuel_Pressure !== null ? `${machineParams.Fuel_Pressure} PSI` : 'Loading...'}
              </div>
              <div className="text-gray-300 text-sm mb-3">Fuel Pressure</div>
              <span className="bg-green-600 text-green-100 px-3 py-1 rounded-full text-xs font-medium">
                NORMAL
              </span>
            </div>

            {/* Exhaust Temperature */}
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-gray-300" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {machineParams.Exhaust_Temperature !== null ? `${machineParams.Exhaust_Temperature}°F` : 'Loading...'}
              </div>
              <div className="text-gray-300 text-sm mb-3">Exhaust Temperature</div>
              <span className="bg-green-600 text-green-100 px-3 py-1 rounded-full text-xs font-medium">
                NORMAL
              </span>
            </div>
          </div>
        </div>

        {/* Row: Task Overview & Safety Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Task Overview */}
          <div className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-600 transition-colors" onClick={onNavigateToTasks}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">
  {Number.isFinite(remainingMinutes) ? remainingMinutes : taskData.projected_minutes}
</h2>
</div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-400 mb-2">{taskData.predicted_task_complexity}</div>
              <div className="text-gray-300">Predicted Task Complexity</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">{taskData.temperature}</div>
                <div className="text-gray-300 text-sm">Temperature</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">{taskData.weather}</div>
                <div className="text-gray-300 text-sm">Weather</div>
              </div>
            </div>

            <div className="bg-gray-600 rounded-lg p-4">
              <div className="text-blue-400 font-medium mb-1">forecast_weather: {taskData.forecast_weather}</div>
              <div className="text-white">forecast_temperature : {taskData.forecast_temperature}</div>
            </div>
          </div>

          {/* Safety Overview */}
          <div className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-600 transition-colors" onClick={onNavigateToSafety}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-semibold text-white">Safety Overview</h2>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="text-center mb-6">
              <div className={`px-4 py-2 rounded-full font-medium inline-block ${
                fatigueAlert ? 'bg-orange-600 text-orange-100' : 'bg-green-600 text-green-100'
              }`}>
                {fatigueAlert ? 'FATIGUE DETECTED' : 'ALL SYSTEMS OK'}
              </div>
            </div>

            <div className="space-y-4 items-center">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Seatbelt Status</span>
                <span className="text-green-400 font-medium">FASTENED</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Fatigue Level</span>
                {getFatigueLevelDisplay()}
              </div>
              <div className="text-center text-gray-400 text-sm mt-4">
                Last check: {currentTime}
              </div>

                <div className="bg-red-700 text-white rounded-xl p-4 w-fit shadow-lg mt-4">
  <div className="text-sm uppercase font-semibold tracking-wide mb-1">Anomaly Type</div>
  <div className="text-lg font-bold mb-2">
    {anomaly.type ? anomaly.type : "No anomaly"}
  </div>
  <div className="text-sm uppercase font-semibold tracking-wide mb-1">Likelihood</div>
  <div className="text-xl font-bold">
    {anomaly.likelihood !== null ? `${anomaly.likelihood}%` : "N/A"}
  </div>
</div>


             
            </div>
          </div>
        </div>

        {/* Row: Training Hub & Instructor Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Training Hub */}
          <div className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-600 transition-colors" onClick={onNavigateToTraining}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Training Hub</h2>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">12</div>
              <div className="text-gray-300">Available Courses</div>
            </div>

            <div className="bg-gray-600 rounded-lg p-4 mb-4">
              <div className="text-purple-400 font-medium mb-1">Latest:</div>
              <div className="text-white">Heavy Equipment Safety Protocol</div>
            </div>

            <div className="text-center text-gray-400 text-sm">
              Continue your learning journey
            </div>
          </div>

          {/* Instructor Booking */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Radar className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white"> Proximity Analysis</h2>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Proximity Distance</span>
                <span className="text-green-400 font-medium">{proximityData.proximity_distance_m}</span>
              </div>
                <br />
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Direction</span>
                <span className="text-green-400 font-medium">{proximityData.direction}</span>
              </div>
                <br />
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Danger Level</span>
                <span className="text-green-400 font-medium">{proximityData.danger_level}</span>
              </div>
                  <br />
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Proximity Level</span>
                <span className="text-green-400 font-medium">{proximityData.proximity_alert_triggered ? 'Yes' : 'No'}</span>
              </div>

              <div className='bg-red-700 text-white rounded-xl p-4 w-fit shadow-lg ml-24 mt-7'>
                <div className="text-sm uppercase font-semibold tracking-wide mb-1">{proximityData.message || 'No current alert'}t</div>
              </div>
              
            </div>


          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;




// if (remainingMinutes === null)
//   setRemainingMinutes(parseInt(data.projected_minutes));

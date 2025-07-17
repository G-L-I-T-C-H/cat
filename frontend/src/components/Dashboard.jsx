import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Activity, Clock, Shield, GraduationCap, Calendar,
  ChevronRight, AlertTriangle, Thermometer,
  Scale, Zap, User
} from 'lucide-react';

const Dashboard = ({ onNavigateToTasks, onNavigateToSafety, onNavigateToTraining }) => {
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

  return (
    <div className="min-h-screen bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Welcome Header */}
        <div className="bg-orange-400 rounded-lg p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, Driver 21!</h1>
            <p className="text-gray-700 mt-1">Ready to start your shift? Here's your overview for today.</p>
          </div>
          <div className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Driver 21</span>
            <span className="ml-4">{currentTime}</span>
          </div>
        </div>

        {/* Machine Operating Status */}
        <div className="bg-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-semibold text-white">Machine Operating Status</h2>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <p className="text-gray-300 mb-4">Real-time monitoring of critical machine parameters</p>

          <div className="bg-yellow-600 text-yellow-100 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>1 parameter(s) require attention</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hydraulic Pressure */}
            <div className="bg-gray-600 rounded-lg p-4 text-center">
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
            <div className="bg-gray-600 rounded-lg p-4 text-center">
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
            <div className="bg-gray-600 rounded-lg p-4 text-center">
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
            <div className="bg-gray-600 rounded-lg p-4 text-center">
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
          <div className="bg-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-600 transition-colors" onClick={onNavigateToTasks}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Task Overview</h2>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-400 mb-2">5</div>
              <div className="text-gray-300">Total Tasks Today</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">2</div>
                <div className="text-gray-300 text-sm">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">3</div>
                <div className="text-gray-300 text-sm">Pending</div>
              </div>
            </div>

            <div className="bg-gray-600 rounded-lg p-4">
              <div className="text-blue-400 font-medium mb-1">Next Task:</div>
              <div className="text-white">Load materials at 2:30 PM</div>
            </div>
          </div>

          {/* Safety Overview */}
          <div className="bg-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-600 transition-colors" onClick={onNavigateToSafety}>
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

            <div className="space-y-4">
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
            </div>
          </div>
        </div>

        {/* Row: Training Hub & Instructor Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Training Hub */}
          <div className="bg-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-600 transition-colors" onClick={onNavigateToTraining}>
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
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-semibold text-white">Instructor Booking</h2>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="text-center mb-6">
              <div className="text-gray-300 mb-4">Need personalized training?</div>
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-5 h-5" />
              Request Session
            </button>

            <div className="text-center text-orange-400 text-sm">
              Book one-on-one sessions with certified instructors
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

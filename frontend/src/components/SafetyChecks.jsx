import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  Mic, 
  MicOff,
  RotateCcw
} from 'lucide-react';

const SafetyChecks = ({ onBack }) => {
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(false);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const fetchAlert = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/alert');
      setAlertMessage(res.data.message || '');
    } catch (error) {
      console.error('Failed to fetch alert:', error);
    }
  };

  useEffect(() => {
    fetchAlert();
    const interval = setInterval(fetchAlert, 3000); // poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRunCheck = () => {
    setIsRunningCheck(true);
    setTimeout(() => {
      setIsRunningCheck(false);
    }, 2000);
  };

  const toggleVoiceAlerts = () => {
    setVoiceAlertsEnabled(!voiceAlertsEnabled);
  };

  return (
    <div className="min-h-screen bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-3xl font-bold text-white">Safety Checks</h1>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleVoiceAlerts}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors"
            >
              {voiceAlertsEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span>Voice Alerts {voiceAlertsEnabled ? 'On' : 'Off'}</span>
            </button>
            
            <button 
              onClick={handleRunCheck}
              disabled={isRunningCheck}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 px-6 py-2 rounded-lg text-white font-semibold transition-colors"
            >
              {isRunningCheck ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Run Check
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fatigue Detection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Seatbelt Check */}
          <div className="bg-gray-700 rounded-lg p-6 border-2 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-white" />
                <h3 className="text-xl font-semibold text-white">Seatbelt Check</h3>
              </div>
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">OK</span>
            </div>
            <p className="text-gray-300">Seatbelt properly fastened</p>
          </div>

          {/* Fatigue Detection */}
          <div className="bg-gray-700 rounded-lg p-6 border-2 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-white" />
                <h3 className="text-xl font-semibold text-white">Fatigue Detection</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${alertMessage ? 'bg-red-500' : 'bg-green-500'}`}>
                {alertMessage ? 'ALERT' : 'OK'}
              </span>
            </div>
            <p className="text-gray-300">
              {alertMessage ? alertMessage : 'No signs of fatigue detected'}
            </p>
          </div>

          {/* Visibility Check */}
          <div className="bg-gray-700 rounded-lg p-6 border-2 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-white" />
                <h3 className="text-xl font-semibold text-white">Visibility Check</h3>
              </div>
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">OK</span>
            </div>
            <p className="text-gray-300">All mirrors and windows clear</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyChecks;

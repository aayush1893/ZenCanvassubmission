import React, { useState, useEffect, useRef } from "react";
import { Home, Timer, Settings } from "lucide-react";

type BreathPhase = "inhale" | "hold-in" | "exhale" | "hold-out";

interface OceanMindfulnessProps {
  playerId: string;
  onBackToApp: () => void;
}

interface WaveShapeProps {
  phase: BreathPhase;
  isPaused: boolean;
}

const OceanMindfulness: React.FC<OceanMindfulnessProps> = ({ onBackToApp }) => {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("inhale");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    breathDuration: 16000, // Total cycle duration
    soundEnabled: false,
  });
  const [timeRemaining, setTimeRemaining] = useState(settings.breathDuration);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isPlaying) {
      let timer: NodeJS.Timeout;

      const nextPhase = () => {
        setBreathPhase((prev) => {
          switch (prev) {
            case "inhale":
              return "hold-in";
            case "hold-in":
              return "exhale";
            case "exhale":
              return "hold-out";
            case "hold-out":
              return "inhale";
            default:
              return "inhale";
          }
        });
      };

      timer = setInterval(nextPhase, settings.breathDuration / 4);
      return () => clearInterval(timer);
    }
  }, [isPlaying, settings.breathDuration]);

  const getBreathingText = (phase: BreathPhase) => {
    switch (phase) {
      case "inhale":
        return "↑ Breathe In ↑";
      case "hold-in":
        return "• Hold In •";
      case "exhale":
        return "↓ Breathe Out ↓";
      case "hold-out":
        return "• Hold Out •";
      default:
        return "Paused";
    }
  };

  const startSession = () => {
    setIsPlaying(true);
    setBreathPhase("inhale");
  };

  const pauseSession = () => {
    setIsPlaying(false);
  };

  const settingsPanel = showSettings && (
    <div className="p-4 bg-gray-800">
      <h3 className="font-semibold text-white mb-3">Settings</h3>
      <div>
        <label className="block text-sm text-white mb-1">Breathing Pace</label>
        <select
          value={settings.breathDuration}
          onChange={(e) =>
            setSettings({ ...settings, breathDuration: Number(e.target.value) })
          }
          className="w-full p-2 bg-gray-700 text-white border border-gray-600"
        >
          <option value={12000}>Fast (12s)</option>
          <option value={16000}>Normal (16s)</option>
          <option value={20000}>Slow (20s)</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-blue-50 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white flex justify-between items-center">
        <button onClick={onBackToApp} className="p-2 rounded-full hover:bg-blue-100">
          <Home className="h-6 w-6 text-blue-600" />
        </button>
        <div className="flex items-center space-x-4">
          <Timer className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-semibold text-blue-800">
            {settings.breathDuration / 1000}s cycle
          </span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-blue-100"
        >
          <Settings className="h-6 w-6 text-blue-600" />
        </button>
      </div>
      {settingsPanel}

      {/* Main Content */}
      <div className="relative h-64 bg-gradient-to-b from-blue-300 to-blue-400 flex items-center justify-center">
        <div className="text-3xl font-bold text-blue-900">
          {getBreathingText(breathPhase)}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-white">
        <button
          onClick={isPlaying ? pauseSession : startSession}
          className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {isPlaying ? "Pause" : "Start"} Breathing Exercise
        </button>
      </div>
    </div>
  );
};

export default OceanMindfulness;

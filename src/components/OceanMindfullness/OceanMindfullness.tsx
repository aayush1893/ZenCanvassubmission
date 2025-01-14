import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Home, Timer, Award, Settings, Volume2, VolumeX } from 'lucide-react';

// Define breath phases
type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

interface OceanMindfulnessProps {
  playerId: string;
  onBackToApp: () => void;
}

interface WaveShapeProps {
  phase: BreathPhase;
  isPaused: boolean;
}

const selectClass = "w-full p-2 rounded bg-gray-700 text-white border border-gray-600";
const optionClass = "bg-gray-700 text-white hover:bg-gray-600";

// WaveShape Component
const WaveShape: React.FC<WaveShapeProps> = ({ phase, isPaused }) => {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full">
        {/* SVG content */}
      </svg>
    </div>
  );
};

const OceanMindfulness: React.FC<OceanMindfulnessProps> = ({ onBackToApp, playerId }) => {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    breathDuration: 16000, // Total breath cycle duration
    sessionDuration: 2, // Session duration in minutes
    soundEnabled: false,
  });
  const [timeRemaining, setTimeRemaining] = useState(settings.sessionDuration * 60);
  const [sessionStats, setSessionStats] = useState({
    completedCycles: 0,
    totalSessions: 0,
    longestStreak: 0,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSoundRef = useRef<{ oscillator: OscillatorNode; gainNode: GainNode } | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => Math.max(prev - 1, 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (timeRemaining === 0) {
      setIsPlaying(false);
      alert('Session Complete!');
    }
  }, [timeRemaining]);

  const playBreathSound = (phase: BreathPhase) => {
    if (!settings.soundEnabled || !audioContextRef.current || phase.includes('hold')) return;

    if (currentSoundRef.current) {
      currentSoundRef.current.oscillator.stop();
      currentSoundRef.current.gainNode.disconnect();
    }

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = phase === 'inhale' ? 174.61 : 146.83;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 3);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 3);

    currentSoundRef.current = { oscillator, gainNode };
  };

  const getBreathingText = (phase: BreathPhase) => {
    switch (phase) {
      case 'inhale':
        return '↑ Breathe In ↑';
      case 'hold-in':
        return '• Hold •';
      case 'exhale':
        return '↓ Breathe Out ↓';
      case 'hold-out':
        return '• Hold •';
      default:
        return 'Paused';
    }
  };

  const startSession = () => {
    setIsPlaying(true);
    setTimeRemaining(settings.sessionDuration * 60);
    playBreathSound('inhale');
  };

  const pauseSession = () => {
    setIsPlaying(false);
    if (currentSoundRef.current) {
      currentSoundRef.current.oscillator.stop();
      currentSoundRef.current.gainNode.disconnect();
      currentSoundRef.current = null;
    }
  };

  const settingsPanel = showSettings && (
    <div className="p-4 bg-gray-800">
      <h3 className="font-semibold text-white mb-3">Settings</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-white mb-1">Breathing Pace</label>
          <select
            value={settings.breathDuration}
            onChange={e =>
              setSettings(prev => ({ ...prev, breathDuration: Number(e.target.value) }))
            }
            className={selectClass}
          >
            <option value={12000} className={optionClass}>
              Fast (12s)
            </option>
            <option value={16000} className={optionClass}>
              Normal (16s)
            </option>
            <option value={20000} className={optionClass}>
              Slow (20s)
            </option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-white mb-1">Session Duration</label>
          <select
            value={settings.sessionDuration}
            onChange={e =>
              setSettings(prev => ({ ...prev, sessionDuration: Number(e.target.value) }))
            }
            className={selectClass}
          >
            <option value={2} className={optionClass}>
              2 minutes
            </option>
            <option value={5} className={optionClass}>
              5 minutes
            </option>
            <option value={10} className={optionClass}>
              10 minutes
            </option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-blue-50 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-white flex justify-between items-center">
        <button onClick={onBackToApp} className="p-2 rounded-full hover:bg-blue-100">
          <Home className="h-6 w-6 text-blue-600" />
        </button>
        <div className="flex items-center space-x-4">
          <Timer className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-semibold text-blue-800">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full hover:bg-blue-100">
          <Settings className="h-6 w-6 text-blue-600" />
        </button>
      </div>
      {settingsPanel}
      <div className="relative h-64 bg-gradient-to-b from-blue-300 to-blue-400">
        <WaveShape phase={breathPhase} isPaused={!isPlaying} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 px-6 py-3 rounded-full text-2xl font-bold text-blue-800">
            {getBreathingText(breathPhase)}
          </div>
        </div>
      </div>
      <div className="p-6 bg-white">
        <button
          onClick={isPlaying ? pauseSession : startSession}
          className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {isPlaying ? 'Pause' : 'Start'} Breathing Exercise
        </button>
      </div>
    </div>
  );
};

export default OceanMindfulness;

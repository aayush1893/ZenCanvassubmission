// App.tsx
import React, { useState, useEffect, useRef } from "react";
import ZenPattern from "./components/ZenPattern/ZenPattern";
import GroundingGame from "./components/GroundingGame/GroundingGame";
import BreathingGame from "./components/OceanMindfullness/OceanMindfullness";
import Gallery from "./components/Gallery/Gallery";
import "./App.css";
import mainLogo from "./components/logo.png";
import backgroundMusic from "./assets/TOU.mp3";

type GameType = "zen" | "grounding" | "ocean" | "gallery" | "menu";

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GameType>("menu");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle background music
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    if (isMusicPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay issue:", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isMusicPlaying]);

  // Prompt for user ID or name on app load
  useEffect(() => {
    const storedId = localStorage.getItem("playerId");
    if (!storedId) {
      promptForPlayerId();
    } else {
      setPlayerId(storedId);
    }
  }, []);

  // Prompt for user ID
  const promptForPlayerId = () => {
    const newId = prompt("Please enter your name or user ID:", "Guest") || `guest-${Date.now()}`;
    setPlayerId(newId);
    localStorage.setItem("playerId", newId);
  };

  const handleLogout = () => {
    localStorage.removeItem("playerId");
    setPlayerId(null);
    promptForPlayerId(); // Prompt the user again after logout
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(135deg,#ae9ead,#ae9ead,rgba(64,72,106,255))",
        color: "#fff",
      }}
    >
      {/* Background Music */}
      <audio ref={audioRef} src={backgroundMusic} />

      {currentGame === "menu" ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <img
            src={mainLogo}
            alt="ZenCanvas Logo"
            style={{
              width: "250px",
              height: "auto",
              filter: "drop-shadow(0 0 5px rgba(241, 226, 226, 0.3)) blur(0.5px)",
              borderRadius: "70%",
            }}
          />

          <h2 className="text-xl mt-4">Welcome, {playerId}</h2>
          <button
            onClick={handleLogout}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>

          {/* Toggle Background Music */}
          <button
            onClick={() => setIsMusicPlaying((prev) => !prev)}
            className={`mt-4 px-4 py-2 rounded-lg ${
              isMusicPlaying ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-500 hover:bg-gray-600"
            }`}
          >
            {isMusicPlaying ? "Mute Music" : "Unmute Music"}
          </button>

          <div className="flex gap-8 flex-wrap justify-center mt-6">
            <button
              onClick={() => setCurrentGame("zen")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              ZenPattern
            </button>
            <button
              onClick={() => setCurrentGame("grounding")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Grounding Game
            </button>
            <button
              onClick={() => setCurrentGame("ocean")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ocean Breathing
            </button>
            <button
              onClick={() => setCurrentGame("gallery")}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Gallery
            </button>
          </div>
        </div>
      ) : (
        <>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              padding: "10px 20px",
              background: "#203a43",
            }}
          >
            <img
              src={mainLogo}
              alt="MindQuest Logo"
              style={{
                height: "50px",
              }}
            />
            <button
              onClick={() => setCurrentGame("menu")}
              style={{
                background: "#2c5364",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Back to Menu
            </button>
          </header>

          {currentGame === "zen" && (
            <ZenPattern
              playerId={playerId || "Guest"}
              onBack={() => setCurrentGame("menu")}
              onSaveToGallery={(mandalaData) => {
                const savedFiles = JSON.parse(localStorage.getItem("gallery") || "[]");
                const newFile = {
                  id: Date.now().toString(), // Unique ID for each saved file
                  name: `Mandala_${Date.now()}.png`,
                  url: mandalaData,
                  playerId, // Associate the file with the current player ID
                };
                localStorage.setItem("gallery", JSON.stringify([...savedFiles, newFile]));
              }}
            />
          )}
          {currentGame === "grounding" && (
            <GroundingGame playerId={playerId || "Guest"} onBack={() => setCurrentGame("menu")} />
          )}
          {currentGame === "ocean" && (
            <BreathingGame playerId={playerId || "Guest"} onBackToApp={() => setCurrentGame("menu")} />
          )}
          {currentGame === "gallery" && (
            <Gallery
              playerId={playerId || "Guest"}
              savedFiles={JSON.parse(localStorage.getItem("gallery") || "[]")}
              onBack={() => setCurrentGame("menu")}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;

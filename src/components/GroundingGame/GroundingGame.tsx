import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameState {
  phase: "see" | "hear" | "touch" | "smell" | "taste";
  completed: boolean;
  level: number;
}

interface GroundingGameProps {
  playerId: string;
  onBack: () => void;
}

const levelRequirements = {
  1: { see: 5, hear: 4, touch: 3, smell: 2, taste: 1 },
  2: { see: 4, hear: 3, touch: 2, smell: 1, taste: 0 },
  3: { see: 3, hear: 2, touch: 1, smell: 0, taste: 0 },
};

const phasePrompts: Record<string, string[]> = {
  see: [
    "List a vehicle you see",
    "List an animal you see",
    "List an electronic item you see",
    "List a color you see",
    "List a shape you see",
  ],
  hear: [
    "List a sound you hear",
    "List a word you hear",
    "List a melody you hear",
    "List a noise you hear",
  ],
  touch: [
    "List a texture you feel",
    "List a surface you touch",
    "List a material you recognize by touch",
  ],
};

const GroundingGame: React.FC<GroundingGameProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: "see",
    completed: false,
    level: 1,
  });
  const [inputs, setInputs] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0); // To track the active prompt index

  const handleInput = (value: string, index: number) => {
    const trimmedValue = value.trim().toLowerCase();

    if (inputs.includes(trimmedValue) && trimmedValue !== inputs[index]) {
      alert("You cannot repeat the same answer.");
      return;
    }

    const newInputs = [...inputs];
    newInputs[index] = trimmedValue;
    setInputs(newInputs);
  };

  const handleFocus = (index: number) => {
    setCurrentPromptIndex(index); // Update the current prompt index as soon as the input is focused
  };

  const moveToNextPhase = () => {
    const phases: ("see" | "hear" | "touch" | "smell" | "taste")[] = [
      "see",
      "hear",
      "touch",
      "smell",
      "taste",
    ];
    const currentIndex = phases.indexOf(gameState.phase);

    setGameState((prev) => {
      if (
        phases[currentIndex + 1] &&
        levelRequirements[prev.level as keyof typeof levelRequirements][
          phases[currentIndex + 1]
        ] > 0
      ) {
        return { ...prev, phase: phases[currentIndex + 1] };
      } else if (prev.level < 3) {
        return {
          ...prev,
          level: prev.level + 1,
          phase: "see",
          completed: prev.level + 1 === 3,
        };
      }
      return { ...prev, completed: true };
    });
    setInputs([]);
    setScore((prev) => prev + 50);
    setCurrentPromptIndex(0); // Reset prompt index for the new phase
  };

  useEffect(() => {
    if (gameState.completed) {
      alert("Congratulations! You've completed all levels.");
    }
  }, [gameState.completed]);

  const currentPrompt =
    phasePrompts[gameState.phase][currentPromptIndex] || "Enter an item";

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-100 to-blue-200">
      <motion.div
        className="max-w-2xl mx-auto p-8 bg-white bg-opacity-90 rounded-xl shadow-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-2xl font-bold mb-4 text-center text-black">
          {`Level ${gameState.level}: ${currentPrompt}`}
        </h1>
        <AnimatePresence mode="wait">
          <motion.div className="space-y-4">
            {Array.from({
              length:
                levelRequirements[
                  gameState.level as keyof typeof levelRequirements
                ][gameState.phase],
            }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <input
                  type="text"
                  className="w-full p-4 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder={phasePrompts[gameState.phase][index] || ""}
                  value={inputs[index] || ""}
                  onChange={(e) => handleInput(e.target.value, index)}
                  onFocus={() => handleFocus(index)} // Update headline on focus
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 text-center">
          <button
            onClick={moveToNextPhase}
            disabled={
              inputs.filter((input) => input && input.trim() !== "").length <
              levelRequirements[gameState.level as keyof typeof levelRequirements][
                gameState.phase
              ]
            }
            className={`px-6 py-2 rounded-lg ${
              inputs.filter((input) => input && input.trim() !== "").length ===
              levelRequirements[gameState.level as keyof typeof levelRequirements][
                gameState.phase
              ]
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next Phase
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GroundingGame;

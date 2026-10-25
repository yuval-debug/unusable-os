import React, { useState } from "react";
import { RefreshCw, Shield, AudioLines, HelpCircle } from "lucide-react";
import { sfx } from "../utils/soundEffects";

interface Tile {
  id: number;
  label: string;
  emoji: string;
  isTarget: boolean;
  selected: boolean;
  offset: { x: number; y: number };
}

interface Level {
  title: string;
  subtitle: string;
  tiles: Omit<Tile, "selected" | "offset">[ ];
}

const LEVELS: Level[] = [
  {
    title: "Select all squares with",
    subtitle: "Crosswalks that look slightly emotional",
    tiles: [
      { id: 1, label: "Sad Walk", emoji: "🚶", isTarget: true },
      { id: 2, label: "Normal Car", emoji: "🚗", isTarget: false },
      { id: 3, label: "Anxious Light", emoji: "🚦", isTarget: true },
      { id: 4, label: "Tree", emoji: "🌲", isTarget: false },
      { id: 5, label: "Depressed Street", emoji: "🛣️", isTarget: true },
      { id: 6, label: "Happy Bus", emoji: "🚌", isTarget: false },
      { id: 7, label: "Crying Cone", emoji: "🗼", isTarget: true },
      { id: 8, label: "Bicycle", emoji: "🚲", isTarget: false },
      { id: 9, label: "Lonely Sign", emoji: "🪧", isTarget: true },
    ],
  },
  {
    title: "Click all items required to",
    subtitle: "Complete the face",
    tiles: [
      { id: 1, label: "Mustache", emoji: "🥸", isTarget: true },
      { id: 2, label: "Egg", emoji: "🍳", isTarget: false },
      { id: 3, label: "Eyes", emoji: "👀", isTarget: true },
      { id: 4, label: "Mouth", emoji: "👄", isTarget: true },
      { id: 5, label: "Sports Car", emoji: "🏎️", isTarget: false },
      { id: 6, label: "Salt Shaker", emoji: "🧂", isTarget: false },
      { id: 7, label: "Nose", emoji: "👃", isTarget: true },
      { id: 8, label: "Shoe", emoji: "👟", isTarget: false },
      { id: 9, label: "Ears", emoji: "👂", isTarget: true },
    ],
  },
];

interface CaptchaHellProps {
  onSuccess?: () => void;
}

export const CaptchaHell: React.FC<CaptchaHellProps> = ({ onSuccess }) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [errorText, setErrorText] = useState("");
  const [verifyPos, setVerifyPos] = useState({ x: 0, y: 0 });

  const currentLevel = LEVELS[levelIdx];
  const [tiles, setTiles] = useState<Tile[]>(() =>
    currentLevel.tiles.map((t) => ({ ...t, selected: false, offset: { x: 0, y: 0 } }))
  );

  const toggleTile = (id: number) => {
    sfx.playBouncePop(500);
    setErrorText("");
    setTiles((prev) =>
      prev.map((tile) => {
        if (tile.id === id) {
          // Jitter offset on click
          const rx = (Math.random() - 0.5) * 16;
          const ry = (Math.random() - 0.5) * 16;
          return { ...tile, selected: !tile.selected, offset: { x: rx, y: ry } };
        }
        return tile;
      })
    );
  };

  const handleVerify = () => {
    const wrong = tiles.some((t) => (t.selected && !t.isTarget) || (!t.selected && t.isTarget));

    if (wrong) {
      sfx.playErrorBuzzer();
      setErrorText("Please try again: Verification failed.");
      setTiles((prev) =>
        prev.map((t) => ({
          ...t,
          selected: false,
          offset: { x: (Math.random() - 0.5) * 24, y: (Math.random() - 0.5) * 24 },
        }))
      );
      return;
    }

    if (levelIdx + 1 < LEVELS.length) {
      sfx.playBouncePop(900);
      const nextLvl = LEVELS[levelIdx + 1];
      setLevelIdx((prev) => prev + 1);
      setTiles(nextLvl.tiles.map((t) => ({ ...t, selected: false, offset: { x: 0, y: 0 } })));
      setErrorText("");
    } else {
      if (onSuccess) onSuccess();
    }
  };

  const handleVerifyHover = () => {
    if (Math.random() > 0.35) {
      sfx.playBouncePop(700);
      setVerifyPos({
        x: (Math.random() - 0.5) * 140,
        y: (Math.random() - 0.5) * 50,
      });
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden text-gray-800 select-none font-sans">
      {/* reCAPTCHA Blue Header Banner */}
      <div className="bg-[#4285F4] p-4 text-white">
        <p className="text-xs opacity-90 font-medium">{currentLevel.title}</p>
        <h2 className="text-xl font-bold tracking-tight mt-0.5">{currentLevel.subtitle}</h2>
        <p className="text-[11px] opacity-80 mt-1">Click verify once there are none left.</p>
      </div>

      {/* Grid Canvas */}
      <div className="p-3 bg-gray-100 grid grid-cols-3 gap-2 border-b border-gray-200">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => toggleTile(tile.id)}
            style={{
              transform: `translate(${tile.offset.x}px, ${tile.offset.y}px)`,
              transition: "transform 0.15s ease-out",
            }}
            className={`h-24 rounded flex flex-col items-center justify-center p-2 border font-medium text-xs transition-all relative ${
              tile.selected
                ? "bg-blue-100 border-blue-500 ring-2 ring-blue-500 scale-95"
                : "bg-white border-gray-300 hover:border-gray-400"
            }`}
          >
            {tile.selected && (
              <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-0.5">
                <Shield size={10} />
              </div>
            )}
            <span className="text-3xl mb-1">{tile.emoji}</span>
            <span className="text-[10px] text-gray-600 font-semibold text-center leading-tight">
              {tile.label}
            </span>
          </button>
        ))}
      </div>

      {errorText && (
        <div className="bg-red-50 text-red-600 text-xs px-3 py-2 border-b border-red-200 font-medium text-center">
          {errorText}
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="p-3 bg-white flex items-center justify-between min-h-[56px] relative">
        <div className="flex items-center gap-3 text-gray-500">
          <button
            onClick={() =>
              setTiles((prev) => prev.map((t) => ({ ...t, selected: false, offset: { x: 0, y: 0 } })))
            }
            className="hover:text-gray-800 transition"
            title="Reload CAPTCHA"
          >
            <RefreshCw size={18} />
          </button>
          <button className="hover:text-gray-800 transition" title="Audio CAPTCHA">
            <AudioLines size={18} />
          </button>
          <button className="hover:text-gray-800 transition" title="Help">
            <HelpCircle size={18} />
          </button>
        </div>

        {/* Evasive Blue Verify Button */}
        <button
          onMouseEnter={handleVerifyHover}
          onClick={handleVerify}
          style={{
            transform: `translate(${verifyPos.x}px, ${verifyPos.y}px)`,
            transition: "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className="px-6 py-2 bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs rounded shadow-md active:scale-95 transition-colors"
        >
          Verify
        </button>
      </div>
    </div>
  );
};
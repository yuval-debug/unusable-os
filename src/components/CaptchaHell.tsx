import React, { useState } from "react";
import { ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";

interface CaptchaTile {
  id: number;
  label: string;
  isCorrect: boolean;
  selected: boolean;
  offset: { x: number; y: number };
}

interface Stage {
  prompt: string;
  subtext: string;
  tiles: Omit<CaptchaTile, "selected" | "offset">[ ];
}

const STAGES: Stage[] = [
  {
    prompt: "Select all tiles with a crosswalk",
    subtext: "Clicking a tile shifts adjacent tiles",
    tiles: [
      { id: 1, label: "🚶 Crosswalk", isCorrect: true },
      { id: 2, label: "🚗 Car", isCorrect: false },
      { id: 3, label: "🚦 Traffic Light", isCorrect: false },
      { id: 4, label: "🚶 Crosswalk", isCorrect: true },
      { id: 5, label: "🌲 Tree", isCorrect: false },
      { id: 6, label: "🚶 Crosswalk", isCorrect: true },
      { id: 7, label: "🏠 House", isCorrect: false },
      { id: 8, label: "🚗 Car", isCorrect: false },
      { id: 9, label: "🚶 Crosswalk", isCorrect: true },
    ],
  },
  {
    prompt: "Select all tiles that feel slightly emotional",
    subtext: "Subjective verification required",
    tiles: [
      { id: 1, label: "🥹 Sad Dog", isCorrect: true },
      { id: 2, label: "🗿 Stone Statue", isCorrect: false },
      { id: 3, label: "🥀 Withered Rose", isCorrect: true },
      { id: 4, label: "⚙️ Gear", isCorrect: false },
      { id: 5, label: "🌧️ Rain Cloud", isCorrect: true },
      { id: 6, label: "📐 Ruler", isCorrect: false },
      { id: 7, label: "🕯️ Melting Candle", isCorrect: true },
      { id: 8, label: "📦 Cardboard Box", isCorrect: false },
      { id: 9, label: "☕ Cold Coffee", isCorrect: true },
    ],
  },
];

interface CaptchaHellProps {
  onSuccess?: () => void;
}

export const CaptchaHell: React.FC<CaptchaHellProps> = ({ onSuccess }) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [passed, setPassed] = useState(false);
  const [verifyOffset, setVerifyOffset] = useState({ x: 0, y: 0 });

  const currentStage = STAGES[stageIndex];
  const [tiles, setTiles] = useState<CaptchaTile[]>(() =>
    currentStage.tiles.map((t) => ({ ...t, selected: false, offset: { x: 0, y: 0 } }))
  );

  const toggleTile = (id: number) => {
    setErrorMsg("");
    setTiles((prev) =>
      prev.map((tile) => {
        if (tile.id === id) {
          // Add small jitter movement when clicked
          const randomX = (Math.random() - 0.5) * 20;
          const randomY = (Math.random() - 0.5) * 20;
          return {
            ...tile,
            selected: !tile.selected,
            offset: { x: randomX, y: randomY },
          };
        }
        return tile;
      })
    );
  };

  const handleVerify = () => {
    const incorrectSelection = tiles.some(
      (t) => (t.selected && !t.isCorrect) || (!t.selected && t.isCorrect)
    );

    if (incorrectSelection) {
      setErrorMsg("Verification failed! Tiles reset.");
      // Reset selections & add penalty scatter
      setTiles((prev) =>
        prev.map((t) => ({
          ...t,
          selected: false,
          offset: {
            x: (Math.random() - 0.5) * 30,
            y: (Math.random() - 0.5) * 30,
          },
        }))
      );
      return;
    }

    if (stageIndex + 1 < STAGES.length) {
      const nextStage = STAGES[stageIndex + 1];
      setStageIndex((prev) => prev + 1);
      setTiles(
        nextStage.tiles.map((t) => ({ ...t, selected: false, offset: { x: 0, y: 0 } }))
      );
      setErrorMsg("");
    } else {
      setPassed(true);
      if (onSuccess) onSuccess();
    }
  };

  const handleVerifyHover = () => {
    // Evasive verify button
    if (Math.random() > 0.4) {
      setVerifyOffset({
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.5) * 60,
      });
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-2xl max-w-md mx-auto border border-gray-800">
      <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShieldAlert className="text-amber-400" size={20} />
          CaptchaSolver v2.0
        </h2>
        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
          Stage {stageIndex + 1}/{STAGES.length}
        </span>
      </div>

      {!passed ? (
        <>
          {/* Prompt Header */}
          <div className="bg-blue-600 p-4 rounded-lg mb-4">
            <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">
              {currentStage.subtext}
            </p>
            <p className="text-lg font-bold text-white mt-1">
              {currentStage.prompt}
            </p>
          </div>

          {/* 3x3 Tile Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => toggleTile(tile.id)}
                style={{
                  transform: `translate(${tile.offset.x}px, ${tile.offset.y}px)`,
                  transition: "transform 0.2s ease-out",
                }}
                className={`h-24 rounded-lg flex flex-col items-center justify-center gap-1 p-2 border font-medium text-xs transition-all relative ${
                  tile.selected
                    ? "bg-blue-900/60 border-blue-400 ring-2 ring-blue-400"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-750"
                }`}
              >
                {tile.selected && (
                  <CheckCircle2
                    size={16}
                    className="absolute top-1 right-1 text-blue-400"
                  />
                )}
                <span className="text-2xl">{tile.label.split(" ")[0]}</span>
                <span className="text-center line-clamp-1">{tile.label.split(" ").slice(1).join(" ")}</span>
              </button>
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 font-semibold mb-3 text-center">
              {errorMsg}
            </p>
          )}

          {/* Evasive Verify Button */}
          <div className="flex justify-between items-center relative min-h-[48px]">
            <button
              onClick={() =>
                setTiles((prev) =>
                  prev.map((t) => ({ ...t, selected: false, offset: { x: 0, y: 0 } }))
                )
              }
              className="p-2 text-gray-400 hover:text-white text-xs flex items-center gap-1"
            >
              <RefreshCw size={14} /> Reset Grid
            </button>

            <button
              onMouseEnter={handleVerifyHover}
              onClick={handleVerify}
              style={{
                transform: `translate(${verifyOffset.x}px, ${verifyOffset.y}px)`,
                transition: "transform 0.15s ease-out",
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-lg text-sm shadow-lg text-white"
            >
              Verify
            </button>
          </div>
        </>
      ) : (
        <div className="py-8 text-center flex flex-col items-center gap-3">
          <CheckCircle2 size={48} className="text-emerald-400 animate-bounce" />
          <h3 className="text-xl font-bold text-emerald-400">Human Identity Confirmed!</h3>
          <p className="text-xs text-gray-400 max-w-xs">
            You successfully bypassed the Captcha Solver module without losing your sanity.
          </p>
        </div>
      )}
    </div>
  );
};
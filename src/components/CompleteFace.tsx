import React, { useState } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { sfx } from "../utils/soundEffects";

interface FacialPart {
  id: string;
  label: string;
  emoji: string;
  placed: boolean;
  targetPos: { top: string };
}

export interface CompleteFaceProps {
  onSuccess?: () => void;
}

export const CompleteFace: React.FC<CompleteFaceProps> = ({ onSuccess }) => {
  const [parts, setParts] = useState<FacialPart[]>([
    { id: "eyes", label: "Eyes", emoji: "👀", placed: false, targetPos: { top: "22%" } },
    { id: "nose", label: "Nose", emoji: "👃", placed: false, targetPos: { top: "42%" } },
    { id: "mouth", label: "Mouth", emoji: "👄", placed: false, targetPos: { top: "65%" } },
    { id: "mustache", label: "Mustache", emoji: "🥸", placed: false, targetPos: { top: "55%" } },
  ]);

  const [errorMsg, setErrorMsg] = useState("");

  const handleTogglePart = (id: string) => {
    sfx.playBouncePop(600);
    setErrorMsg("");
    setParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, placed: !p.placed } : p))
    );
  };

  const handleVerify = () => {
    const isComplete = parts
      .filter((p) => p.id === "eyes" || p.id === "nose" || p.id === "mouth")
      .every((p) => p.placed);

    if (isComplete) {
      sfx.playBouncePop(900);
      if (onSuccess) onSuccess();
    } else {
      sfx.playErrorBuzzer();
      setErrorMsg("Face incomplete! Attach eyes, nose, and mouth to verify.");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden text-gray-800 select-none font-sans">
      {/* Orange reCAPTCHA Header */}
      <div className="bg-amber-500 p-4 text-white">
        <p className="text-xs opacity-90 font-medium">Click components to</p>
        <h2 className="text-2xl font-bold tracking-tight mt-0.5">Complete the Face</h2>
      </div>

      {/* Assembly Canvas */}
      <div className="relative w-full h-64 bg-amber-50 p-4 flex items-center justify-between border-b border-gray-200 overflow-hidden">
        {/* Component Selector Sidebar */}
        <div className="flex flex-col gap-2 z-10 w-32">
          {parts.map((part) => (
            <button
              key={part.id}
              onClick={() => handleTogglePart(part.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                part.placed
                  ? "bg-amber-200 border-amber-400 opacity-60"
                  : "bg-white border-amber-300 hover:scale-105 shadow-sm"
              }`}
            >
              <span className="text-lg">{part.emoji}</span>
              <span>{part.label}</span>
              {part.placed && <CheckCircle2 size={12} className="text-emerald-600 ml-auto" />}
            </button>
          ))}
        </div>

        {/* Head Target Area */}
        <div className="relative w-40 h-48 bg-amber-200 border-4 border-amber-400 rounded-[50%_50%_45%_45%] shadow-inner flex flex-col items-center justify-center">
          {parts
            .filter((p) => p.placed)
            .map((p) => (
              <div
                key={p.id}
                style={{ top: p.targetPos.top }}
                className="absolute text-2xl transition-all duration-300 animate-bounce"
              >
                {p.emoji}
              </div>
            ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 text-xs px-3 py-2 border-b border-red-200 font-medium text-center">
          {errorMsg}
        </div>
      )}

      {/* Controls Footer */}
      <div className="p-3 bg-white flex items-center justify-between">
        <button
          onClick={() => {
            setParts((prev) => prev.map((p) => ({ ...p, placed: false })));
            setErrorMsg("");
          }}
          className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
        >
          <RefreshCw size={18} />
        </button>

        <button
          onClick={handleVerify}
          className="px-6 py-2 bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs rounded shadow transition active:scale-95 cursor-pointer"
        >
          Verify
        </button>
      </div>
    </div>
  );
};
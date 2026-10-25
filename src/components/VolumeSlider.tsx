import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { sfx } from "../utils/soundEffects";

export interface VolumeSliderProps {
  onSuccess?: () => void;
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({ onSuccess }) => {
  const [val, setVal] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    setVal(newVal);
    sfx.playBouncePop(300 + newVal * 5);

    if (newVal === 50 && !isSuccess) {
      setIsSuccess(true);
      sfx.playBouncePop(900);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4 text-white select-none">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-gray-400">Target Volume: 50%</span>
        <span className={`text-base font-bold font-mono ${val === 50 ? "text-emerald-400" : "text-blue-400"}`}>
          {val}%
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={val}
        onChange={handleChange}
        className="w-full accent-blue-500 cursor-pointer h-2 bg-gray-800 rounded-lg appearance-none"
      />

      {isSuccess && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs p-2 rounded-lg text-center font-bold flex items-center justify-center gap-1.5">
          <CheckCircle2 size={14} /> Exact 50% Audio Set!
        </div>
      )}
    </div>
  );
};
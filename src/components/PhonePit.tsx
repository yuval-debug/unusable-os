import React, { useState } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { sfx } from "../utils/soundEffects";

export interface PhonePitProps {
  onSuccess?: () => void;
}

export const PhonePit: React.FC<PhonePitProps> = ({ onSuccess }) => {
  const [digits, setDigits] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const availableDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const handleAddDigit = (digit: string) => {
    if (digits.length < 10) {
      sfx.playBouncePop(500 + digits.length * 50);
      setDigits((prev) => [...prev, digit]);
    }
  };

  const handleClear = () => {
    sfx.playBouncePop(300);
    setDigits([]);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (digits.length === 10) {
      sfx.playBouncePop(900);
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } else {
      sfx.playErrorBuzzer();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-4 text-white select-none">
      <div className="bg-gray-950 border border-gray-800 p-3 rounded-lg text-center">
        <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Target: 10 Digits</p>
        <div className="text-lg font-mono font-bold tracking-widest text-blue-400 h-7 flex items-center justify-center">
          {digits.length > 0 ? digits.join("") : <span className="text-gray-600 text-sm">Drop / Click Numbers</span>}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {availableDigits.map((d) => (
          <button
            key={d}
            onClick={() => handleAddDigit(d)}
            className="h-10 bg-gray-800 hover:bg-blue-600 hover:text-white rounded-lg font-bold text-sm transition active:scale-90 border border-gray-700 cursor-pointer"
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={handleClear}
          className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 cursor-pointer"
        >
          <RefreshCw size={16} />
        </button>

        <button
          onClick={handleSubmit}
          disabled={digits.length !== 10}
          className={`flex-1 py-2.5 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 ${
            digits.length === 10
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg cursor-pointer"
              : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
          }`}
        >
          {submitted ? <CheckCircle2 size={16} className="text-emerald-400" /> : "Submit Number"}
        </button>
      </div>
    </div>
  );
};
import React, { useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { sfx } from "../utils/soundEffects";

export interface ScatteringPasswordProps {
  onSuccess?: () => void;
}

export const ScatteringPassword: React.FC<ScatteringPasswordProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    sfx.playBouncePop(400 + val.length * 30);

    if (val.length >= 6 && !isVerified) {
      setIsVerified(true);
      sfx.playBouncePop(900);
      if (onSuccess) onSuccess();
    }
  };

  const handleReset = () => {
    sfx.playBouncePop(300);
    setPassword("");
    setIsVerified(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4 text-white select-none">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 font-mono">Secret Key (Min 6 chars):</label>
        <input
          type="password"
          value={password}
          onChange={handleInput}
          placeholder="Type password..."
          className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-blue-400 font-mono outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleReset}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 cursor-pointer"
        >
          <RefreshCw size={16} />
        </button>

        {isVerified && (
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800">
            <CheckCircle2 size={14} /> Key Accepted
          </div>
        )}
      </div>
    </div>
  );
};
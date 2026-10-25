import React, { useState, useEffect } from "react";
import { Monitor, Volume2, ShieldAlert, Cpu, Sparkles, Terminal } from "lucide-react";
import { sfx } from "../utils/soundEffects";

interface ChaosTaskbarProps {
  onOpenApp?: (appName: string) => void;
}

export const ChaosTaskbar: React.FC<ChaosTaskbarProps> = ({ onOpenApp }) => {
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [cpuLoad, setCpuLoad] = useState(99);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(Math.floor(92 + Math.random() * 8));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleStartHover = () => {
    sfx.playBouncePop(600);
    const newX = (Math.random() - 0.5) * 300;
    const newY = Math.random() < 0.5 ? -Math.random() * 100 : 0;
    setStartPos({ x: newX, y: newY });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-11 bg-gray-900 border-t border-gray-700 flex items-center justify-between px-3 z-50 select-none shadow-2xl">
      <div className="relative">
        <button
          onMouseEnter={handleStartHover}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            transform: `translate(${startPos.x}px, ${startPos.y}px)`,
            transition: "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded font-bold text-xs flex items-center gap-2 shadow-lg border border-blue-400/30 text-white active:scale-95"
        >
          <Monitor size={15} />
          <span>Start</span>
        </button>

        {isMenuOpen && (
          <div className="absolute bottom-12 left-0 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-2 z-50 text-xs">
            <div className="p-2 border-b border-gray-800 font-bold text-blue-400 flex items-center gap-2">
              <Sparkles size={14} /> UnusableOS Programs
            </div>
            <div className="py-1 flex flex-col gap-1">
              <button
                onClick={() => {
                  if (onOpenApp) onOpenApp("phone");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-gray-800 rounded flex items-center gap-2 text-white"
              >
                📞 PhonePit.exe
              </button>
              <button
                onClick={() => {
                  if (onOpenApp) onOpenApp("volume");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-gray-800 rounded flex items-center gap-2 text-white"
              >
                🔊 GravityVolume.sys
              </button>
              <button
                onClick={() => {
                  if (onOpenApp) onOpenApp("password");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-gray-800 rounded flex items-center gap-2 text-white"
              >
                🔑 PasswordScatter.dll
              </button>
              <button
                onClick={() => {
                  if (onOpenApp) onOpenApp("captcha");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-gray-800 rounded flex items-center gap-2 text-white"
              >
                🛡️ CaptchaSolver.exe
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-gray-400">
        <span className="px-2 py-0.5 bg-gray-800 rounded border border-gray-700 flex items-center gap-1">
          <Terminal size={12} className="text-emerald-400" /> status: unstable
        </span>
        <span className="px-2 py-0.5 bg-gray-800 rounded border border-gray-700 flex items-center gap-1 text-amber-300">
          <ShieldAlert size={12} /> firewall: inverted
        </span>
      </div>

      <div className="flex items-center gap-3 font-mono text-xs">
        <div className="flex items-center gap-1 text-red-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">
          <Cpu size={13} />
          <span>CPU: {cpuLoad}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-300 bg-gray-800 px-2.5 py-1 rounded border border-gray-700">
          <Volume2 size={13} className="text-blue-400" />
          <span>{currentTime || "12:00 PM"}</span>
        </div>
      </div>
    </div>
  );
};
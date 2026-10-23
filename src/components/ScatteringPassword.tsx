import React, { useState, useRef, useEffect } from "react";
import { KeyRound, ShieldAlert } from "lucide-react";

interface PasswordChar {
  id: number;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isScattered: boolean;
}

export const ScatteringPassword: React.FC = () => {
  const [password, setPassword] = useState<PasswordChar[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [lastKeyTime, setLastKeyTime] = useState<number>(Date.now());
  const [isRevealed, setIsRevealed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const charsRef = useRef<PasswordChar[]>([]);

  useEffect(() => {
    charsRef.current = password;
  }, [password]);

  // Physics animation loop for scattered characters
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      charsRef.current.forEach((char) => {
        if (char.isScattered) {
          // Bounce off bounds
          char.x += char.vx;
          char.y += char.vy;
          char.vy += 0.15; // Gravity

          if (char.x < 15 || char.x > canvas.width - 15) {
            char.vx *= -0.8;
            char.x = Math.max(15, Math.min(canvas.width - 15, char.x));
          }
          if (char.y > canvas.height - 15) {
            char.vy *= -0.6;
            char.vx *= 0.95;
            char.y = canvas.height - 15;
          }

          // Draw floating scattered character
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(char.x, char.y, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 14px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(isRevealed ? char.char : "•", char.x, char.y);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRevealed]);

  const triggerScatter = () => {
    setPassword((prev) =>
      prev.map((c) => ({
        ...c,
        isScattered: true,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1) * 8,
      }))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = Date.now();
    const speed = now - lastKeyTime;
    setLastKeyTime(now);

    // Scatter trigger conditions: Typing faster than 80ms per key or hitting Caps Lock
    if (speed < 80 || e.key === "CapsLock") {
      triggerScatter();
      return;
    }

    if (e.key === "Backspace") {
      // Hitting backspace detonates everything
      triggerScatter();
      e.preventDefault();
      return;
    }

    if (e.key.length === 1) {
      const newChar: PasswordChar = {
        id: Date.now() + Math.random(),
        char: e.key,
        x: 50 + password.length * 20,
        y: 40,
        vx: 0,
        vy: 0,
        isScattered: false,
      };
      setPassword((prev) => [...prev, newChar]);
      setInputValue("");
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Recount/re-collect clicked character back into input box
    setPassword((prev) =>
      prev.map((char) => {
        if (char.isScattered) {
          const dist = Math.hypot(char.x - clickX, char.y - clickY);
          if (dist < 20) {
            return { ...char, isScattered: false, vx: 0, vy: 0 };
          }
        }
        return char;
      })
    );
  };

  const clearAll = () => {
    setPassword([]);
    setInputValue("");
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-2xl max-w-2xl mx-auto border border-gray-800 mt-6">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <KeyRound className="text-purple-400" />
        Step 3: Scattering Password Field
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Type carefully! Typing too fast (&lt;80ms/key), hitting <kbd className="bg-gray-800 px-1 rounded">Backspace</kbd>, or pressing <kbd className="bg-gray-800 px-1 rounded">Caps Lock</kbd> will cause your password characters to explode!
      </p>

      {/* Interactive Input Box */}
      <div className="bg-gray-800 p-4 rounded-lg mb-4 flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 min-h-[44px] overflow-x-auto">
          {password.map((c) =>
            !c.isScattered ? (
              <span
                key={c.id}
                className="inline-block w-4 text-center font-mono text-lg text-emerald-400 font-bold"
              >
                {isRevealed ? c.char : "•"}
              </span>
            ) : null
          )}
          <input
            type="text"
            value={inputValue}
            onKeyDown={handleKeyDown}
            onChange={() => {}}
            placeholder={password.filter((c) => !c.isScattered).length === 0 ? "Type slow password here..." : ""}
            className="bg-transparent text-white outline-none flex-1 text-sm font-mono ml-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRevealed(!isRevealed)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs"
            title="Peek Password"
          >
            {isRevealed ? "Hide" : "Peek"}
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-xs font-bold rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Physics Canvas for Scattered Characters */}
      <div className="relative border border-gray-700 rounded-lg bg-gray-950 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          onClick={handleCanvasClick}
          className="cursor-pointer w-full"
        />
        {password.some((c) => c.isScattered) && (
          <div className="absolute top-2 left-2 flex items-center gap-1 text-xs text-red-400 font-semibold bg-red-950/80 px-2 py-1 rounded">
            <ShieldAlert size={14} /> Character Explosion! Click scattered nodes to collect them back.
          </div>
        )}
      </div>
    </div>
  );
};

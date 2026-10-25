import React, { useEffect, useRef, useState } from "react";
import { RefreshCw, Waves, AlertCircle, Droplets } from "lucide-react";
import { sfx } from "../utils/soundEffects";

export interface OceanSanctuaryProps {
  onSuccess?: () => void;
}

export const OceanSanctuary: React.FC<OceanSanctuaryProps> = ({ onSuccess }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [moisture, setMoisture] = useState<number>(100);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const moistureRef = useRef<number>(100);

  const fishRef = useRef({
    x: 80,
    y: 130,
    vx: 0,
    vy: 0,
    radius: 14,
    inWater: false,
    flopTimer: 0,
  });

  const initGame = () => {
    fishRef.current = {
      x: 60 + Math.random() * 40,
      y: 130 + Math.random() * 20,
      vx: 0,
      vy: 0,
      radius: 14,
      inWater: false,
      flopTimer: 0,
    };
    moistureRef.current = 100;
    setMoisture(100);
    setIsVictory(false);
    setIsGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let waveOffset = 0;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      waveOffset += 0.05;

      const waterX = canvas.width * 0.55;

      ctx.fillStyle = "#fef08a";
      ctx.fillRect(0, 0, waterX, canvas.height);

      ctx.fillStyle = "#fde047";
      ctx.fillRect(waterX - 10, 0, 10, canvas.height);

      const oceanGrad = ctx.createLinearGradient(waterX, 0, canvas.width, 0);
      oceanGrad.addColorStop(0, "#0284c7");
      oceanGrad.addColorStop(1, "#0369a1");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(waterX, 0, canvas.width - waterX, canvas.height);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let y = 0; y <= canvas.height; y += 10) {
        const offset = Math.sin(waveOffset + y * 0.05) * 5;
        if (y === 0) ctx.moveTo(waterX + offset, y);
        else ctx.lineTo(waterX + offset, y);
      }
      ctx.stroke();

      const fish = fishRef.current;

      if (!isVictory && !isGameOver) {
        fish.x += fish.vx;
        fish.y += fish.vy;
        fish.vx *= 0.92;
        fish.vy *= 0.92;

        if (fish.x < waterX) {
          fish.flopTimer += 1;
          if (fish.flopTimer > 15) {
            fish.vx += (Math.random() - 0.45) * 4;
            fish.vy += (Math.random() - 0.5) * 4;
            fish.flopTimer = 0;
          }

          moistureRef.current = Math.max(0, moistureRef.current - 0.2);
          setMoisture(moistureRef.current);

          if (moistureRef.current <= 0) {
            setIsGameOver(true);
            try {
              if (sfx && typeof sfx.playErrorBuzzer === "function") sfx.playErrorBuzzer();
            } catch {}
          }
        } else {
          if (!fish.inWater) {
            fish.inWater = true;
            setIsVictory(true);
            try {
              if (sfx && typeof sfx.playBouncePop === "function") sfx.playBouncePop(900);
            } catch {}
            if (onSuccess) onSuccess();
          }
        }

        if (fish.x < fish.radius) fish.x = fish.radius;
        if (fish.y < fish.radius) fish.y = fish.radius;
        if (fish.y > canvas.height - fish.radius) fish.y = canvas.height - fish.radius;
      }

      ctx.save();
      ctx.translate(fish.x, fish.y);
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fish.inWater ? "🐟" : "🐠", 0, 0);
      ctx.restore();

      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SAFE OCEAN WATER", canvas.width * 0.78, canvas.height / 2);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isVictory, isGameOver, onSuccess]);

  const handleNudgeFish = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isVictory || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const fish = fishRef.current;
    const dist = Math.hypot(fish.x - clickX, fish.y - clickY);

    if (dist < 45) {
      fish.vx += 5 + Math.random() * 3;
      fish.vy += (Math.random() - 0.5) * 4;
      try {
        if (sfx && typeof sfx.playBouncePop === "function") sfx.playBouncePop(600);
      } catch {}
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-950 border border-sky-900 rounded-xl p-4 flex flex-col gap-3 text-white select-none font-sans shadow-2xl">
      <div className="bg-sky-950/80 border border-sky-800 p-2.5 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves className="text-sky-400 animate-pulse" size={18} />
          <span className="text-xs font-black tracking-wider text-sky-200 uppercase">OCEAN SANCTUARY</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300 bg-black/50 px-2.5 py-1 rounded border border-sky-900">
          <Droplets size={13} className="text-cyan-400" />
          <span>{Math.ceil(moisture)}%</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-sky-900">
        <canvas
          ref={canvasRef}
          width={320}
          height={190}
          onClick={handleNudgeFish}
          className="w-full h-48 bg-slate-950 cursor-pointer block"
        />
      </div>

      {isGameOver && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-red-400 font-medium">
          <AlertCircle size={13} />
          <span>The fish dried out! Hit reset to try again.</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={initGame}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>RESET FISH</span>
        </button>
      </div>

      <p className="text-[10px] text-sky-400/80 text-center font-mono">
        {isVictory
          ? "✨ Success! The fish safely reached the ocean!"
          : "Click/tap directly on the fish to splash & nudge it into the water!"}
      </p>
    </div>
  );
};
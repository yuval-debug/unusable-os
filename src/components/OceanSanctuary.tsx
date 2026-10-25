import React, { useEffect, useRef, useState } from "react";
import { RefreshCw, Waves, AlertCircle, Droplets, Sparkles } from "lucide-react";
import { sfx } from "../utils/soundEffects";

export interface OceanSanctuaryProps {
  onSuccess?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export const OceanSanctuary: React.FC<OceanSanctuaryProps> = ({ onSuccess }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [moisture, setMoisture] = useState<number>(100);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const moistureRef = useRef<number>(100);
  const particlesRef = useRef<Particle[]>([]);

  // Fish Physics State
  const fishRef = useRef({
    x: 70,
    y: 120,
    vx: 0,
    vy: 0,
    radius: 16,
    inWater: false,
    flopTimer: 0,
    angle: 0,
  });

  const initGame = () => {
    fishRef.current = {
      x: 50 + Math.random() * 50,
      y: 110 + Math.random() * 40,
      vx: 0,
      vy: 0,
      radius: 16,
      inWater: false,
      flopTimer: 0,
      angle: 0,
    };
    moistureRef.current = 100;
    particlesRef.current = [];
    setMoisture(100);
    setIsVictory(false);
    setIsGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const spawnParticles = (x: number, y: number, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.7) * 5,
        life: 1.0,
        color,
      });
    }
  };

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let waveOffset = 0;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      waveOffset += 0.08;

      const waterX = canvas.width * 0.52; // Ocean boundary line

      // --- 1. RETRO BEACH SAND (LEFT SIDE) ---
      const sandGrad = ctx.createLinearGradient(0, 0, waterX, 0);
      sandGrad.addColorStop(0, "#fef08a");
      sandGrad.addColorStop(1, "#facc15");
      ctx.fillStyle = sandGrad;
      ctx.fillRect(0, 0, waterX, canvas.height);

      // Sand texture dots
      ctx.fillStyle = "rgba(180, 83, 9, 0.15)";
      for (let i = 15; i < waterX; i += 30) {
        for (let j = 10; j < canvas.height; j += 25) {
          ctx.fillRect(i + ((j % 3) * 4), j, 3, 3);
        }
      }

      // --- 2. OCEAN WATER (RIGHT SIDE) ---
      const oceanGrad = ctx.createLinearGradient(waterX, 0, canvas.width, 0);
      oceanGrad.addColorStop(0, "#0284c7");
      oceanGrad.addColorStop(0.5, "#0369a1");
      oceanGrad.addColorStop(1, "#0c4a6e");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(waterX, 0, canvas.width - waterX, canvas.height);

      // Neon Animated Foam Wave Line
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let y = 0; y <= canvas.height; y += 6) {
        const offset = Math.sin(waveOffset + y * 0.08) * 6;
        if (y === 0) ctx.moveTo(waterX + offset, y);
        else ctx.lineTo(waterX + offset, y);
      }
      ctx.stroke();

      // Deep water waves
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      for (let row = 20; row < canvas.height; row += 35) {
        ctx.beginPath();
        const waveX = waterX + 40 + Math.sin(waveOffset + row) * 12;
        ctx.arc(waveX, row, 18, 0, Math.PI);
        ctx.fill();
      }

      const fish = fishRef.current;

      if (!isVictory && !isGameOver) {
        // --- 3. PHYSICS & FLOPPING ---
        fish.x += fish.vx;
        fish.y += fish.vy;
        fish.vx *= 0.90; // Sand Friction
        fish.vy *= 0.90;

        // Fish tilt angle based on velocity
        fish.angle = Math.atan2(fish.vy, fish.vx || 0.1);

        // Dry land mechanics
        if (fish.x < waterX) {
          fish.flopTimer += 1;
          if (fish.flopTimer > 12) {
            // Chaotic erratic flop jump
            fish.vx += (Math.random() - 0.55) * 5;
            fish.vy += (Math.random() - 0.5) * 5;
            fish.flopTimer = 0;
            spawnParticles(fish.x, fish.y, 2, "#fde047");
          }

          // Moisture Drain
          moistureRef.current = Math.max(0, moistureRef.current - 0.22);
          setMoisture(moistureRef.current);

          if (moistureRef.current <= 0) {
            setIsGameOver(true);
            try {
              if (sfx && typeof sfx.playErrorBuzzer === "function") sfx.playErrorBuzzer();
            } catch {}
          }
        } else {
          // Reached Safe Ocean Water!
          if (!fish.inWater) {
            fish.inWater = true;
            setIsVictory(true);
            spawnParticles(fish.x, fish.y, 25, "#38bdf8");
            try {
              if (sfx && typeof sfx.playBouncePop === "function") sfx.playBouncePop(950);
            } catch {}
            if (onSuccess) onSuccess();
          }
        }

        // Screen Boundary Constraints
        if (fish.x < fish.radius) { fish.x = fish.radius; fish.vx *= -0.5; }
        if (fish.y < fish.radius) { fish.y = fish.radius; fish.vy *= -0.5; }
        if (fish.y > canvas.height - fish.radius) { fish.y = canvas.height - fish.radius; fish.vy *= -0.5; }
      }

      // --- 4. PARTICLES UPDATE & DRAW ---
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // --- 5. FISH SPRITE RENDER ---
      ctx.save();
      ctx.translate(fish.x, fish.y);
      if (!fish.inWater) {
        ctx.rotate(fish.angle * 0.4);
      }

      // Desaturation opacity effect as fish dries out
      const dryRatio = moistureRef.current / 100;
      ctx.globalAlpha = 0.4 + dryRatio * 0.6;

      ctx.font = "28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fish.inWater ? "🐟" : "🐠", 0, 0);
      ctx.restore();

      // --- 6. RETRO HUD TEXT & OVERLAYS ---
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "900 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SAFETY ZONE (OCEAN)", canvas.width * 0.77, 24);

      // CRT Scanline Effect Overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
      }

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

    if (dist < 50) {
      // Impulse boost toward ocean (Right direction velocity)
      fish.vx += 6.5 + Math.random() * 3.5;
      fish.vy += (Math.random() - 0.5) * 6;
      spawnParticles(clickX, clickY, 12, "#38bdf8");

      try {
        if (sfx && typeof sfx.playBouncePop === "function") sfx.playBouncePop(650);
      } catch {}
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-950 border-2 border-sky-600 rounded-xl p-4 flex flex-col gap-3 text-white select-none font-mono shadow-[0_0_20px_rgba(2,132,199,0.3)]">
      {/* Retro Header */}
      <div className="bg-sky-950/90 border border-sky-600/60 p-2.5 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves className="text-sky-400 animate-pulse" size={18} />
          <span className="text-xs font-black tracking-widest text-sky-200 uppercase">LVL 8: OCEAN SANCTUARY</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300 bg-slate-900 px-2.5 py-1 rounded border border-sky-800">
          <Droplets size={13} className="text-cyan-400 animate-bounce" />
          <span>{Math.ceil(moisture)}% MOISTURE</span>
        </div>
      </div>

      {/* Screen Canvas Container */}
      <div className="relative overflow-hidden rounded-lg border-2 border-sky-800 shadow-inner">
        <canvas
          ref={canvasRef}
          width={320}
          height={190}
          onClick={handleNudgeFish}
          className="w-full h-48 bg-slate-950 cursor-pointer block"
        />
      </div>

      {isGameOver && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-bold bg-red-950/60 p-2 rounded border border-red-800 animate-pulse">
          <AlertCircle size={14} />
          <span>CRITICAL: MOISTURE EXHAUSTED! RESET FISH!</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={initGame}
          className="w-full py-2 bg-slate-900 hover:bg-sky-950 text-sky-300 rounded-lg border border-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>RESET POSITION</span>
        </button>
      </div>

      <p className="text-[10px] text-sky-400/90 text-center font-bold tracking-tight">
        {isVictory
          ? "✨ VERIFICATION COMPLETE: FISH RETURNED TO SANCTUARY!"
          : "NUDGE/SPLASH FISH TOWARDS THE NEON WATER BEFORE MOISTURE EXPIRES"}
      </p>
    </div>
  );
};
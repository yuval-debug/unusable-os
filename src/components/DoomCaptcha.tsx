import React, { useEffect, useRef, useState } from "react";
import { RefreshCw, Target, Shield, Zap } from "lucide-react";
import { sfx } from "../utils/soundEffects";

interface Demon {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alive: boolean;
  emoji: string;
}

export interface DoomCaptchaProps {
  onSuccess?: () => void;
}

export const DoomCaptcha: React.FC<DoomCaptchaProps> = ({ onSuccess }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const demonsRef = useRef<Demon[]>([]);
  const muzzleFlashRef = useRef<{ x: number; y: number; opacity: number } | null>(null);
  
  const [kills, setKills] = useState<number>(0);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  const demonEmojis = ["👹", "👿", "👾", "👺", "💀"];

  const initDemons = () => {
    const initialDemons: Demon[] = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 220,
      y: 40 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: 24,
      alive: true,
      emoji: demonEmojis[i % demonEmojis.length],
    }));
    demonsRef.current = initialDemons;
    setKills(0);
    setIsVictory(false);
  };

  useEffect(() => {
    initDemons();
  }, []);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- RETRO DARK RED ATMOSPHERE ---
      ctx.fillStyle = "#140707";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Brick texture grid overlay
      ctx.strokeStyle = "rgba(127, 29, 29, 0.25)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // --- ANIMATE AND RENDER DEMONS ---
      demonsRef.current = demonsRef.current.map((demon) => {
        if (!demon.alive) return demon;

        let { x, y, vx, vy, size } = demon;
        x += vx;
        y += vy;

        if (x - size < 0 || x + size > canvas.width) vx *= -1;
        if (y - size < 0 || y + size > canvas.height) vy *= -1;

        // Render demon target aura
        ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
        ctx.beginPath();
        ctx.arc(x, y, size + 4, 0, Math.PI * 2);
        ctx.fill();

        // Render demon emoji entity
        ctx.font = `${size * 1.5}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(demon.emoji, x, y);

        return { ...demon, x, y, vx, vy };
      });

      // --- MUZZLE FLASH EFFECT ---
      if (muzzleFlashRef.current && muzzleFlashRef.current.opacity > 0) {
        const { x, y, opacity } = muzzleFlashRef.current;
        const flashGrad = ctx.createRadialGradient(x, y, 2, x, y, 40);
        flashGrad.addColorStop(0, `rgba(254, 240, 138, ${opacity})`);
        flashGrad.addColorStop(0.5, `rgba(239, 68, 68, ${opacity * 0.6})`);
        flashGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();

        muzzleFlashRef.current.opacity -= 0.15;
      }

      // CRT Scanline Overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.fillRect(0, i, canvas.width, 2);
      }

      animId = requestAnimationFrame(updateGame);
    };

    animId = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleShoot = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isVictory) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const shootX = e.clientX - rect.left;
    const shootY = e.clientY - rect.top;

    // Trigger visual muzzle flash
    muzzleFlashRef.current = { x: shootX, y: shootY, opacity: 0.9 };

    try {
      if (sfx && typeof sfx.playErrorBuzzer === "function") {
        sfx.playErrorBuzzer();
      }
    } catch {
      // Audio fallback
    }

    let hitCount = 0;
    demonsRef.current = demonsRef.current.map((demon) => {
      if (!demon.alive) return demon;
      const dist = Math.hypot(demon.x - shootX, demon.y - shootY);
      if (dist <= demon.size + 12) {
        try {
          if (sfx && typeof sfx.playBouncePop === "function") {
            sfx.playBouncePop(900);
          }
        } catch {
          // Audio fallback
        }
        hitCount++;
        return { ...demon, alive: false };
      }
      return demon;
    });

    if (hitCount > 0) {
      setKills((prev) => {
        const newKills = prev + hitCount;
        if (newKills >= 3) {
          setIsVictory(true);
          try {
            if (sfx && typeof sfx.playBouncePop === "function") {
              sfx.playBouncePop(1000);
            }
          } catch {
            // Audio fallback
          }
          if (onSuccess) onSuccess();
        }
        return newKills;
      });
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-950 border-2 border-red-900 rounded-xl p-4 flex flex-col gap-3 text-white select-none font-mono shadow-2xl">
      {/* Retro Red DOOM Header */}
      <div className="bg-red-950 border border-red-800 p-2.5 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="text-red-500 animate-pulse" size={18} />
          <span className="text-xs font-black tracking-widest text-red-400">DOOM CAPTCHA</span>
        </div>
        <div className="text-xs font-bold text-red-300 bg-black/60 px-2.5 py-1 rounded border border-red-900">
          KILLS: {kills}/3
        </div>
      </div>

      {/* FPS Canvas Area */}
      <div className="relative overflow-hidden rounded-lg border-2 border-red-900">
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          onClick={handleShoot}
          className="w-full h-44 bg-black cursor-crosshair block"
        />
      </div>

      {/* Classic DOOM Status Bar HUD */}
      <div className="bg-gradient-to-r from-stone-900 via-neutral-900 to-stone-900 p-2 rounded-lg border border-red-900/60 flex items-center justify-between text-[11px] font-bold">
        <div className="flex items-center gap-1 text-emerald-400">
          <Shield size={14} />
          <span>100%</span>
        </div>

        <div className="text-xl">
          {isVictory ? "😎" : kills > 0 ? "😏" : "😠"}
        </div>

        <div className="flex items-center gap-1 text-amber-400">
          <Zap size={14} />
          <span>INFINITE</span>
        </div>

        <button
          onClick={initDemons}
          className="p-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded border border-red-800 transition active:scale-95 cursor-pointer"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      <p className="text-[10px] text-red-400 text-center font-sans tracking-tight">
        {isVictory ? "✨ Verification Complete! All threats eliminated." : "Shoot 3 demons to prove humanity!"}
      </p>
    </div>
  );
};
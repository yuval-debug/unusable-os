import React, { useEffect, useRef, useState } from "react";
import { RefreshCw, Skull, ShieldAlert } from "lucide-react";
import { sfx } from "../utils/soundEffects";

export interface DoomCaptchaProps {
  onSuccess?: () => void;
}

interface ApproachingMonster {
  id: number;
  x: number;
  z: number;
  speed: number;
  hp: number;
  maxHp: number;
  type: "imp" | "caco" | "demon";
}

export const DoomCaptcha: React.FC<DoomCaptchaProps> = ({ onSuccess }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [kills, setKills] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [health, setHealth] = useState<number>(100);
  const [ammo, setAmmo] = useState<number>(20);

  const monstersRef = useRef<ApproachingMonster[]>([]);
  const killsRef = useRef<number>(0);
  const healthRef = useRef<number>(100);
  const ammoRef = useRef<number>(20);
  const muzzleFlashRef = useRef<boolean>(false);

  const playerXRef = useRef<number>(0);
  const playerZRef = useRef<number>(0);
  const walkCycleRef = useRef<number>(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  const initGame = () => {
    killsRef.current = 0;
    healthRef.current = 100;
    ammoRef.current = 20;
    playerXRef.current = 0;
    playerZRef.current = 0;

    setKills(0);
    setHealth(100);
    setAmmo(20);
    setIsGameOver(false);
    setIsVictory(false);

    monstersRef.current = [
      { id: 1, x: -40, z: 2.8, speed: 0.008, hp: 2, maxHp: 2, type: "imp" },
      { id: 2, x: 30, z: 3.5, speed: 0.006, hp: 3, maxHp: 3, type: "caco" },
      { id: 3, x: 0, z: 4.2, speed: 0.010, hp: 2, maxHp: 2, type: "demon" },
    ];
  };

  useEffect(() => {
    initGame();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastHitTime = 0;

    const gameLoop = () => {
      const width = canvas.width;
      const height = canvas.height;
      const viewportHeight = 135;

      ctx.clearRect(0, 0, width, height);

      // --- 1. HANDLE PLAYER MOVEMENT (WASD / ARROWS) ---
      let isMoving = false;
      const moveSpeed = 1.2;
      const keys = keysPressedRef.current;

      if (!isGameOver && !isVictory) {
        if (keys["a"] || keys["arrowleft"]) {
          playerXRef.current = Math.max(-50, playerXRef.current - moveSpeed);
          isMoving = true;
        }
        if (keys["d"] || keys["arrowright"]) {
          playerXRef.current = Math.min(50, playerXRef.current + moveSpeed);
          isMoving = true;
        }
        if (keys["w"] || keys["arrowup"]) {
          playerZRef.current += 0.02;
          isMoving = true;
        }
        if (keys["s"] || keys["arrowdown"]) {
          playerZRef.current = Math.max(0, playerZRef.current - 0.02);
          isMoving = true;
        }

        if (isMoving) {
          walkCycleRef.current += 0.15;
        }
      }

      const headBobY = Math.sin(walkCycleRef.current) * 3;
      const px = playerXRef.current;
      const vanishX = width / 2 - px;
      const vanishY = viewportHeight * 0.45 + headBobY;

      // --- 2. EXACT DOOM CORRIDOR BACKDROP (FROM YOUR IMAGE) ---
      // Ceiling (Grey Stone Plates)
      ctx.fillStyle = "#3a3a38";
      ctx.fillRect(0, 0, width, vanishY);

      // Floor (Grey Hexagonal Tile Grid)
      const floorGrad = ctx.createLinearGradient(0, vanishY, 0, viewportHeight);
      floorGrad.addColorStop(0, "#4a4a46");
      floorGrad.addColorStop(1, "#1f1f1d");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, vanishY, width, viewportHeight - vanishY);

      // Floor Perspective Tile Lines
      ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      ctx.lineWidth = 1.5;
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(vanishX + i * 15, vanishY);
        ctx.lineTo(vanishX + i * 90, viewportHeight);
        ctx.stroke();
      }

      // Left Wall (Vertical Wood Plank Panels)
      ctx.fillStyle = "#695536";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(vanishX - 65, vanishY - 22);
      ctx.lineTo(vanishX - 65, vanishY + 38);
      ctx.lineTo(0, viewportHeight);
      ctx.fill();

      // Right Wall (Vertical Wood Plank Panels)
      ctx.fillStyle = "#5c4a2f";
      ctx.beginPath();
      ctx.moveTo(width, 0);
      ctx.lineTo(vanishX + 65, vanishY - 22);
      ctx.lineTo(vanishX + 65, vanishY + 38);
      ctx.lineTo(width, viewportHeight);
      ctx.fill();

      // Wall Plank Vertical Stripes
      ctx.strokeStyle = "rgba(20, 15, 10, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(vanishX - 65, vanishY - 22);
      ctx.moveTo(width, 0);
      ctx.lineTo(vanishX + 65, vanishY - 22);
      ctx.stroke();

      // Back Wall Corridor End
      ctx.fillStyle = "#473822";
      ctx.fillRect(vanishX - 65, vanishY - 22, 130, 60);

      // Outer Bevel Frame (Matching your screenshot's green marble border)
      ctx.fillStyle = "#4a543b";
      ctx.fillRect(0, 0, 12, viewportHeight);
      ctx.fillRect(width - 12, 0, 12, viewportHeight);
      ctx.fillRect(0, 0, width, 8);
      ctx.fillRect(0, viewportHeight - 6, width, 6);

      // --- 3. MONSTERS PERSPECTIVE DRAW & AI ---
      const sortedMonsters = [...monstersRef.current].sort((a, b) => b.z - a.z);

      for (const m of sortedMonsters) {
        if (m.hp > 0) {
          if (!isGameOver && !isVictory) {
            m.z -= m.speed;

            if (m.z <= 0.3) {
              const now = Date.now();
              if (now - lastHitTime > 800) {
                lastHitTime = now;
                healthRef.current = Math.max(0, healthRef.current - 15);
                setHealth(healthRef.current);
                try {
                  if (sfx && typeof sfx.playErrorBuzzer === "function") sfx.playErrorBuzzer();
                } catch {}

                if (healthRef.current <= 0) {
                  setIsGameOver(true);
                }
              }
            }
          }

          const scale = Math.max(0.2, 1 / (m.z || 0.1));
          const screenX = vanishX + (m.x - px * 0.5) * scale;
          const screenY = vanishY + 15 * scale;
          const spriteSize = Math.min(64, 24 * scale);

          ctx.save();
          ctx.translate(screenX, screenY);

          ctx.font = `${Math.floor(spriteSize)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const emoji = m.type === "caco" ? "👾" : m.type === "demon" ? "👹" : "👺";
          ctx.fillText(emoji, 0, 0);

          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(-spriteSize * 0.4, -spriteSize * 0.6, spriteSize * 0.8, 4);
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(-spriteSize * 0.4, -spriteSize * 0.6, (m.hp / m.maxHp) * (spriteSize * 0.8), 4);
          ctx.restore();
        }
      }

      // --- 4. FIRST-PERSON PISTOL / SHOTGUN POV ---
      const gunX = width / 2;
      const gunY = viewportHeight + (isMoving ? Math.sin(walkCycleRef.current * 2) * 2 : 0);

      if (muzzleFlashRef.current) {
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        ctx.arc(gunX, gunY - 55, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(gunX, gunY - 55, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Classic Centered Weapon Sprite
      ctx.fillStyle = "#334155";
      ctx.fillRect(gunX - 10, gunY - 18, 20, 18);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(gunX - 8, gunY - 32, 16, 14);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(gunX - 7, gunY - 52, 6, 20);
      ctx.fillRect(gunX + 1, gunY - 52, 6, 20);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(gunX - 6, gunY - 54, 4, 3);
      ctx.fillRect(gunX + 2, gunY - 54, 4, 3);

      // --- 5. EXACT DOOM RETRO HUD STATUS BAR ---
      const hudY = viewportHeight;
      const hudHeight = 45;

      ctx.fillStyle = "#4a543b"; // Classic Status Bar Frame
      ctx.fillRect(0, hudY, width, hudHeight);
      ctx.strokeStyle = "#1a1f14";
      ctx.lineWidth = 3;
      ctx.strokeRect(0, hudY, width, hudHeight);

      const colWidth = width / 5;
      for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(i * colWidth, hudY);
        ctx.lineTo(i * colWidth, height);
        ctx.stroke();
      }

      ctx.textAlign = "center";

      // 1. AMMO
      ctx.fillStyle = ammoRef.current <= 3 ? "#ef4444" : "#dc2626";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`${ammoRef.current}`, colWidth * 0.5, hudY + 20);
      ctx.fillStyle = "#d4d4d8";
      ctx.font = "900 8px monospace";
      ctx.fillText("AMMO", colWidth * 0.5, hudY + 36);

      // 2. HEALTH
      ctx.fillStyle = healthRef.current < 30 ? "#ef4444" : "#dc2626";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`${healthRef.current}%`, colWidth * 1.5, hudY + 20);
      ctx.fillStyle = "#d4d4d8";
      ctx.font = "900 8px monospace";
      ctx.fillText("HEALTH", colWidth * 1.5, hudY + 36);

      // 3. DOOM GUY MUGSHOT
      ctx.font = "20px sans-serif";
      const faceEmoji = healthRef.current <= 0 ? "💀" : healthRef.current < 40 ? "😫" : "😐";
      ctx.fillText(faceEmoji, colWidth * 2.5, hudY + 24);

      // 4. ARMOR
      ctx.fillStyle = "#dc2626";
      ctx.font = "bold 16px monospace";
      ctx.fillText("0%", colWidth * 3.5, hudY + 20);
      ctx.fillStyle = "#d4d4d8";
      ctx.font = "900 8px monospace";
      ctx.fillText("ARMOR", colWidth * 3.5, hudY + 36);

      // 5. WEAPON STATS
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 10px monospace";
      ctx.fillText("SHEL 20", colWidth * 4.5, hudY + 18);
      ctx.fillText("BULL  0", colWidth * 4.5, hudY + 32);

      // CRT Scanlines
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isVictory, onSuccess]);

  const handleShoot = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isGameOver || isVictory || ammoRef.current <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    ammoRef.current = Math.max(0, ammoRef.current - 1);
    setAmmo(ammoRef.current);

    muzzleFlashRef.current = true;
    setTimeout(() => {
      muzzleFlashRef.current = false;
    }, 90);

    try {
      if (sfx && typeof sfx.playBouncePop === "function") sfx.playBouncePop(1100);
    } catch {}

    const px = playerXRef.current;
    const vanishX = canvas.width / 2 - px;
    const vanishY = 135 * 0.45;

    for (const m of monstersRef.current) {
      if (m.hp > 0) {
        const scale = Math.max(0.2, 1 / (m.z || 0.1));
        const screenX = vanishX + (m.x - px * 0.5) * scale;
        const screenY = vanishY + 15 * scale;
        const hitRadius = Math.min(32, 16 * scale);

        if (Math.hypot(clickX - screenX, clickY - screenY) < hitRadius + 14) {
          m.hp -= 1;

          if (m.hp <= 0) {
            killsRef.current += 1;
            setKills(killsRef.current);

            if (killsRef.current < 3) {
              m.z = 3.5 + Math.random();
              m.x = (Math.random() - 0.5) * 70;
              m.hp = 2;
              m.maxHp = 2;
            } else {
              setIsVictory(true);
              if (onSuccess) onSuccess();
            }
          }
          break;
        }
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-200 border-2 border-slate-400 rounded-lg overflow-hidden shadow-2xl font-sans select-none">
      <div className="bg-blue-600 text-white p-3 shadow-md">
        <p className="text-xs font-medium tracking-wide opacity-90">Play DOOM® and kill</p>
        <h2 className="text-xl font-extrabold tracking-tight">at least 3 monsters</h2>
      </div>

      <div className="relative bg-black">
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          onClick={handleShoot}
          className="w-full h-48 block cursor-crosshair"
        />

        {isGameOver && (
          <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center text-red-200 font-mono gap-2">
            <ShieldAlert size={28} className="text-red-400 animate-bounce" />
            <h3 className="text-base font-black tracking-widest uppercase">YOU DIED!</h3>
            <button
              onClick={initGame}
              className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white font-bold rounded text-xs transition active:scale-95 cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {isVictory && (
          <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-emerald-200 font-mono gap-2 animate-fade-in">
            <h3 className="text-lg font-black tracking-widest uppercase">VERIFICATION PASSED!</h3>
            <p className="text-xs">3/3 MONSTERS ELIMINATED</p>
          </div>
        )}
      </div>

      <div className="p-2.5 bg-slate-100 flex items-center justify-between border-t border-slate-300">
        <button
          onClick={initGame}
          className="p-2 text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded transition active:scale-95 cursor-pointer"
          title="Reset Captcha"
        >
          <RefreshCw size={16} />
        </button>

        <span className="text-xs font-semibold text-slate-500 tracking-wide">
          WASD/Arrows to move • Click to shoot
        </span>

        <div className="flex items-center gap-1 bg-slate-200 px-2.5 py-1 rounded text-slate-700 font-mono font-bold text-xs">
          <Skull size={14} className="text-red-500" />
          <span>{kills}/3</span>
        </div>
      </div>
    </div>
  );
};
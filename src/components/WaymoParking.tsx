import React, { useEffect, useRef, useState } from "react";
import { RefreshCw, CheckCircle2, Car } from "lucide-react";
import { sfx } from "../utils/soundEffects";

export interface WaymoParkingProps {
  onSuccess?: () => void;
}

export const WaymoParking: React.FC<WaymoParkingProps> = ({ onSuccess }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [parked, setParked] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Drive into the green spot!");

  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lidarAngleRef = useRef(0);

  const carState = useRef({
    x: 40,
    y: 100,
    angle: 0,
    speed: 0,
    maxSpeed: 2.5,
    accel: 0.12,
    friction: 0.95,
    turnSpeed: 0.045,
    width: 32,
    height: 18,
  });

  const spot = { x: 230, y: 80, width: 60, height: 40 };

  const resetCar = () => {
    carState.current = {
      x: 40,
      y: 100,
      angle: 0,
      speed: 0,
      maxSpeed: 2.5,
      accel: 0.12,
      friction: 0.95,
      turnSpeed: 0.045,
      width: 32,
      height: 18,
    };
    setParked(false);
    setStatusMsg("Drive into the green spot!");
    sfx.playBouncePop(400);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
        e.preventDefault();
        keysRef.current[e.key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
        keysRef.current[e.key] = false;
      }
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

    const gameLoop = () => {
      const car = carState.current;
      const keys = keysRef.current;

      if (!parked) {
        if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
          car.speed = Math.min(car.speed + car.accel, car.maxSpeed);
        } else if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
          car.speed = Math.max(car.speed - car.accel, -car.maxSpeed * 0.6);
        } else {
          car.speed *= car.friction;
        }

        if (Math.abs(car.speed) > 0.05) {
          const dir = car.speed > 0 ? 1 : -1;
          if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
            car.angle -= car.turnSpeed * dir;
          }
          if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
            car.angle += car.turnSpeed * dir;
          }
        }

        car.x += Math.cos(car.angle) * car.speed;
        car.y += Math.sin(car.angle) * car.speed;

        const margin = 10;
        if (car.x < margin) { car.x = margin; car.speed = 0; }
        if (car.x > canvas.width - margin) { car.x = canvas.width - margin; car.speed = 0; }
        if (car.y < margin) { car.y = margin; car.speed = 0; }
        if (car.y > canvas.height - margin) { car.y = canvas.height - margin; car.speed = 0; }

        const inX = car.x >= spot.x && car.x <= spot.x + spot.width;
        const inY = car.y >= spot.y && car.y <= spot.y + spot.height;

        if (inX && inY) {
          setParked(true);
          setStatusMsg("PARKED SUCCESSFULLY! Autonomous AI Verified.");
          sfx.playBouncePop(900);
          if (onSuccess) onSuccess();
        }
      }

      lidarAngleRef.current += 0.15;

      // --- RENDER BACKGROUND ---
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid overlay
      ctx.strokeStyle = "rgba(30, 41, 59, 0.5)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Parking lane road lines
      ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(0, 70); ctx.lineTo(canvas.width, 70); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 130); ctx.lineTo(canvas.width, 130); ctx.stroke();
      ctx.setLineDash([]);

      // --- RENDER PARKING SPOT ---
      ctx.fillStyle = parked ? "rgba(16, 185, 129, 0.25)" : "rgba(34, 197, 94, 0.12)";
      ctx.strokeStyle = parked ? "#10b981" : "#22c55e";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.fillRect(spot.x, spot.y, spot.width, spot.height);
      ctx.strokeRect(spot.x, spot.y, spot.width, spot.height);
      ctx.setLineDash([]);

      // Corner markers
      const cLen = 6;
      ctx.strokeStyle = parked ? "#34d399" : "#4ade80";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(spot.x, spot.y + cLen); ctx.lineTo(spot.x, spot.y); ctx.lineTo(spot.x + cLen, spot.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(spot.x + spot.width - cLen, spot.y); ctx.lineTo(spot.x + spot.width, spot.y); ctx.lineTo(spot.x + spot.width, spot.y + cLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(spot.x, spot.y + spot.height - cLen); ctx.lineTo(spot.x, spot.y + spot.height); ctx.lineTo(spot.x + cLen, spot.y + spot.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(spot.x + spot.width - cLen, spot.y + spot.height); ctx.lineTo(spot.x + spot.width, spot.y + spot.height); ctx.lineTo(spot.x + spot.width, spot.y + spot.height - cLen); ctx.stroke();

      ctx.fillStyle = parked ? "#34d399" : "#4ade80";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("WAYMO SPOT", spot.width / 2, spot.y + spot.height / 2 + 3);

      // --- RENDER CAR ---
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);

      // Headlight Beams
      const beamGrad = ctx.createRadialGradient(car.width / 2 + 15, 0, 2, car.width / 2 + 25, 0, 25);
      beamGrad.addColorStop(0, "rgba(254, 240, 138, 0.4)");
      beamGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(car.width / 2, -6);
      ctx.lineTo(car.width / 2 + 35, -16);
      ctx.lineTo(car.width / 2 + 35, 16);
      ctx.lineTo(car.width / 2, 6);
      ctx.closePath();
      ctx.fill();

      // Car Chassis
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(-car.width / 2, -car.height / 2, car.width, car.height);
      ctx.fill();
      ctx.stroke();

      // Windshield & Glass
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.rect(-car.width / 4, -car.height / 2 + 3, car.width / 2, car.height - 6);
      ctx.fill();

      // LiDAR Dome (Rotating Sensor)
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(lidarAngleRef.current) * 6, Math.sin(lidarAngleRef.current) * 6);
      ctx.stroke();

      // Headlights
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(car.width / 2 - 2, -car.height / 2 + 2, 2.5, 3);
      ctx.fillRect(car.width / 2 - 2, car.height / 2 - 5, 2.5, 3);

      // Taillights
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(-car.width / 2, -car.height / 2 + 2, 2, 3);
      ctx.fillRect(-car.width / 2, car.height / 2 - 5, 2, 3);

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [parked, onSuccess]);

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 text-white select-none font-sans">
      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car size={18} className="text-blue-400" />
          <span className="text-xs font-bold text-slate-200">WAYMO AUTONOMOUS DRIVE</span>
        </div>
        <button
          onClick={resetCar}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition cursor-pointer"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={320}
        height={200}
        className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg shadow-inner cursor-pointer"
      />

      <div className="flex flex-col gap-1 items-center text-center">
        <div className={parked ? "text-xs font-bold text-emerald-400 flex items-center gap-1" : "text-xs font-bold text-slate-300"}>
          {parked && <CheckCircle2 size={14} />}
          <span>{statusMsg}</span>
        </div>

        <p className="text-[10px] text-slate-400 font-mono">
          Use arrow keys or WASD to steer
        </p>
      </div>
    </div>
  );
};
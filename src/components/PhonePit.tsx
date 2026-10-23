import React, { useEffect, useRef, useState } from "react";

interface Ball {
  id: number;
  digit: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isDragging: boolean;
}

export const PhonePit: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<number[]>([]);
  const ballsRef = useRef<Ball[]>([]);
  const draggedBallRef = useRef<Ball | null>(null);

  useEffect(() => {
    const balls: Ball[] = [];
    for (let i = 0; i < 80; i++) {
      balls.push({
        id: i,
        digit: Math.floor(Math.random() * 10),
        x: Math.random() * 500 + 50,
        y: Math.random() * 200 + 50,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 18,
        isDragging: false,
      });
    }
    ballsRef.current = balls;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#f3f4f6";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.fillRect(20, 320, 560, 60);
      ctx.strokeRect(20, 320, 560, 60);

      ballsRef.current.forEach((ball) => {
        if (!ball.isDragging) {
          ball.vy += 0.2;
          ball.x += ball.vx;
          ball.y += ball.vy;

          if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.vx *= -0.8;
            ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
          }
          if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height - 70) {
            ball.vy *= -0.7;
            ball.vx *= 0.98;
            ball.y = Math.min(canvas.height - 70 - ball.radius, ball.y);
          }
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.isDragging ? "#ef4444" : "#2563eb";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ball.digit.toString(), ball.x, ball.y);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    ballsRef.current.forEach((ball) => {
      const dist = Math.hypot(ball.x - mouseX, ball.y - mouseY);
      if (dist < ball.radius) {
        ball.isDragging = true;
        draggedBallRef.current = ball;
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedBallRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      draggedBallRef.current.x = e.clientX - rect.left;
      draggedBallRef.current.y = e.clientY - rect.top;
      draggedBallRef.current.vx = 0;
      draggedBallRef.current.vy = 0;
    }
  };

  const handleMouseUp = () => {
    if (draggedBallRef.current) {
      const ball = draggedBallRef.current;
      ball.isDragging = false;

      if (ball.y > 300 && phoneNumber.length < 10) {
        setPhoneNumber((prev) => [...prev, ball.digit]);
        ball.y = 50;
        ball.x = Math.random() * 500 + 50;
      }
      draggedBallRef.current = null;
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow-2xl max-w-2xl mx-auto border border-gray-800">
      <h2 className="text-xl font-bold mb-2">Step 1: Phone Number Input</h2>
      <p className="text-sm text-gray-400 mb-4">
        Drag digits into the bucket below to enter your phone number. Drop carefully!
      </p>

      <div className="bg-gray-800 p-3 rounded-lg mb-4 text-center">
        <span className="text-2xl font-mono tracking-widest text-emerald-400">
          {phoneNumber.length > 0 ? phoneNumber.join("") : "___-___-____"}
        </span>
        <button
          onClick={() => setPhoneNumber([])}
          className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-500 text-xs font-bold rounded"
        >
          Spill / Reset
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border border-gray-700 rounded-lg bg-gray-950 cursor-grab active:cursor-grabbing w-full"
      />
    </div>
  );
};
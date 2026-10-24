import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sfx } from "../utils/soundEffects";

export const VolumeSlider: React.FC = () => {
  const [sliderY, setSliderY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const vyRef = useRef(0);
  const gravity = 0.6;

  useEffect(() => {
    let animationFrameId: number;

    const updatePhysics = () => {
      if (isDragging) return;

      vyRef.current += gravity;
      let newY = sliderY + vyRef.current;
      const maxY = 220;

      if (newY >= maxY) {
        if (Math.abs(vyRef.current) > 2) {
          sfx.playImpactThud(Math.min(1.5, Math.abs(vyRef.current) / 5));
        }
        newY = maxY;
        vyRef.current = -vyRef.current * 0.4;
      }

      setSliderY(newY);
      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging, sliderY]);

  const volumePercent = Math.max(0, Math.min(100, Math.round(100 - (sliderY / 220) * 100)));

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-2xl max-w-md mx-auto border border-gray-800 select-none">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        {volumePercent === 0 ? <VolumeX className="text-red-400" /> : <Volume2 className="text-emerald-400" />}
        Step 2: Gravity Volume Control
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Hold and drag the knob up to raise volume. Release it and gravity pulls it straight down!
      </p>

      <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 flex flex-col items-center gap-4">
        <div className="text-2xl font-mono font-extrabold text-blue-400">
          {volumePercent}%
        </div>

        <div className="relative h-[220px] w-12 bg-gray-800 rounded-full flex justify-center py-2 overflow-hidden border border-gray-700">
          <div
            onMouseDown={() => {
              setIsDragging(true);
              vyRef.current = 0;
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={(e) => {
              if (!isDragging) return;
              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
              if (rect) {
                const relativeY = Math.max(0, Math.min(220, e.clientY - rect.top));
                setSliderY(relativeY);
              }
            }}
            style={{ transform: `translateY(${sliderY}px)` }}
            className="w-10 h-10 bg-blue-500 hover:bg-blue-400 rounded-full cursor-grab active:cursor-grabbing shadow-lg flex items-center justify-center font-bold text-xs relative z-10 transition-colors"
          >
            🔊
          </div>
        </div>
      </div>
    </div>
  );
};
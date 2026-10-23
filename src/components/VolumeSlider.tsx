import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, RotateCcw, RotateCw } from "lucide-react";

export const VolumeSlider: React.FC = () => {
  const [volume, setVolume] = useState<number>(50);
  const [tilt, setTilt] = useState<number>(0); // Angle in degrees (-45 to 45)
  const velocityRef = useRef<number>(0);
  const volumeRef = useRef<number>(50);
  const tiltRef = useRef<number>(0);

  // Keep refs synced for requestAnimationFrame loop
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    tiltRef.current = tilt;
  }, [tilt]);

  useEffect(() => {
    let animationFrameId: number;

    const updatePhysics = () => {
      // Calculate gravitational force along the tilted track
      // tilt = 0 -> slide down to 0; tilt > 0 -> roll toward 100; tilt < 0 -> pull down hard
      const rad = (tiltRef.current * Math.PI) / 180;
      const gravityAcceleration = Math.sin(rad - 0.2) * 1.5; // Slight bias toward falling

      velocityRef.current += gravityAcceleration;
      velocityRef.current *= 0.95; // Friction

      let newVol = volumeRef.current + velocityRef.current;

      // Bounce physics at boundaries
      if (newVol <= 0) {
        newVol = 0;
        velocityRef.current = -velocityRef.current * 0.4;
      } else if (newVol >= 100) {
        newVol = 100;
        velocityRef.current = -velocityRef.current * 0.4;
      }

      setVolume(Math.round(newVol));
      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const adjustTilt = (delta: number) => {
    setTilt((prev) => Math.max(-45, Math.min(45, prev + delta)));
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-2xl max-w-2xl mx-auto border border-gray-800 mt-6">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        {volume === 0 ? <VolumeX className="text-red-400" /> : <Volume2 className="text-blue-400" />}
        Step 2: Gravitational Volume Control
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Gravity pulls the volume knob down! Use tilt controls to balance the track and lock in your desired volume.
      </p>

      {/* Main Display */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 text-center flex items-center justify-between">
        <span className="text-gray-400 text-sm font-semibold">Current Level:</span>
        <span className="text-3xl font-mono font-bold text-amber-400">{volume}%</span>
        <span className="text-gray-400 text-xs">Track Tilt: {tilt}°</span>
      </div>

      {/* Physics Container with Rotation */}
      <div className="relative h-32 bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-center overflow-hidden mb-6">
        <div
          className="w-4/5 h-4 bg-gray-800 rounded-full relative transition-transform duration-75 flex items-center"
          style={{ transform: `rotate(${tilt}deg)` }}
        >
          {/* Track Fill */}
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
            style={{ width: `${volume}%` }}
          />

          {/* Sliding Knob */}
          <div
            className="absolute w-8 h-8 bg-amber-500 border-2 border-white rounded-full shadow-lg -translate-x-1/2 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ left: `${volume}%` }}
          >
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>
        </div>
      </div>

      {/* Tilt Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => adjustTilt(-5)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg flex items-center gap-2 text-sm font-semibold transition"
        >
          <RotateCcw size={16} /> Tilt Left
        </button>
        <button
          onClick={() => setTilt(0)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-400 rounded-lg"
        >
          Reset Tilt
        </button>
        <button
          onClick={() => adjustTilt(5)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg flex items-center gap-2 text-sm font-semibold transition"
        >
          Tilt Right <RotateCw size={16} />
        </button>
      </div>
    </div>
  );
};


// hackatime test

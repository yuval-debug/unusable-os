import React, { useState, useRef } from "react";
import { X, Minus, Square } from "lucide-react";

interface DesktopWindowProps {
  title: string;
  children: React.ReactNode;
  initialX: number;
  initialY: number;
}

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  title,
  children,
  initialX,
  initialY,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isMinimized, setIsMinimized] = useState(false);
  const [closeBtnOffset, setCloseBtnOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Handle header window drag
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Evasive Close Button Logic: runs away when hovered!
  const handleCloseHover = () => {
    const randomX = (Math.random() - 0.5) * 160;
    const randomY = (Math.random() - 0.5) * 80;
    setCloseBtnOffset({ x: randomX, y: randomY });
  };

  // Teleport window on minimize
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setPosition({
        x: Math.max(20, Math.random() * (window.innerWidth - 600)),
        y: Math.max(20, Math.random() * (window.innerHeight - 400)),
      });
    }
  };

  return (
    <div
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        position: "absolute",
        top: 0,
        left: 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="z-10 shadow-2xl rounded-xl border border-gray-700 bg-gray-900 w-[640px] select-none"
    >
      {/* Window Titlebar */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-gray-800 px-4 py-3 rounded-t-xl flex items-center justify-between cursor-move border-b border-gray-700"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs font-mono font-bold text-gray-300 ml-2">
            {title}
          </span>
        </div>

        {/* Uncooperative Window Controls */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition"
            title="Teleport Window"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => setPosition({ x: initialX, y: initialY })}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition"
            title="Reset Position"
          >
            <Square size={14} />
          </button>

          {/* Evasive Close Button */}
          <button
            onMouseEnter={handleCloseHover}
            style={{
              transform: `translate(${closeBtnOffset.x}px, ${closeBtnOffset.y}px)`,
              transition: "transform 0.15s ease-out",
            }}
            className="p-1 bg-red-600/80 hover:bg-red-600 rounded text-white shadow-md relative"
            title="Try closing me!"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Window Body */}
      {!isMinimized && <div className="p-2">{children}</div>}
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, HelpCircle, Volume2, ShieldCheck, Skull } from 'lucide-react';

// Types
type CaptchaMode = 'doom' | 'waymo' | 'face' | 'baby' | 'ocean' | 'pizza';

export const CaptchaSuite: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CaptchaMode>('doom');
  const [isVerified, setIsVerified] = useState(false);

  // ---------------------------------------------------------------------------
  // 1. DOOM CAPTCHA LOGIC & VISUALS
  // ---------------------------------------------------------------------------
  const [doomKills, setDoomKills] = useState(0);
  const [doomHealth, setDoomHealth] = useState(100);
  const [doomAmmo, setDoomAmmo] = useState(50);
  const [monsters, setMonsters] = useState<{ id: number; x: number; y: number; hp: number }[]>([
    { id: 1, x: 30, y: 40, hp: 1 },
    { id: 2, x: 50, y: 35, hp: 1 },
    { id: 3, x: 70, y: 45, hp: 1 },
  ]);
  const [isMuzzleFlashing, setIsMuzzleFlashing] = useState(false);

  const handleShootMonster = (id: number) => {
    if (doomAmmo <= 0) return;
    setDoomAmmo((prev) => Math.max(0, prev - 1));
    setIsMuzzleFlashing(true);
    setTimeout(() => setIsMuzzleFlashing(false), 120);

    setMonsters((prev) =>
      prev.filter((m) => {
        if (m.id === id) {
          const newKills = doomKills + 1;
          setDoomKills(newKills);
          if (newKills >= 3) {
            setIsVerified(true);
          }
          return false;
        }
        return true;
      })
    );
  };

  // ---------------------------------------------------------------------------
  // 2. WAYMO PARKING LOGIC
  // ---------------------------------------------------------------------------
  const [waymoPos, setWaymoPos] = useState({ x: 180, y: 150 });
  const [waymoParked, setWaymoParked] = useState(false);

  const handleWaymoMove = (dx: number, dy: number) => {
    setWaymoPos((prev) => {
      const newX = Math.min(Math.max(20, prev.x + dx), 340);
      const newY = Math.min(Math.max(20, prev.y + dy), 280);

      // Spot bounds check (e.g. Right row slot 2)
      if (newX > 250 && newX < 320 && newY > 120 && newY < 180) {
        setWaymoParked(true);
      } else {
        setWaymoParked(false);
      }
      return { x: newX, y: newY };
    });
  };

  // ---------------------------------------------------------------------------
  // 3. INTERACTIVE "ARE YOU A HUMAN" DRAG-AND-DROP
  // ---------------------------------------------------------------------------
  const [placedItems, setPlacedItems] = useState<string[]>([]);
  const handleDropItem = (itemType: string, isCorrect: boolean) => {
    if (isCorrect) {
      const updated = [...placedItems, itemType];
      setPlacedItems(updated);
      if (updated.length >= 2) {
        setIsVerified(true);
      }
    }
  };

  const resetCaptcha = () => {
    setIsVerified(false);
    setDoomKills(0);
    setDoomHealth(100);
    setDoomAmmo(50);
    setMonsters([
      { id: Date.now() + 1, x: 25, y: 40, hp: 1 },
      { id: Date.now() + 2, x: 50, y: 35, hp: 1 },
      { id: Date.now() + 3, x: 75, y: 45, hp: 1 },
    ]);
    setWaymoPos({ x: 180, y: 150 });
    setWaymoParked(false);
    setPlacedItems([]);
  };

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center font-sans">
      {/* CAPTCHA Selector Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto max-w-full p-2 bg-slate-800 rounded-lg border border-slate-700">
        <button
          onClick={() => { setActiveMode('doom'); resetCaptcha(); }}
          className={`px-3 py-1.5 rounded text-sm font-semibold transition ${activeMode === 'doom' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
        >
          DOOM CAPTCHA
        </button>
        <button
          onClick={() => { setActiveMode('waymo'); resetCaptcha(); }}
          className={`px-3 py-1.5 rounded text-sm font-semibold transition ${activeMode === 'waymo' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
        >
          Waymo Parking
        </button>
        <button
          onClick={() => { setActiveMode('face'); resetCaptcha(); }}
          className={`px-3 py-1.5 rounded text-sm font-semibold transition ${activeMode === 'face' ? 'bg-orange-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
        >
          Complete Face
        </button>
        <button
          onClick={() => { setActiveMode('baby'); resetCaptcha(); }}
          className={`px-3 py-1.5 rounded text-sm font-semibold transition ${activeMode === 'baby' ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
        >
          Feed Baby
        </button>
        <button
          onClick={() => { setActiveMode('ocean'); resetCaptcha(); }}
          className={`px-3 py-1.5 rounded text-sm font-semibold transition ${activeMode === 'ocean' ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
        >
          Fish in Ocean
        </button>
      </div>

      {/* Main CAPTCHA Container Box */}
      <div className="w-[420px] bg-slate-100 border-2 border-slate-300 rounded-lg overflow-hidden shadow-2xl text-slate-800">
        
        {/* Verification Success Notification */}
        {isVerified ? (
          <div className="p-8 text-center bg-emerald-50 text-emerald-800 flex flex-col items-center justify-center gap-3">
            <ShieldCheck size={56} className="text-emerald-600 animate-bounce" />
            <h2 className="text-2xl font-bold">Verification Complete!</h2>
            <p className="text-sm">You have proven you are a human.</p>
            <button
              onClick={resetCaptcha}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium"
            >
              Try Another
            </button>
          </div>
        ) : (
          <>
            {/* ------------------------------------------------------------------ */}
            {/* 1. DOOM CAPTCHA DISPLAY */}
            {/* ------------------------------------------------------------------ */}
            {activeMode === 'doom' && (
              <div>
                {/* Header Banner */}
                <div className="bg-blue-600 text-white px-4 py-3 font-sans">
                  <div className="text-xs uppercase tracking-wider text-blue-200">Play DOOM® and kill</div>
                  <div className="text-xl font-bold tracking-tight">at least 3 monsters</div>
                </div>

                {/* 3D Viewport Screen */}
                <div className="relative w-full h-[220px] bg-stone-900 overflow-hidden border-y-2 border-stone-700">
                  {/* Retro Tunnel Walls Background */}
                  <div className="absolute inset-0 bg-gradient-to-b from-stone-800 via-stone-950 to-stone-900 flex items-center justify-center">
                    <div className="w-full h-full border-x-[50px] border-y-[30px] border-stone-800 opacity-60"></div>
                  </div>

                  {/* Doom Monsters */}
                  {monsters.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleShootMonster(m.id)}
                      style={{ left: `${m.x}%`, top: `${m.y}%` }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                    >
                      {/* Floating demon / Cacodemon sprite simulation */}
                      <div className="w-12 h-12 bg-red-600 rounded-full border-2 border-red-800 shadow-lg flex items-center justify-center animate-pulse group-hover:scale-110 transition-transform">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-black rounded-full"></div>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Shotgun & Muzzle Flash */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none">
                    {isMuzzleFlashing && (
                      <div className="w-20 h-20 bg-yellow-300 rounded-full blur-sm opacity-90 mx-auto -mb-10 animate-ping"></div>
                    )}
                    {/* Shotgun Sprite Rendering */}
                    <div className="w-16 h-28 bg-stone-700 border-x-4 border-stone-800 rounded-t-md mx-auto shadow-2xl relative">
                      <div className="w-6 h-12 bg-stone-900 mx-auto mt-2 rounded-t-sm"></div>
                    </div>
                  </div>
                </div>

                {/* Classic Doom Status HUD Bar */}
                <div className="bg-red-950 border-t-2 border-red-800 p-2 text-red-500 font-mono text-xs flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-[10px] text-red-400">AMMO</div>
                    <div className="text-lg font-bold text-red-200">{doomAmmo}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-red-400">HEALTH</div>
                    <div className="text-lg font-bold text-red-200">{doomHealth}%</div>
                  </div>
                  {/* Face Portrait Box */}
                  <div className="w-10 h-10 bg-stone-800 border border-red-600 rounded flex items-center justify-center text-lg">
                    😠
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-red-400">ARMOR</div>
                    <div className="text-lg font-bold text-red-200">0%</div>
                  </div>
                  {/* Kills Badge */}
                  <div className="bg-stone-900 px-2 py-1 rounded border border-stone-700 text-stone-300 flex items-center gap-1">
                    <Skull size={14} className="text-red-500" />
                    <span>{doomKills}/3</span>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* 2. WAYMO PARKING CAPTCHA DISPLAY */}
            {/* ------------------------------------------------------------------ */}
            {activeMode === 'waymo' && (
              <div>
                {/* Header */}
                <div className="bg-blue-600 text-white px-4 py-3">
                  <div className="text-xs text-blue-100">Park the Waymo in the</div>
                  <div className="text-xl font-bold">Parking Spot</div>
                </div>

                {/* Parking Lot Area */}
                <div className="relative w-full h-[240px] bg-neutral-800 border-y border-neutral-600 overflow-hidden">
                  {/* Grass Border */}
                  <div className="w-full h-4 bg-emerald-700 border-b border-emerald-800"></div>

                  {/* Left Parking Bays */}
                  <div className="absolute left-2 top-6 bottom-2 w-28 border-r-2 border-dashed border-white flex flex-col justify-between py-1">
                    <div className="h-8 border-y border-white bg-slate-600 rounded-sm my-0.5"></div>
                    <div className="h-8 border-y border-white bg-blue-600 rounded-sm my-0.5"></div>
                    <div className="h-8 border-y border-white bg-slate-400 rounded-sm my-0.5"></div>
                    <div className="h-8 border-y border-white bg-pink-600 rounded-sm my-0.5"></div>
                  </div>

                  {/* Right Parking Bays */}
                  <div className="absolute right-2 top-6 bottom-2 w-28 border-l-2 border-dashed border-white flex flex-col justify-between py-1">
                    <div className="h-8 border-y border-white bg-purple-600 rounded-sm my-0.5"></div>
                    {/* TARGET OPEN SPOT */}
                    <div className={`h-8 border-2 ${waymoParked ? 'border-emerald-400 bg-emerald-950/40' : 'border-yellow-400 bg-yellow-400/10'} rounded-sm my-0.5 flex items-center justify-center text-[10px] text-yellow-300 font-bold`}>
                      {waymoParked ? 'PARKED!' : 'PARK HERE'}
                    </div>
                    <div className="h-8 border-y border-white bg-yellow-600 rounded-sm my-0.5"></div>
                    <div className="h-8 border-y border-white bg-cyan-600 rounded-sm my-0.5"></div>
                  </div>

                  {/* Player's Waymo Vehicle */}
                  <div
                    style={{ left: `${waymoPos.x}px`, top: `${waymoPos.y}px` }}
                    className="absolute w-8 h-14 bg-white border-2 border-slate-900 rounded-md shadow-lg transition-all flex flex-col items-center justify-between p-1 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    {/* LiDAR Dome Sensor on roof */}
                    <div className="w-3 h-3 bg-black rounded-full border border-blue-400"></div>
                    <div className="w-5 h-6 bg-slate-200 rounded-sm"></div>
                  </div>
                </div>

                {/* Waymo Controls & Verify */}
                <div className="p-3 bg-slate-100 flex items-center justify-between">
                  <div className="grid grid-cols-3 gap-1 w-28">
                    <div></div>
                    <button onClick={() => handleWaymoMove(0, -15)} className="bg-slate-300 hover:bg-slate-400 rounded text-xs py-1">▲</button>
                    <div></div>
                    <button onClick={() => handleWaymoMove(-15, 0)} className="bg-slate-300 hover:bg-slate-400 rounded text-xs py-1">◀</button>
                    <button onClick={() => handleWaymoMove(0, 15)} className="bg-slate-300 hover:bg-slate-400 rounded text-xs py-1">▼</button>
                    <button onClick={() => handleWaymoMove(15, 0)} className="bg-slate-300 hover:bg-slate-400 rounded text-xs py-1">▶</button>
                  </div>

                  <button
                    onClick={() => { if (waymoParked) setIsVerified(true); }}
                    disabled={!waymoParked}
                    className={`px-5 py-2 rounded font-bold transition ${waymoParked ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* 3. ARE YOU A HUMAN: COMPLETE THE FACE */}
            {/* ------------------------------------------------------------------ */}
            {activeMode === 'face' && (
              <div className="bg-amber-500 p-4 min-h-[260px] flex flex-col justify-between">
                <div className="text-white font-bold text-lg mb-2">Complete the face.</div>

                <div className="flex items-center justify-between relative">
                  {/* Draggable Facial Components */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDropItem('mouth', true)}
                      className="p-2 bg-white rounded shadow hover:scale-105 transition text-2xl"
                    >
                      👄
                    </button>
                    <button
                      onClick={() => handleDropItem('moustache', true)}
                      className="p-2 bg-white rounded shadow hover:scale-105 transition text-2xl"
                    >
                      🥸
                    </button>
                    <button
                      onClick={() => handleDropItem('car', false)}
                      className="p-2 bg-white rounded shadow hover:scale-105 transition text-2xl opacity-60"
                    >
                      🚗
                    </button>
                  </div>

                  {/* Potato Head Face Canvas */}
                  <div className="w-40 h-48 bg-amber-200 border-4 border-amber-800 rounded-full relative flex flex-col items-center justify-center shadow-inner">
                    <div className="flex gap-4 mb-2">
                      <div className="w-4 h-4 bg-slate-900 rounded-full"></div>
                      <div className="w-4 h-4 bg-slate-900 rounded-full"></div>
                    </div>
                    {/* Render Dropped Items */}
                    <div className="text-xl">
                      {placedItems.includes('moustache') && '🥸'}
                      {placedItems.includes('mouth') && '👄'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* 4. ARE YOU A HUMAN: FEED THE BABY */}
            {/* ------------------------------------------------------------------ */}
            {activeMode === 'baby' && (
              <div className="bg-emerald-500 p-4 min-h-[260px] flex flex-col justify-between">
                <div className="text-white font-bold text-lg mb-2">Give food to the baby.</div>

                <div className="flex items-center justify-between">
                  {/* Food items */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDropItem('carrot', true)} className="p-2 bg-white rounded text-2xl hover:scale-105">🥕</button>
                    <button onClick={() => handleDropItem('banana', true)} className="p-2 bg-white rounded text-2xl hover:scale-105">🍌</button>
                    <button onClick={() => handleDropItem('remote', false)} className="p-2 bg-white rounded text-2xl opacity-50">📱</button>
                    <button onClick={() => handleDropItem('football', false)} className="p-2 bg-white rounded text-2xl opacity-50">🏈</button>
                  </div>

                  {/* Baby Vector */}
                  <div className="w-36 h-40 bg-pink-100 border-4 border-pink-300 rounded-full flex flex-col items-center justify-center">
                    <div className="text-4xl">👶</div>
                    <div className="text-xs text-pink-700 font-semibold mt-2">
                      {placedItems.length}/2 Foods Fed
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* 5. ARE YOU A HUMAN: OCEAN FISH */}
            {/* ------------------------------------------------------------------ */}
            {activeMode === 'ocean' && (
              <div className="bg-sky-400 p-4 min-h-[260px] flex flex-col justify-between">
                <div className="text-white font-bold text-lg">Put all the fish in the ocean.</div>

                <div className="flex gap-2 justify-center my-2">
                  <button onClick={() => handleDropItem('fish1', true)} className="p-2 bg-white rounded text-2xl hover:scale-105">🐟</button>
                  <button onClick={() => handleDropItem('calculator', false)} className="p-2 bg-white rounded text-2xl opacity-50">🧮</button>
                  <button onClick={() => handleDropItem('fish2', true)} className="p-2 bg-white rounded text-2xl hover:scale-105">🐠</button>
                  <button onClick={() => handleDropItem('balloon', false)} className="p-2 bg-white rounded text-2xl opacity-50">🎈</button>
                </div>

                {/* Ocean Area */}
                <div className="w-full h-24 bg-blue-600 rounded-lg border-2 border-blue-300 flex items-center justify-center text-white gap-2">
                  {placedItems.length === 0 ? (
                    <span className="text-xs text-blue-200">Drag/Click fish here</span>
                  ) : (
                    placedItems.map((_, idx) => <span key={idx} className="text-2xl">🐠</span>)
                  )}
                </div>
              </div>
            )}

            {/* Standard "are you a human" footer controls */}
            <div className="bg-blue-800 text-white px-3 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 font-serif italic text-blue-200">
                <span>are you a</span> <span className="text-orange-300 font-bold">human</span>
              </div>
              <div className="flex gap-2">
                <button onClick={resetCaptcha} className="p-1 hover:bg-blue-700 rounded"><RefreshCw size={14} /></button>
                <button className="p-1 hover:bg-blue-700 rounded"><Volume2 size={14} /></button>
                <button className="p-1 hover:bg-blue-700 rounded"><HelpCircle size={14} /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
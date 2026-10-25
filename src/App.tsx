import { useState } from "react";
import { PhonePit } from "./components/PhonePit";
import { VolumeSlider } from "./components/VolumeSlider";
import { ScatteringPassword } from "./components/ScatteringPassword";
import { CaptchaHell } from "./components/CaptchaHell";
import { WaymoParking } from "./components/WaymoParking";
import { CompleteFace } from "./components/CompleteFace";
import { DoomCaptcha } from "./components/DoomCaptcha";
import { ChaosTaskbar } from "./components/ChaosTaskbar";
import { Monitor, CheckCircle2, Award, RotateCcw, ArrowRight, Lock } from "lucide-react";
import { sfx } from "./utils/soundEffects";
import { OceanSanctuary } from "./components/OceanSanctuary";

interface Stage {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
}

const STAGES: Stage[] = [
  {
    id: 1,
    title: "Level 1: Phone Pit",
    subtitle: "Submit Phone Number",
    desc: "Drag physical bouncing digits into the slot to submit your phone number.",
  },
  {
    id: 2,
    title: "Level 2: Gravity Volume",
    subtitle: "Adjust System Audio",
    desc: "Set volume to exactly 50% before gravity slams the knob back to 0%.",
  },
  {
    id: 3,
    title: "Level 3: Explosive Password",
    subtitle: "Enter Credentials",
    desc: "Type your secret password without disturbing the floating character particles.",
  },
  {
    id: 4,
    title: "Level 4: Captcha Hell",
    subtitle: "Human Verification",
    desc: "Verify your humanity by completing shifting tile prompts and catching the button.",
  },
  {
    id: 5,
    title: "Level 5: Waymo Parking",
    subtitle: "Autonomous Parking",
    desc: "Steer the autonomous vehicle safely into the open parking spot to complete verification.",
  },
  {
    id: 6,
    title: "Level 6: Complete the Face",
    subtitle: "Facial Assembly",
    desc: "Attach the eyes, nose, and mouth onto the outline to reconstruct the face.",
  },
  {
    id: 7,
    title: "Level 7: Doom CAPTCHA",
    subtitle: "Retro FPS Verification",
    desc: "Eliminate 3 invading demons with your crosshair to prove your reflexes.",
  },
  {
    id: 8,
    title: "Level 8: Ocean Sanctuary",
    subtitle: "Aquatic Verification",
    desc: "Guide the fish safely back into the ocean water.",
  },
  {
    id: 9,
    title: "Level 9: Feed the Baby",
    subtitle: "Nurturing Challenge",
    desc: "Guide the food spoon into the moving baby's target zone.",
  },
];

export default function App() {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const safePlaySfx = (freq: number) => {
    try {
      if (sfx && typeof sfx.playBouncePop === "function") {
        sfx.playBouncePop(freq);
      }
    } catch {
      // Audio fallback
    }
  };

  const handleStageSuccess = () => {
    safePlaySfx(800);
    if (!completedLevels.includes(currentLevel)) {
      setCompletedLevels((prev) => [...prev, currentLevel]);
    }
  };

  const handleNextLevel = () => {
    if (!completedLevels.includes(currentLevel)) return;

    safePlaySfx(600);
    if (currentLevel < STAGES.length) {
      setCurrentLevel((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    safePlaySfx(400);
    setCurrentLevel(1);
    setCompletedLevels([]);
    setIsCompleted(false);
  };

  const isCurrentLevelSolved = completedLevels.includes(currentLevel);
  const activeStage = STAGES.find((s) => s.id === currentLevel) || STAGES[0];

  return (
    <div className="w-screen h-screen bg-slate-950 text-white overflow-hidden relative flex flex-col select-none font-sans">
      <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
            <Monitor size={20} />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-wide text-white flex items-center gap-2">
              UNUSABLE OS <span className="text-[10px] bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">v1.0</span>
            </h1>
            <p className="text-[11px] text-gray-400 font-mono font-normal">The Bad UI Verification Challenge</p>
          </div>
        </div>

        {!isCompleted && (
          <div className="flex items-center gap-2 bg-gray-950 px-4 py-2 rounded-full border border-gray-800">
            {STAGES.map((stage) => {
              const isAccessible = stage.id === 1 || completedLevels.includes(stage.id - 1);
              const isSolved = completedLevels.includes(stage.id);

              return (
                <button
                  key={stage.id}
                  disabled={!isAccessible}
                  onClick={() => {
                    if (isAccessible) {
                      safePlaySfx(500);
                      setCurrentLevel(stage.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-all ${
                    currentLevel === stage.id
                      ? "bg-[#4285F4] text-white shadow-lg shadow-blue-500/30 scale-105"
                      : isSolved
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50 cursor-pointer"
                      : isAccessible
                      ? "text-gray-300 hover:text-white cursor-pointer"
                      : "text-gray-600 bg-gray-900/50 cursor-not-allowed opacity-40"
                  }`}
                >
                  {isSolved ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : isAccessible ? (
                    <span>Lvl {stage.id}</span>
                  ) : (
                    <Lock size={12} className="text-gray-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleRestart}
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <RotateCcw size={13} /> Restart Run
        </button>
      </header>

      <main className="flex-1 relative p-6 pb-20 flex flex-col items-center justify-center overflow-auto">
        {!isCompleted ? (
          <div className="w-full max-w-lg flex flex-col items-center gap-5">
            <div className="w-full bg-gray-900 border border-gray-800 p-4 rounded-xl text-center shadow-xl">
              <div className="inline-block bg-blue-500/10 text-blue-400 font-mono text-xs font-bold px-3 py-1 rounded-full mb-1.5 border border-blue-500/20">
                {activeStage.title}
              </div>
              <h3 className="text-base font-bold text-white mb-0.5">{activeStage.subtitle}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{activeStage.desc}</p>
            </div>

            <div className="w-full bg-slate-900 border border-gray-800 rounded-2xl p-6 shadow-2xl relative flex justify-center items-center">
              {currentLevel === 1 && <PhonePit onSuccess={handleStageSuccess} />}
              {currentLevel === 2 && <VolumeSlider onSuccess={handleStageSuccess} />}
              {currentLevel === 3 && <ScatteringPassword onSuccess={handleStageSuccess} />}
              {currentLevel === 4 && <CaptchaHell onSuccess={handleStageSuccess} />}
              {currentLevel === 5 && <WaymoParking onSuccess={handleStageSuccess} />}
              {currentLevel === 6 && <CompleteFace onSuccess={handleStageSuccess} />}
              {currentLevel === 7 && <DoomCaptcha onSuccess={handleStageSuccess} />}
              {currentLevel === 8 && (<OceanSanctuary onSuccess={handleStageSuccess} />)}
              
              {currentLevel === 9 && (
                <div className="text-center p-8 text-gray-400 font-mono text-xs">
                  [ Level 9: Feed the Baby Component coming next ]
                </div>
              )}
            </div>

            {currentLevel <= STAGES.length && (
              <button
                disabled={!isCurrentLevelSolved}
                onClick={handleNextLevel}
                className={`w-full py-3 font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                  isCurrentLevelSolved
                    ? "bg-[#4285F4] hover:bg-blue-600 text-white cursor-pointer shadow-blue-500/20 active:scale-98 animate-pulse"
                    : "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-50"
                }`}
              >
                {isCurrentLevelSolved ? (
                  <>
                    <span>Next Stage</span>
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Complete Level to Unlock</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl p-10 max-w-md text-center shadow-2xl flex flex-col items-center gap-4">
            <Award className="text-emerald-400 animate-bounce" size={60} />
            <h2 className="text-2xl font-black text-emerald-400">HUMANITY VERIFIED!</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              You conquered all 9 stages of physical bad UI puzzles!
            </p>
            <button
              onClick={handleRestart}
              className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} /> Play Again
            </button>
          </div>
        )}
      </main>

      <ChaosTaskbar onOpenApp={(appKey) => console.log("Taskbar clicked:", appKey)} />
    </div>
  );
}
import { PhonePit } from "./components/PhonePit";
import { VolumeSlider } from "./components/VolumeSlider";
import { ScatteringPassword } from "./components/ScatteringPassword";
import { DesktopWindow } from "./components/DesktopWindow";
import { Monitor, Phone, Volume2, KeyRound } from "lucide-react";

export default function App() {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-zinc-950 text-white overflow-hidden relative">
      {/* OS Top Navigation Bar */}
      <header className="h-10 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 flex items-center justify-between z-50 relative">
        <div className="flex items-center gap-2 font-extrabold text-blue-500 tracking-wider text-sm">
          <Monitor size={18} /> UnusableOS v1.0
        </div>
        <div className="text-xs font-mono text-gray-400">
          Hackatime Bad UI Suite • Tilt, Drag & Collect
        </div>
      </header>

      {/* Desktop Background & Windows */}
      <main className="w-full h-[calc(100vh-2.5rem)] relative p-6">
        <DesktopWindow title="Module 1: PhonePit.exe" initialX={40} initialY={30}>
          <PhonePit />
        </DesktopWindow>

        <DesktopWindow title="Module 2: GravityVolume.sys" initialX={720} initialY={30}>
          <VolumeSlider />
        </DesktopWindow>

        <DesktopWindow title="Module 3: PasswordScatter.dll" initialX={380} initialY={480}>
          <ScatteringPassword />
        </DesktopWindow>
      </main>
    </div>
  );
}
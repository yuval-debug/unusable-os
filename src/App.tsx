import { useState } from "react";
import { PhonePit } from "./components/PhonePit";
import { VolumeSlider } from "./components/VolumeSlider";
import { ScatteringPassword } from "./components/ScatteringPassword";
import { CaptchaHell } from "./components/CaptchaHell";
import { DesktopWindow } from "./components/DesktopWindow";
import { Monitor, Phone, Volume2, KeyRound, ShieldAlert, Layers } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"desktop" | "phone" | "volume" | "password" | "captcha">("desktop");

  return (
    <div className="w-screen h-screen bg-slate-950 text-white overflow-hidden relative flex flex-col">
      {/* OS Top Navigation Bar with Tabs */}
      <header className="h-12 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-2 font-bold text-blue-400 text-sm">
          <Monitor size={18} /> UnusableOS v1.0
        </div>

        {/* Tab Switcher */}
        <nav className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setActiveTab("desktop")}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "desktop" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers size={13} /> Full Desktop
          </button>
          <button
            onClick={() => setActiveTab("phone")}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "phone" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Phone size={13} /> 1. Phone Pit
          </button>
          <button
            onClick={() => setActiveTab("volume")}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "volume" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Volume2 size={13} /> 2. Gravity Volume
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "password" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <KeyRound size={13} /> 3. Password Scatter
          </button>
          <button
            onClick={() => setActiveTab("captcha")}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "captcha" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <ShieldAlert size={13} /> 4. Captcha Hell
          </button>
        </nav>

        <div className="text-xs text-gray-400 font-mono">Hackatime Bad UI Suite</div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 relative p-6 overflow-auto flex items-center justify-center">
        {activeTab === "desktop" && (
          <div className="w-full h-full relative">
            <DesktopWindow title="Module 1: PhonePit.exe" initialX={20} initialY={20}>
              <PhonePit />
            </DesktopWindow>
            <DesktopWindow title="Module 2: GravityVolume.sys" initialX={680} initialY={20}>
              <VolumeSlider />
            </DesktopWindow>
            <DesktopWindow title="Module 3: PasswordScatter.dll" initialX={20} initialY={440}>
              <ScatteringPassword />
            </DesktopWindow>
            <DesktopWindow title="Module 4: CaptchaSolver.exe" initialX={680} initialY={440}>
              <CaptchaHell />
            </DesktopWindow>
          </div>
        )}

        {activeTab === "phone" && <PhonePit />}
        {activeTab === "volume" && <VolumeSlider />}
        {activeTab === "password" && <ScatteringPassword />}
        {activeTab === "captcha" && <CaptchaHell />}
      </main>
    </div>
  );
}
import { PhonePit } from "./components/PhonePit";
import { VolumeSlider } from "./components/VolumeSlider";
import { ScatteringPassword } from "./components/ScatteringPassword";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-start gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-blue-500 my-4">
        UnusableOS — Bad UI Suite
      </h1>
      <PhonePit />
      <VolumeSlider />
      <ScatteringPassword />
    </div>
  );
}
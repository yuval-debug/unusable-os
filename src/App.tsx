import { PhonePit } from "./components/PhonePit";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-extrabold mb-6 tracking-tight text-blue-500">
        UnusableOS — Bad UI Suite
      </h1>
      <PhonePit />
    </div>
  );
}
import { Sprite } from "@/components/Sprite";

export const ReactorPanel = () => (
  <div className="p-4 bg-zinc-900 rounded-xl flex items-center gap-4">
    {/* Heater animation */}
    <Sprite src="/sprites/heater_sheet.png" frameW={32} frameH={32} />

    {/* Temp & fuel bar */}
    <div>
      <h3 className="text-teal-300 text-sm">Fusion Core Temp: 78 °C</h3>
      <div className="w-40 bg-zinc-800 h-2 rounded overflow-hidden">
        <div
          className="bg-teal-400 h-full"
          style={{ width: "68%" /* dummy value */ }}
        />
      </div>
    </div>
  </div>
);

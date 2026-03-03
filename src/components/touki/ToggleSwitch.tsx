"use client";

interface ToggleSwitchProps {
  mode: "all" | "current";
  onChange: (mode: "all" | "current") => void;
}

export default function ToggleSwitch({ mode, onChange }: ToggleSwitchProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-0.5">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
          mode === "all"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        全部事項
      </button>
      <button
        type="button"
        onClick={() => onChange("current")}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
          mode === "current"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        現在事項
      </button>
    </div>
  );
}

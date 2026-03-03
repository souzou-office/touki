"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface RiskBadgeProps {
  severity: "high" | "medium" | "low";
  message: string;
}

const config = {
  high: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    icon: AlertTriangle,
    label: "高",
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
    icon: AlertCircle,
    label: "中",
  },
  low: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
    icon: Info,
    label: "低",
  },
} as const;

export default function RiskBadge({ severity, message }: RiskBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { bg, text, border, icon: Icon, label } = config[severity];

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${bg} ${text} ${border}`}
      >
        <Icon className="h-3 w-3" />
        {label}
      </span>

      {showTooltip && (
        <span
          className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg"
          role="tooltip"
        >
          {message}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

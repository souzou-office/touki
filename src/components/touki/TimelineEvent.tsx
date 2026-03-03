"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TimelineEventProps {
  date: string;
  purpose: string;
  details: string;
  type: "kou" | "otsu";
  isActive: boolean;
  onClick?: () => void;
}

export default function TimelineEvent({
  date,
  purpose,
  details,
  type,
  isActive,
  onClick,
}: TimelineEventProps) {
  const [expanded, setExpanded] = useState(false);

  const dotColor = type === "kou" ? "bg-blue-500" : "bg-orange-500";
  const lineColor = type === "kou" ? "bg-blue-200" : "bg-orange-200";
  const labelBg = type === "kou" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700";
  const inactiveClass = !isActive ? "opacity-50" : "";

  function handleClick() {
    setExpanded(!expanded);
    onClick?.();
  }

  return (
    <div className={`relative flex gap-4 pb-6 ${inactiveClass}`}>
      {/* Vertical line */}
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full ${dotColor} ring-4 ring-white shrink-0 mt-1`} />
        <div className={`w-0.5 flex-1 ${lineColor}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-2">
        <button
          type="button"
          onClick={handleClick}
          className="flex w-full items-start gap-2 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500">{date}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${labelBg}`}>
                {type === "kou" ? "甲区" : "乙区"}
              </span>
              {!isActive && (
                <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                  抹消済
                </span>
              )}
            </div>
            <p className={`mt-1 text-sm font-medium text-gray-900 ${!isActive ? "line-through" : ""}`}>
              {purpose}
            </p>
          </div>
          <span className="mt-1 shrink-0 text-gray-400">
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        </button>

        {expanded && (
          <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 whitespace-pre-wrap">
            {details}
          </div>
        )}
      </div>
    </div>
  );
}

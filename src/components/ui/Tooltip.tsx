"use client";

import { useState, type ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

const positionStyles: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowStyles: Record<string, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent border-4",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent border-4",
  left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent border-4",
  right: "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent border-4",
};

export default function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 ${positionStyles[position]} pointer-events-none`}
          role="tooltip"
        >
          <div className="relative bg-gray-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg">
            {content}
            <span className={`absolute w-0 h-0 ${arrowStyles[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
}

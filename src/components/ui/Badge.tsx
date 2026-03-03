import { type ReactNode } from "react";

type BadgeVariant = "red" | "yellow" | "green" | "blue" | "gray";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  red: "bg-red-50 text-red-700 ring-red-600/20",
  yellow: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  green: "bg-green-50 text-green-700 ring-green-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  gray: "bg-gray-50 text-gray-700 ring-gray-600/20",
};

export default function Badge({
  variant = "gray",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

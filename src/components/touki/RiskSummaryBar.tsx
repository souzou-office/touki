import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface RiskSummaryBarProps {
  high: number;
  medium: number;
  low: number;
}

export default function RiskSummaryBar({
  high,
  medium,
  low,
}: RiskSummaryBarProps) {
  const total = high + medium + low;

  if (total === 0) {
    return (
      <div className="flex items-center gap-1.5 rounded-md bg-gray-50 px-3 py-1.5 text-xs text-gray-500">
        <Info className="h-3.5 w-3.5" />
        リスク検出なし
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-1.5">
      {high > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          {high}
        </span>
      )}
      {medium > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700">
          <AlertCircle className="h-3.5 w-3.5" />
          {medium}
        </span>
      )}
      {low > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
          <Info className="h-3.5 w-3.5" />
          {low}
        </span>
      )}
    </div>
  );
}

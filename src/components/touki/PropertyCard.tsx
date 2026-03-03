"use client";

import { MapPin, Ruler, Hash, Building2, LandPlot, Building } from "lucide-react";
import type { ToukiData } from "@/types/touki";
import RiskSummaryBar from "./RiskSummaryBar";

interface PropertyCardProps {
  property: ToukiData["property"];
  riskSummary: { high: number; medium: number; low: number };
  onClick?: () => void;
}

const typeLabels: Record<ToukiData["property"]["type"], string> = {
  land: "土地",
  building: "建物",
  condominium: "マンション",
};

const typeIcons: Record<
  ToukiData["property"]["type"],
  typeof LandPlot
> = {
  land: LandPlot,
  building: Building2,
  condominium: Building,
};

export default function PropertyCard({
  property,
  riskSummary,
  onClick,
}: PropertyCardProps) {
  const TypeIcon = typeIcons[property.type];
  const typeLabel = typeLabels[property.type];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">
            <TypeIcon className="h-4 w-4" />
            {typeLabel}
          </span>
        </div>
        <RiskSummaryBar
          high={riskSummary.high}
          medium={riskSummary.medium}
          low={riskSummary.low}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <span className="font-medium">{property.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Hash className="h-4 w-4 shrink-0 text-gray-400" />
          <span>{property.number}</span>
        </div>

        {property.area && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Ruler className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{property.area}</span>
          </div>
        )}

        {property.structure && (
          <div className="mt-1 text-xs text-gray-500">
            構造: {property.structure}
          </div>
        )}

        {property.floorAreas && property.floorAreas.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {property.floorAreas.map((fa, i) => (
              <div key={i} className="text-xs text-gray-500">
                {fa.floor}: {fa.area}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
        クリックして詳細を表示
      </div>
    </div>
  );
}

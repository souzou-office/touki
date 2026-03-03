"use client";

import {
  MapPin,
  User,
  Landmark,
  Building2,
  LandPlot,
  Building,
} from "lucide-react";
import type { ToukiData, KouEntry, OtsuEntry } from "@/types/touki";

interface CompareColumnProps {
  data: ToukiData;
}

const typeLabels: Record<ToukiData["property"]["type"], string> = {
  land: "土地",
  building: "建物",
  condominium: "マンション",
};

const typeIcons: Record<ToukiData["property"]["type"], typeof LandPlot> = {
  land: LandPlot,
  building: Building2,
  condominium: Building,
};

function getCurrentOwner(kouSection: KouEntry[]): KouEntry["rightHolder"] {
  const active = kouSection.filter(
    (e) => e.isActive && !e.strikethrough && e.purpose.includes("所有権")
  );
  if (active.length === 0) return [];
  return active[active.length - 1].rightHolder;
}

function getActiveMortgages(otsuSection: OtsuEntry[]): OtsuEntry[] {
  return otsuSection.filter((e) => e.isActive && !e.strikethrough);
}

export default function CompareColumn({ data }: CompareColumnProps) {
  const { property } = data;
  const TypeIcon = typeIcons[property.type];
  const owners = getCurrentOwner(data.kouSection);
  const mortgages = getActiveMortgages(data.otsuSection);

  return (
    <div className="flex min-w-[260px] flex-col rounded-lg border border-gray-200 bg-white">
      {/* Property header */}
      <div className="border-b border-gray-100 p-4">
        <div className="mb-2 flex items-center gap-2">
          <TypeIcon className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">
            {typeLabels[property.type]}
          </span>
        </div>
        <div className="flex items-start gap-1.5 text-sm text-gray-700">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="leading-tight">{property.location}</span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {property.number}
          {property.area && ` / ${property.area}`}
        </div>
      </div>

      {/* Current owner */}
      <div className="border-b border-gray-100 p-4">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <User className="h-3.5 w-3.5" />
          所有者
        </h4>
        {owners.length === 0 ? (
          <p className="text-xs text-gray-400">不明</p>
        ) : (
          <div className="space-y-1.5">
            {owners.map((owner, i) => (
              <div key={i} className="text-sm">
                <div className="font-medium text-gray-800">{owner.name}</div>
                <div className="text-xs text-gray-500">{owner.address}</div>
                {owner.share && (
                  <div className="text-xs text-gray-400">
                    持分: {owner.share}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active mortgages */}
      <div className="p-4">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Landmark className="h-3.5 w-3.5" />
          担保権 ({mortgages.length})
        </h4>
        {mortgages.length === 0 ? (
          <p className="text-xs text-gray-400">設定なし</p>
        ) : (
          <div className="space-y-2">
            {mortgages.map((m, i) => (
              <div
                key={i}
                className="rounded-md bg-orange-50 px-3 py-2 text-xs"
              >
                <div className="font-medium text-gray-800">{m.rightType}</div>
                <div className="mt-0.5 text-gray-600">
                  {m.rightHolder.name}
                </div>
                {(m.debtAmount || m.maxAmount) && (
                  <div className="mt-0.5 text-gray-500">
                    {m.debtAmount
                      ? `債権額: ${m.debtAmount}`
                      : `極度額: ${m.maxAmount}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

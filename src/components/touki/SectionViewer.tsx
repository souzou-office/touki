"use client";

import { ShieldCheck, Landmark } from "lucide-react";
import type { KouEntry, OtsuEntry } from "@/types/touki";
import EntryCard from "./EntryCard";

interface SectionViewerProps {
  title: string;
  entries: KouEntry[] | OtsuEntry[];
  type: "kou" | "otsu";
  showInactive: boolean;
}

export default function SectionViewer({
  title,
  entries,
  type,
  showInactive,
}: SectionViewerProps) {
  const Icon = type === "kou" ? ShieldCheck : Landmark;
  const accentColor = type === "kou" ? "text-blue-600" : "text-orange-600";
  const bgColor = type === "kou" ? "bg-blue-50" : "bg-orange-50";

  const visibleEntries = showInactive
    ? entries
    : entries.filter((e) => e.isActive);

  return (
    <section>
      <div className={`mb-4 flex items-center gap-2 rounded-lg ${bgColor} px-4 py-2.5`}>
        <Icon className={`h-5 w-5 ${accentColor}`} />
        <h2 className={`text-base font-bold ${accentColor}`}>{title}</h2>
        <span className="ml-auto text-xs text-gray-500">
          {visibleEntries.length} / {entries.length} 件
        </span>
      </div>

      {visibleEntries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
          表示する登記事項がありません
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <EntryCard
              key={`${type}-${entry.rankNumber}-${index}`}
              entry={entry}
              type={type}
              showInactive={showInactive}
            />
          ))}
        </div>
      )}
    </section>
  );
}

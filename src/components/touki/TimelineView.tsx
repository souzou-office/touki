"use client";

import { useState, useMemo } from "react";
import { Clock } from "lucide-react";
import type { ToukiData, KouEntry, OtsuEntry } from "@/types/touki";
import TimelineEvent from "./TimelineEvent";

type TimelineMode = "all" | "kou" | "otsu" | "entry";

interface TimelineViewProps {
  data: ToukiData;
  mode?: TimelineMode;
}

interface TimelineItem {
  date: string;
  sortDate: string;
  purpose: string;
  details: string;
  type: "kou" | "otsu";
  isActive: boolean;
  rankNumber: number;
  receptionNumber: string;
}

function buildKouDetails(entry: KouEntry): string {
  const lines: string[] = [];
  lines.push(`原因: ${entry.causeDate} ${entry.cause}`);
  entry.rightHolder.forEach((rh) => {
    lines.push(`権利者: ${rh.name}`);
    lines.push(`  住所: ${rh.address}`);
    if (rh.share) lines.push(`  持分: ${rh.share}`);
  });
  return lines.join("\n");
}

function buildOtsuDetails(entry: OtsuEntry): string {
  const lines: string[] = [];
  lines.push(`権利の種類: ${entry.rightType}`);
  lines.push(`原因: ${entry.cause}`);
  if (entry.debtAmount) lines.push(`債権額: ${entry.debtAmount}`);
  if (entry.maxAmount) lines.push(`極度額: ${entry.maxAmount}`);
  if (entry.interestRate) lines.push(`利率: ${entry.interestRate}`);
  if (entry.debtor) {
    lines.push(`債務者: ${entry.debtor.name}`);
    lines.push(`  住所: ${entry.debtor.address}`);
  }
  lines.push(`権利者: ${entry.rightHolder.name}`);
  lines.push(`  住所: ${entry.rightHolder.address}`);
  return lines.join("\n");
}

/**
 * Parse a reception date string into a sortable ISO-like string.
 * Handles formats like "令和5年3月15日" or "2023-03-15".
 */
function parseSortDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr;

  const eraMap: Record<string, number> = {
    "令和": 2019,
    "平成": 1989,
    "昭和": 1926,
    "大正": 1912,
    "明治": 1868,
  };

  const match = dateStr.match(
    /([令平昭大明][和成治正治])(\d{1,2}|元)年(\d{1,2})月(\d{1,2})日/
  );
  if (match) {
    const [, era, yearStr, month, day] = match;
    const year = yearStr === "元" ? 1 : parseInt(yearStr);
    const base = eraMap[era];
    if (base) {
      const westernYear = base + year - 1;
      return `${westernYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  return dateStr;
}

const modeLabels: Record<TimelineMode, string> = {
  all: "全て",
  entry: "受付順",
  kou: "甲区のみ",
  otsu: "乙区のみ",
};

export default function TimelineView({
  data,
  mode: initialMode = "all",
}: TimelineViewProps) {
  const [mode, setMode] = useState<TimelineMode>(initialMode);

  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    if (mode !== "otsu") {
      data.kouSection.forEach((entry) => {
        items.push({
          date: entry.receptionDate,
          sortDate: parseSortDate(entry.receptionDate),
          purpose: entry.purpose,
          details: buildKouDetails(entry),
          type: "kou",
          isActive: entry.isActive,
          rankNumber: entry.rankNumber,
          receptionNumber: entry.receptionNumber,
        });
      });
    }

    if (mode !== "kou") {
      data.otsuSection.forEach((entry) => {
        items.push({
          date: entry.receptionDate,
          sortDate: parseSortDate(entry.receptionDate),
          purpose: entry.purpose,
          details: buildOtsuDetails(entry),
          type: "otsu",
          isActive: entry.isActive,
          rankNumber: entry.rankNumber,
          receptionNumber: entry.receptionNumber,
        });
      });
    }

    // Sort chronologically; for "entry" mode, use reception number as tiebreaker
    items.sort((a, b) => {
      const dateCompare = a.sortDate.localeCompare(b.sortDate);
      if (dateCompare !== 0) return dateCompare;
      if (mode === "entry") {
        return a.receptionNumber.localeCompare(b.receptionNumber);
      }
      return 0;
    });

    return items;
  }, [data, mode]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <h2 className="text-base font-bold text-gray-900">タイムライン</h2>
        </div>

        <div className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-0.5">
          {(Object.keys(modeLabels) as TimelineMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                mode === m
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {timelineItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
          表示する登記事項がありません
        </div>
      ) : (
        <div className="pl-1">
          {timelineItems.map((item, index) => (
            <TimelineEvent
              key={`${item.type}-${item.rankNumber}-${index}`}
              date={item.date}
              purpose={item.purpose}
              details={item.details}
              type={item.type}
              isActive={item.isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, User, Calendar, FileText } from "lucide-react";
import type { KouEntry, OtsuEntry } from "@/types/touki";
import RiskBadge from "./RiskBadge";

interface EntryCardProps {
  entry: KouEntry | OtsuEntry;
  type: "kou" | "otsu";
  showInactive: boolean;
}

function isOtsuEntry(
  entry: KouEntry | OtsuEntry,
  type: "kou" | "otsu"
): entry is OtsuEntry {
  return type === "otsu";
}

export default function EntryCard({
  entry,
  type,
  showInactive,
}: EntryCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!entry.isActive && !showInactive) {
    return null;
  }

  const inactiveStyle = entry.strikethrough
    ? "line-through text-gray-400"
    : "";
  const cardBg = entry.strikethrough ? "bg-gray-50" : "bg-white";
  const borderColor =
    type === "kou" ? "border-l-blue-500" : "border-l-orange-500";

  return (
    <div
      className={`rounded-lg border border-gray-200 border-l-4 ${borderColor} ${cardBg} shadow-sm transition-shadow hover:shadow-md`}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span className="mt-0.5 shrink-0 text-gray-400">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center justify-center rounded bg-gray-100 px-2 py-0.5 text-xs font-mono font-semibold text-gray-700">
              {entry.rankNumber}
            </span>
            <span className={`text-sm font-medium text-gray-900 ${inactiveStyle}`}>
              {entry.purpose}
            </span>
            {!entry.isActive && (
              <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                抹消済
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {entry.receptionDate}
            </span>
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3 w-3" />
              第{entry.receptionNumber}号
            </span>
          </div>

          <div className={`mt-1.5 text-xs text-gray-600 ${inactiveStyle}`}>
            {type === "kou" ? (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3 text-gray-400" />
                {(entry as KouEntry).rightHolder
                  .map((rh) => rh.name)
                  .join("、")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3 text-gray-400" />
                {(entry as OtsuEntry).rightHolder.name}
              </span>
            )}
          </div>

          {isOtsuEntry(entry, type) && entry.debtAmount && (
            <div className={`mt-1 text-xs font-medium text-gray-700 ${inactiveStyle}`}>
              債権額: {entry.debtAmount}
            </div>
          )}

          {isOtsuEntry(entry, type) && entry.riskFlags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {entry.riskFlags.map((flag, i) => (
                <RiskBadge
                  key={i}
                  severity={flag.severity}
                  message={flag.message}
                />
              ))}
            </div>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <dl className="space-y-2 text-sm">
            <div className="grid grid-cols-[6rem_1fr] gap-2">
              <dt className="text-gray-500">登記原因</dt>
              <dd className={`text-gray-700 ${inactiveStyle}`}>
                {"causeDate" in entry && entry.causeDate ? `${entry.causeDate} ` : ""}
                {entry.cause}
              </dd>
            </div>

            {type === "kou" && (
              <div className="grid grid-cols-[6rem_1fr] gap-2">
                <dt className="text-gray-500">権利者</dt>
                <dd className={`space-y-1 ${inactiveStyle}`}>
                  {(entry as KouEntry).rightHolder.map((rh, i) => (
                    <div key={i} className="text-gray-700">
                      <div className="font-medium">{rh.name}</div>
                      <div className="text-xs text-gray-500">{rh.address}</div>
                      {rh.share && (
                        <div className="text-xs text-gray-500">
                          持分: {rh.share}
                        </div>
                      )}
                    </div>
                  ))}
                </dd>
              </div>
            )}

            {isOtsuEntry(entry, type) && (
              <>
                <div className="grid grid-cols-[6rem_1fr] gap-2">
                  <dt className="text-gray-500">権利の種類</dt>
                  <dd className={`text-gray-700 ${inactiveStyle}`}>
                    {entry.rightType}
                  </dd>
                </div>

                {entry.debtAmount && (
                  <div className="grid grid-cols-[6rem_1fr] gap-2">
                    <dt className="text-gray-500">債権額</dt>
                    <dd className={`text-gray-700 ${inactiveStyle}`}>
                      {entry.debtAmount}
                    </dd>
                  </div>
                )}

                {entry.maxAmount && (
                  <div className="grid grid-cols-[6rem_1fr] gap-2">
                    <dt className="text-gray-500">極度額</dt>
                    <dd className={`text-gray-700 ${inactiveStyle}`}>
                      {entry.maxAmount}
                    </dd>
                  </div>
                )}

                {entry.interestRate && (
                  <div className="grid grid-cols-[6rem_1fr] gap-2">
                    <dt className="text-gray-500">利率</dt>
                    <dd className={`text-gray-700 ${inactiveStyle}`}>
                      {entry.interestRate}
                    </dd>
                  </div>
                )}

                {entry.damageRate && (
                  <div className="grid grid-cols-[6rem_1fr] gap-2">
                    <dt className="text-gray-500">損害金</dt>
                    <dd className={`text-gray-700 ${inactiveStyle}`}>
                      {entry.damageRate}
                    </dd>
                  </div>
                )}

                {entry.debtor && (
                  <div className="grid grid-cols-[6rem_1fr] gap-2">
                    <dt className="text-gray-500">債務者</dt>
                    <dd className={`text-gray-700 ${inactiveStyle}`}>
                      <div className="font-medium">{entry.debtor.name}</div>
                      <div className="text-xs text-gray-500">
                        {entry.debtor.address}
                      </div>
                    </dd>
                  </div>
                )}

                <div className="grid grid-cols-[6rem_1fr] gap-2">
                  <dt className="text-gray-500">権利者</dt>
                  <dd className={`text-gray-700 ${inactiveStyle}`}>
                    <div className="font-medium">
                      {entry.rightHolder.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.rightHolder.address}
                    </div>
                  </dd>
                </div>

                {entry.jointMortgageRef && (
                  <div className="grid grid-cols-[6rem_1fr] gap-2">
                    <dt className="text-gray-500">共同担保</dt>
                    <dd className="text-gray-700">
                      目録 ({entry.jointMortgageRef})
                    </dd>
                  </div>
                )}
              </>
            )}

            {entry.subEntries && entry.subEntries.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  付記
                </h4>
                <div className="space-y-2">
                  {entry.subEntries.map((sub, i) => (
                    <div
                      key={i}
                      className="rounded-md bg-gray-50 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-mono font-medium">
                          {sub.subNumber}
                        </span>
                        <span className="font-medium">{sub.purpose}</span>
                      </div>
                      <div className="mt-1 text-gray-500">
                        {sub.receptionDate} 第{sub.receptionNumber}号
                      </div>
                      <div className="mt-1 text-gray-600">{sub.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

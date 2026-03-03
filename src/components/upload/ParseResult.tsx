"use client";

import { useState } from "react";
import {
  Save,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  FileText,
  Users,
  ShieldAlert,
} from "lucide-react";
import type { ToukiData } from "@/types/touki";

interface ParseResultProps {
  data: ToukiData;
  warnings: string[];
  onSave: () => void;
  onRetry: () => void;
}

function propertyTypeLabel(type: ToukiData["property"]["type"]): string {
  switch (type) {
    case "land":
      return "土地";
    case "building":
      return "建物";
    case "condominium":
      return "区分建物";
    default:
      return type;
  }
}

function confidenceColor(score: number): string {
  if (score >= 0.8) return "bg-green-500";
  if (score >= 0.6) return "bg-yellow-500";
  return "bg-red-500";
}

function confidenceLabel(score: number): string {
  if (score >= 0.8) return "高";
  if (score >= 0.6) return "中";
  return "低";
}

function confidenceTextColor(score: number): string {
  if (score >= 0.8) return "text-green-700";
  if (score >= 0.6) return "text-yellow-700";
  return "text-red-700";
}

function confidenceBgColor(score: number): string {
  if (score >= 0.8) return "bg-green-50";
  if (score >= 0.6) return "bg-yellow-50";
  return "bg-red-50";
}

export default function ParseResult({
  data,
  warnings,
  onSave,
  onRetry,
}: ParseResultProps) {
  const [showRawJson, setShowRawJson] = useState(false);

  const { property, meta, kouSection, otsuSection } = data;
  const confidence = meta.parseConfidence;

  const activeOwners = kouSection
    .filter((entry) => entry.isActive && entry.purpose.includes("所有権"))
    .flatMap((entry) => entry.rightHolder);

  const activeMortgages = otsuSection.filter((entry) => entry.isActive);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Property info summary card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">物件情報</h3>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Property type */}
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">種別</p>
              <p className="text-sm font-medium text-gray-900">
                {propertyTypeLabel(property.type)}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">所在</p>
              <p className="text-sm font-medium text-gray-900">
                {property.location}
              </p>
            </div>
          </div>

          {/* Property number */}
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">地番 / 家屋番号</p>
              <p className="text-sm font-medium text-gray-900">
                {property.number}
              </p>
            </div>
          </div>

          {/* Area (if land) */}
          {property.area && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">地積 / 面積</p>
                <p className="text-sm font-medium text-gray-900">
                  {property.area}
                </p>
              </div>
            </div>
          )}

          {/* Land category */}
          {property.landCategory && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">地目</p>
                <p className="text-sm font-medium text-gray-900">
                  {property.landCategory}
                </p>
              </div>
            </div>
          )}

          {/* Structure (if building) */}
          {property.structure && (
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">構造</p>
                <p className="text-sm font-medium text-gray-900">
                  {property.structure}
                </p>
              </div>
            </div>
          )}

          {/* Floor areas */}
          {property.floorAreas && property.floorAreas.length > 0 && (
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">床面積</p>
                <div className="space-y-0.5">
                  {property.floorAreas.map((fa, i) => (
                    <p key={i} className="text-sm font-medium text-gray-900">
                      {fa.floor}: {fa.area}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Owners summary */}
          {activeOwners.length > 0 && (
            <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
              <Users className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">現所有者</p>
                <div className="space-y-1">
                  {activeOwners.map((owner, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-gray-900">
                        {owner.name}
                        {owner.share && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({owner.share})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{owner.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mortgages summary */}
          {activeMortgages.length > 0 && (
            <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
              <ShieldAlert className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">
                  有効な乙区登記 ({activeMortgages.length}件)
                </p>
                <div className="space-y-1">
                  {activeMortgages.slice(0, 3).map((entry, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      {entry.rankNumber}番 {entry.purpose}
                      {entry.debtAmount && ` - ${entry.debtAmount}`}
                      {entry.maxAmount && ` - 極度額${entry.maxAmount}`}
                    </p>
                  ))}
                  {activeMortgages.length > 3 && (
                    <p className="text-xs text-gray-500">
                      ...他{activeMortgages.length - 3}件
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confidence score bar */}
      <div className={`rounded-xl border p-4 ${confidenceBgColor(confidence)} border-gray-200`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            解析信頼度
          </span>
          <span className={`text-sm font-semibold ${confidenceTextColor(confidence)}`}>
            {confidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${confidenceColor(confidence)}`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Warning messages */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-yellow-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <h4 className="text-sm font-semibold text-yellow-800">
              注意事項 ({warnings.length}件)
            </h4>
          </div>
          <ul className="px-4 py-3 space-y-2">
            {warnings.map((warning, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                <p className="text-sm text-yellow-800">{warning}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          className="
            flex-1 inline-flex items-center justify-center gap-2
            px-5 py-2.5 text-sm font-medium rounded-lg
            bg-blue-600 text-white hover:bg-blue-700
            transition-colors cursor-pointer
          "
        >
          <Save className="w-4 h-4" />
          保存する
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="
            inline-flex items-center justify-center gap-2
            px-5 py-2.5 text-sm font-medium rounded-lg
            bg-white text-gray-700 border border-gray-300
            hover:bg-gray-50 transition-colors cursor-pointer
          "
        >
          <RefreshCw className="w-4 h-4" />
          再解析
        </button>
      </div>

      {/* Collapsible raw JSON section */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRawJson((prev) => !prev)}
          className="
            w-full flex items-center justify-between
            px-5 py-3 text-sm font-medium text-gray-600
            hover:bg-gray-50 transition-colors cursor-pointer
          "
        >
          <span>解析結果 (JSON)</span>
          {showRawJson ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {showRawJson && (
          <div className="px-5 pb-4 border-t border-gray-100">
            <pre className="mt-3 p-4 bg-gray-50 rounded-lg text-xs text-gray-700 overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import ToggleSwitch from "@/components/touki/ToggleSwitch";
import SectionViewer from "@/components/touki/SectionViewer";
import RiskSummaryBar from "@/components/touki/RiskSummaryBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import type { ToukiData } from "@/types/touki";
import type { StoredProperty } from "@/lib/store";
import {
  ArrowLeft,
  MapPin,
  Hash,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  land: "土地",
  building: "建物",
  condominium: "区分建物",
};

function PropertySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
      <div className="h-12 bg-gray-200 rounded-lg" />
      <div className="h-40 bg-gray-200 rounded-xl" />
      <div className="h-64 bg-gray-200 rounded-xl" />
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  );
}

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [property, setProperty] = useState<StoredProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [viewMode, setViewMode] = useState<"all" | "current">("current");
  const [activeTab, setActiveTab] = useState("detail");

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("物件が見つかりません");
        return res.json();
      })
      .then((data) => setProperty(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PropertySkeleton />
        </main>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ダッシュボード
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            エラーが発生しました
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {error ?? "物件が見つかりません"}
          </p>
          <Link href="/dashboard">
            <Button variant="secondary">ダッシュボードに戻る</Button>
          </Link>
        </main>
      </div>
    );
  }

  const data: ToukiData = property.parsedData;
  const typeLabel = PROPERTY_TYPE_LABELS[data.property.type] ?? data.property.type;

  // Calculate risk summary
  const riskSummary = { high: 0, medium: 0, low: 0 };
  for (const entry of data.otsuSection) {
    for (const flag of entry.riskFlags) {
      riskSummary[flag.severity]++;
    }
  }
  const totalRisks = riskSummary.high + riskSummary.medium + riskSummary.low;

  const showInactive = viewMode === "all";

  const handleTabChange = (tabId: string) => {
    if (tabId === "timeline") {
      window.location.href = `/property/${id}/timeline`;
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ダッシュボード
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <span className="text-sm font-medium text-gray-900 truncate">
            {property.name}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Property Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700 mb-2">
              {typeLabel}
            </span>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              {data.property.location}
            </h1>
            <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              {data.property.number}
            </p>
          </div>
          <ToggleSwitch mode={viewMode} onChange={setViewMode} />
        </div>

        {/* Risk Summary */}
        {totalRisks > 0 && (
          <RiskSummaryBar
            high={riskSummary.high}
            medium={riskSummary.medium}
            low={riskSummary.low}
          />
        )}

        {/* Tab Navigation */}
        <Tabs
          tabs={[
            { id: "detail", label: "登記詳細" },
            { id: "timeline", label: "タイムライン" },
            { id: "checklist", label: "チェックリスト" },
          ]}
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        {/* Detail Tab */}
        {activeTab === "detail" && (
          <div className="space-y-6">
            {/* 表題部 */}
            <Card title="表題部">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">所在:</span>
                  <span className="ml-2 font-medium">{data.property.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">
                    {data.property.type === "land" ? "地番:" : "家屋番号:"}
                  </span>
                  <span className="ml-2 font-medium">{data.property.number}</span>
                </div>
                {data.property.landCategory && (
                  <div>
                    <span className="text-gray-500">地目:</span>
                    <span className="ml-2 font-medium">
                      {data.property.landCategory}
                    </span>
                  </div>
                )}
                {data.property.area && (
                  <div>
                    <span className="text-gray-500">
                      {data.property.type === "land" ? "地積:" : "床面積:"}
                    </span>
                    <span className="ml-2 font-medium">{data.property.area}</span>
                  </div>
                )}
                {data.property.structure && (
                  <div>
                    <span className="text-gray-500">構造:</span>
                    <span className="ml-2 font-medium">{data.property.structure}</span>
                  </div>
                )}
                {data.property.buildingType && (
                  <div>
                    <span className="text-gray-500">種類:</span>
                    <span className="ml-2 font-medium">
                      {data.property.buildingType}
                    </span>
                  </div>
                )}
              </div>
              {data.property.floorAreas && data.property.floorAreas.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-gray-500 text-sm">各階床面積:</span>
                  <div className="flex gap-4 mt-1">
                    {data.property.floorAreas.map((fa, i) => (
                      <span key={i} className="text-sm">
                        {fa.floor}: {fa.area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* 甲区 */}
            <SectionViewer
              title="甲区（所有権に関する事項）"
              entries={data.kouSection}
              type="kou"
              showInactive={showInactive}
            />

            {/* 乙区 */}
            {data.otsuSection.length > 0 && (
              <SectionViewer
                title="乙区（所有権以外の権利に関する事項）"
                entries={data.otsuSection}
                type="otsu"
                showInactive={showInactive}
              />
            )}

            {/* 共同担保目録 */}
            {data.jointMortgageRegisters.length > 0 && (
              <Card title="共同担保目録">
                {data.jointMortgageRegisters.map((reg) => (
                  <div key={reg.registerNumber} className="mb-4 last:mb-0">
                    <h4 className="font-medium text-sm mb-2">
                      {reg.registerNumber}
                    </h4>
                    <ul className="space-y-1">
                      {reg.properties.map((p, i) => (
                        <li key={i} className="text-sm text-gray-600">
                          {p.location} {p.number} - {p.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === "checklist" && (
          <Card title="チェックリスト">
            <div className="space-y-3">
              {[
                {
                  label: "所有者の確認",
                  checked: data.kouSection.some((e) => e.isActive),
                },
                {
                  label: "抵当権の有無の確認",
                  checked: data.otsuSection.some(
                    (e) => e.isActive && e.rightType?.includes("抵当")
                  ),
                },
                {
                  label: "差押・仮処分の確認",
                  checked: data.otsuSection.some((e) =>
                    e.riskFlags.some((r) => r.type === "seizure")
                  ),
                },
                {
                  label: "住所変更の確認",
                  checked: data.otsuSection.some((e) =>
                    e.riskFlags.some((r) => r.type === "address_change")
                  ),
                },
                {
                  label: "共同担保の確認",
                  checked: data.jointMortgageRegisters.length > 0,
                },
                {
                  label: "相続登記の確認",
                  checked: data.otsuSection.some((e) =>
                    e.riskFlags.some((r) => r.type === "inheritance")
                  ),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50"
                >
                  <CheckSquare
                    className={`w-5 h-5 shrink-0 ${
                      item.checked ? "text-blue-600" : "text-gray-300"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      item.checked
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.checked && (
                    <span className="ml-auto text-xs text-green-600 font-medium">
                      確認済み
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

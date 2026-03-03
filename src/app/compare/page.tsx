"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CompareView from "@/components/touki/CompareView";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { ToukiData } from "@/types/touki";
import type { PropertyListItem } from "@/types/api";
import {
  GitCompareArrows,
  ArrowLeft,
  Loader2,
  Building2,
  AlertTriangle,
} from "lucide-react";

interface PropertyWithData {
  id: string;
  name: string;
  parsedData: ToukiData;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  land: "土地",
  building: "建物",
  condominium: "区分建物",
};

function CompareSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-48" />
      <div className="h-4 bg-gray-200 rounded w-64" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedData, setSelectedData] = useState<ToukiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => {
        if (!res.ok) throw new Error("物件一覧の取得に失敗しました");
        return res.json();
      })
      .then((data) => setProperties(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    // Clear previous comparison results when selection changes
    setSelectedData([]);
  };

  const handleCompare = async () => {
    setComparing(true);
    setError(undefined);
    try {
      const results: ToukiData[] = [];
      for (const id of selectedIds) {
        const res = await fetch(`/api/properties/${id}`);
        if (!res.ok) throw new Error("物件データの取得に失敗しました");
        const prop: PropertyWithData = await res.json();
        results.push(prop.parsedData);
      }
      setSelectedData(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "比較中にエラーが発生しました"
      );
      setSelectedData([]);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ダッシュボード
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <h1 className="text-base font-semibold text-gray-900">
            横断比較
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitCompareArrows className="w-6 h-6 text-blue-600" />
            横断比較ビューアー
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            複数の物件を選択して、登記情報を横断的に比較します。
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && <CompareSkeleton />}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              比較する物件がありません
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              先に登記情報をアップロードしてください。
            </p>
            <Link href="/upload">
              <Button>アップロードする</Button>
            </Link>
          </div>
        )}

        {/* Property Selection */}
        {!loading && properties.length > 0 && (
          <>
            <Card title="物件を選択">
              <div className="space-y-1">
                {properties.map((prop) => {
                  const isSelected = selectedIds.has(prop.id);
                  return (
                    <label
                      key={prop.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(prop.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {prop.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {PROPERTY_TYPE_LABELS[prop.propertyType] ??
                            prop.propertyType}
                          <span className="text-gray-300 mx-1.5">|</span>
                          解析精度: {Math.round(prop.parseConfidence * 100)}%
                          <span className="text-gray-300 mx-1.5">|</span>
                          {new Date(prop.createdAt).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                      {(prop.riskSummary.high > 0 ||
                        prop.riskSummary.medium > 0) && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {prop.riskSummary.high > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                              高{prop.riskSummary.high}
                            </span>
                          )}
                          {prop.riskSummary.medium > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">
                              中{prop.riskSummary.medium}
                            </span>
                          )}
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  {selectedIds.size < 2 && (
                    <p className="text-xs text-gray-400">
                      2件以上の物件を選択してください
                    </p>
                  )}
                  {selectedIds.size >= 2 && (
                    <p className="text-xs text-blue-600 font-medium">
                      {selectedIds.size}件の物件を選択中
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleCompare}
                  disabled={selectedIds.size < 2 || comparing}
                >
                  {comparing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      比較中...
                    </>
                  ) : (
                    <>
                      <GitCompareArrows className="w-4 h-4" />
                      比較する
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Comparison Results */}
            {selectedData.length >= 2 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  比較結果
                </h2>
                <CompareView properties={selectedData} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

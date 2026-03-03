"use client";

import { useState, useEffect } from "react";
import CompareView from "@/components/touki/CompareView";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ToukiData } from "@/types/touki";
import { PropertyListItem } from "@/types/api";
import { GitCompareArrows } from "lucide-react";

interface PropertyWithData {
  id: string;
  name: string;
  parsedData: ToukiData;
}

export default function ComparePage() {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedData, setSelectedData] = useState<ToukiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch(() => setProperties([]))
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
  };

  const handleCompare = async () => {
    setComparing(true);
    try {
      const results: ToukiData[] = [];
      for (const id of selectedIds) {
        const res = await fetch(`/api/properties/${id}`);
        const prop: PropertyWithData = await res.json();
        results.push(prop.parsedData);
      }
      setSelectedData(results);
    } catch {
      setSelectedData([]);
    } finally {
      setComparing(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">横断比較ビューアー</h1>

      {properties.length === 0 ? (
        <div className="text-center py-16">
          <GitCompareArrows className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">比較する物件がありません</p>
          <p className="text-gray-400 text-sm mt-1">
            先に登記情報をアップロードしてください
          </p>
        </div>
      ) : (
        <>
          <Card title="物件を選択">
            <div className="space-y-2">
              {properties.map((prop) => (
                <label
                  key={prop.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(prop.id)}
                    onChange={() => toggleSelection(prop.id)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium text-sm">{prop.name}</p>
                    <p className="text-xs text-gray-500">
                      {prop.propertyType === "land"
                        ? "土地"
                        : prop.propertyType === "building"
                          ? "建物"
                          : "区分建物"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="primary"
                onClick={handleCompare}
                disabled={selectedIds.size < 2 || comparing}
              >
                {comparing ? "比較中..." : `${selectedIds.size}件を比較する`}
              </Button>
              {selectedIds.size < 2 && (
                <p className="text-xs text-gray-400 mt-2">
                  2件以上の物件を選択してください
                </p>
              )}
            </div>
          </Card>

          {selectedData.length >= 2 && (
            <Card title="比較結果">
              <CompareView properties={selectedData} />
            </Card>
          )}
        </>
      )}
    </div>
  );
}

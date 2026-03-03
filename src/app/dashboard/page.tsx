"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Building2, AlertTriangle } from "lucide-react";
import type { PropertyListItem } from "@/types/api";
import PropertyCard from "@/components/touki/PropertyCard";
import Button from "@/components/ui/Button";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="h-7 bg-gray-200 rounded-md w-20" />
        <div className="h-5 bg-gray-200 rounded w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("/api/properties");
        if (!res.ok) {
          throw new Error("物件一覧の取得に失敗しました");
        }
        const data: PropertyListItem[] = await res.json();
        setProperties(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "予期しないエラーが発生しました"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ダッシュボード
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            登録済みの物件一覧
          </p>
        </div>
        <Link href="/upload">
          <Button>
            <Plus className="w-4 h-4" />
            新規アップロード
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            まだ物件が登録されていません
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            登記情報をアップロードして、最初の物件を登録しましょう。
          </p>
          <Link href="/upload">
            <Button size="lg">
              <Plus className="w-4 h-4" />
              アップロードする
            </Button>
          </Link>
        </div>
      )}

      {/* Property Grid */}
      {!loading && !error && properties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((item) => (
            <PropertyCard
              key={item.id}
              property={{
                type: item.propertyType,
                location: item.name,
                number: "",
              }}
              riskSummary={item.riskSummary}
              onClick={() => router.push(`/property/${item.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

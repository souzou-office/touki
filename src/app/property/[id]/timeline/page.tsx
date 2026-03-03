"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import TimelineView from "@/components/touki/TimelineView";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { ToukiData } from "@/types/touki";
import type { StoredProperty } from "@/lib/store";
import { ArrowLeft, AlertTriangle, MapPin, Hash } from "lucide-react";

function TimelineSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-7 bg-gray-200 rounded w-48" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-64" />
      <div className="h-10 bg-gray-200 rounded-lg w-full" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-4 bg-gray-200 rounded-full mt-1 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [property, setProperty] = useState<StoredProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

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
          <TimelineSkeleton />
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
              href={`/property/${id}`}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              物件詳細に戻る
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-sm text-gray-500 mb-6">
            {error ?? "データが見つかりません"}
          </p>
          <Link href={`/property/${id}`}>
            <Button variant="secondary">物件詳細に戻る</Button>
          </Link>
        </main>
      </div>
    );
  }

  const data: ToukiData = property.parsedData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link
            href={`/property/${id}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            物件詳細に戻る
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <span className="text-sm font-medium text-gray-900 truncate">
            {property.name}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            履歴タイムライン
          </h1>
          <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {data.property.location}
            <span className="text-gray-300 mx-1">|</span>
            <Hash className="w-3.5 h-3.5" />
            {data.property.number}
          </p>
        </div>

        {/* Timeline */}
        <Card>
          <TimelineView data={data} />
        </Card>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import TimelineView from "@/components/touki/TimelineView";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ToukiData } from "@/types/touki";
import { ArrowLeft } from "lucide-react";

export default function TimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<ToukiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((res) => res.json())
      .then((prop) => setData(prop.parsedData))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">データが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/property/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">履歴タイムライン</h1>
      </div>

      <p className="text-gray-500 text-sm">
        {data.property.location} {data.property.number}
      </p>

      <Card>
        <TimelineView data={data} />
      </Card>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Save,
  FileText,
  Building2,
} from "lucide-react";
import FileDropzone from "@/components/upload/FileDropzone";
import type { ParseResponse } from "@/types/api";
import type { ToukiData } from "@/types/touki";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type UploadStep = "input" | "processing" | "result";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  land: "土地",
  building: "建物",
  condominium: "区分建物",
};

function ParseProgress() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        解析中...
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">
        登記情報を解析しています。しばらくお待ちください。
      </p>
      <div className="mt-6 w-64">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse w-2/3" />
        </div>
      </div>
    </div>
  );
}

function ParseResult({
  data,
  warnings,
  onSave,
  onRetry,
  saving,
}: {
  data: ToukiData;
  warnings: string[];
  onSave: () => void;
  onRetry: () => void;
  saving: boolean;
}) {
  const totalKou = data.kouSection.length;
  const activeKou = data.kouSection.filter((e) => e.isActive).length;
  const totalOtsu = data.otsuSection.length;
  const activeOtsu = data.otsuSection.filter((e) => e.isActive).length;
  const riskCount = data.otsuSection.reduce(
    (sum, e) => sum + e.riskFlags.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">
            解析が完了しました
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            解析精度: {Math.round(data.meta.parseConfidence * 100)}%
          </p>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl space-y-1">
          <p className="text-sm font-semibold text-yellow-800 mb-1">
            警告
          </p>
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-700">
              - {w}
            </p>
          ))}
        </div>
      )}

      {/* Property Summary */}
      <Card title="物件概要">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <dt className="text-xs text-gray-500">種別</dt>
            <dd className="text-sm font-medium text-gray-900 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-4 h-4 text-blue-500" />
              {PROPERTY_TYPE_LABELS[data.property.type] ?? data.property.type}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">所在</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">
              {data.property.location}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">地番・家屋番号</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">
              {data.property.number}
            </dd>
          </div>
          {data.property.area && (
            <div>
              <dt className="text-xs text-gray-500">面積</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5">
                {data.property.area}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Section Summary */}
      <Card title="登記内容サマリー">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-900">
              {activeKou}
              <span className="text-sm font-normal text-gray-400">
                /{totalKou}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">甲区（所有権）</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-900">
              {activeOtsu}
              <span className="text-sm font-normal text-gray-400">
                /{totalOtsu}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              乙区（所有権以外）
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p
              className={`text-2xl font-bold ${riskCount > 0 ? "text-red-600" : "text-gray-900"}`}
            >
              {riskCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">リスク検出数</p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onRetry} disabled={saving}>
          <RotateCcw className="w-4 h-4" />
          やり直す
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "保存中..." : "保存して詳細を見る"}
        </Button>
      </div>
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<UploadStep>("input");
  const [parseResult, setParseResult] = useState<ParseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleParse = useCallback(
    async (body: { text?: string; fileId?: string }) => {
      setStep("processing");
      setError(null);
      setParseResult(null);

      try {
        const res = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error("解析リクエストに失敗しました");
        }

        const data: ParseResponse = await res.json();

        if (!data.success || !data.data) {
          throw new Error(data.error ?? "解析に失敗しました");
        }

        setParseResult(data);
        setStep("result");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "予期しないエラーが発生しました"
        );
        setStep("input");
      }
    },
    []
  );

  const handleTextSubmit = useCallback(
    (text: string) => {
      handleParse({ text });
    },
    [handleParse]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (file.name.toLowerCase().endsWith(".pdf")) {
        // PDF: read as base64 and send for server-side text extraction
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        handleParse({ pdfBase64: base64 });
      } else {
        // TXT: read as text directly
        const text = await file.text();
        handleParse({ text });
      }
    },
    [handleParse]
  );

  const handleSave = useCallback(async () => {
    if (!parseResult?.data) return;

    setSaving(true);
    // Data is already saved by the parse API, just redirect
    router.push(`/property/${parseResult.data.meta.id}`);
  }, [parseResult, router]);

  const handleRetry = useCallback(() => {
    setStep("input");
    setParseResult(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <h1 className="text-base font-semibold text-gray-900">
            登記情報のアップロード
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[
            { key: "input", label: "入力" },
            { key: "processing", label: "解析" },
            { key: "result", label: "結果" },
          ].map((s, i) => {
            const isCurrent = step === s.key;
            const isPast =
              (s.key === "input" && step !== "input") ||
              (s.key === "processing" && step === "result");

            return (
              <div key={s.key} className="flex items-center gap-3">
                {i > 0 && (
                  <div
                    className={`w-8 h-px ${isPast || isCurrent ? "bg-blue-400" : "bg-gray-300"}`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isPast
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isCurrent
                        ? "text-blue-600"
                        : isPast
                          ? "text-blue-500"
                          : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-1 text-xs text-red-600 hover:text-red-800 underline cursor-pointer"
              >
                もう一度試す
              </button>
            </div>
          </div>
        )}

        {/* Input Step */}
        {step === "input" && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 mb-4">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                登記情報を入力
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                PDFファイルのアップロードまたはテキストの貼り付けで解析を開始します。
              </p>
            </div>
            <FileDropzone
              onFileSelect={handleFileSelect}
              onTextSubmit={handleTextSubmit}
              disabled={false}
            />
          </div>
        )}

        {/* Processing Step */}
        {step === "processing" && <ParseProgress />}

        {/* Result Step */}
        {step === "result" && parseResult?.data && (
          <ParseResult
            data={parseResult.data}
            warnings={parseResult.warnings}
            onSave={handleSave}
            onRetry={handleRetry}
            saving={saving}
          />
        )}
      </main>
    </div>
  );
}

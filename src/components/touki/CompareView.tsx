"use client";

import { useMemo } from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { ToukiData } from "@/types/touki";
import { compareProperties } from "@/lib/analysis/comparator";
import CompareColumn from "./CompareColumn";

interface CompareViewProps {
  properties: ToukiData[];
}

export default function CompareView({ properties }: CompareViewProps) {
  const result = useMemo(
    () => compareProperties(properties),
    [properties]
  );

  if (properties.length < 2) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        比較するには2つ以上の物件を選択してください
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Side-by-side columns */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {properties.map((prop, i) => (
          <CompareColumn key={prop.meta.id || i} data={prop} />
        ))}
      </div>

      {/* Comparison summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-gray-900">比較結果</h3>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            {result.ownerMatch ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium text-gray-700">
              所有者{result.ownerMatch ? "一致" : "不一致"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {result.mortgageMatch ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium text-gray-700">
              担保権者{result.mortgageMatch ? "一致" : "不一致"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {result.jointMortgageMatch ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <span className="font-medium text-gray-700">
              共同担保{result.jointMortgageMatch ? "一致" : "確認要"}
            </span>
          </div>
        </div>

        {/* Owner details */}
        {!result.ownerMatch && result.ownerDetails.length > 0 && (
          <div className="mt-4 rounded-md border border-red-100 bg-red-50 p-3">
            <h4 className="mb-2 text-xs font-semibold text-red-800">
              所有者の詳細
            </h4>
            <div className="space-y-1.5">
              {result.ownerDetails.map((detail, i) => (
                <div key={i} className="text-xs text-red-700">
                  <span className="font-medium">{detail.propertyName}:</span>{" "}
                  {detail.ownerName}
                  {detail.address && (
                    <span className="text-red-500"> ({detail.address})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mortgage details */}
        {!result.mortgageMatch && result.mortgageDetails.length > 0 && (
          <div className="mt-3 rounded-md border border-orange-100 bg-orange-50 p-3">
            <h4 className="mb-2 text-xs font-semibold text-orange-800">
              担保権の詳細
            </h4>
            <div className="space-y-1.5">
              {result.mortgageDetails.map((detail, i) => (
                <div key={i} className="text-xs text-orange-700">
                  <span className="font-medium">{detail.propertyName}:</span>{" "}
                  {detail.holder}
                  {detail.amount && (
                    <span className="text-orange-500"> ({detail.amount})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Differences */}
        {result.differences.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h4 className="mb-2 text-xs font-semibold text-gray-700">
              差分
            </h4>
            <ul className="space-y-1.5">
              {result.differences.map((diff, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-gray-600"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                  {diff}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-yellow-800">
              <AlertTriangle className="h-3.5 w-3.5" />
              警告
            </h4>
            <ul className="space-y-1.5">
              {result.warnings.map((warning, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-yellow-700"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import { parseToukiText } from "@/lib/claude/parser";
import { detectRisks } from "@/lib/analysis/risk-detector";
import { saveProperty, StoredProperty } from "@/lib/store";
import { ParseResponse } from "@/types/api";
import { RiskFlag } from "@/types/risk";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      const errorResponse: ParseResponse = {
        success: false,
        warnings: [],
        error: "リクエストに「text」フィールド（文字列）が必要です。",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (text.trim().length === 0) {
      const errorResponse: ParseResponse = {
        success: false,
        warnings: [],
        error: "テキストが空です。登記簿のテキストを入力してください。",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Parse the touki text using Claude
    const { data: parsedData, warnings: parseWarnings } = await parseToukiText(text);

    // Run risk detection and collect all risk flags
    const risks: RiskFlag[] = detectRisks(parsedData);

    // Attach risk flags to their corresponding otsu entries
    for (const entry of parsedData.otsuSection) {
      const entryRisks = risks.filter(
        (r) => r.relatedEntry === entry.rankNumber
      );
      entry.riskFlags = entryRisks;
    }

    // Generate a name from property location/number
    const propertyName =
      parsedData.property.location && parsedData.property.number
        ? `${parsedData.property.location} ${parsedData.property.number}`
        : parsedData.property.location || `物件 ${parsedData.meta.id}`;

    // Save to in-memory store
    const now = new Date().toISOString();
    const storedProperty: StoredProperty = {
      id: parsedData.meta.id,
      name: propertyName,
      propertyType: parsedData.property.type,
      rawText: text,
      parsedData,
      parseConfidence: parsedData.meta.parseConfidence,
      createdAt: now,
      updatedAt: now,
    };

    saveProperty(storedProperty);

    // Collect warnings
    const warnings: string[] = [...parseWarnings];

    if (parsedData.meta.parseConfidence < 0.7) {
      warnings.push(
        "解析の信頼度が低いです。入力テキストの品質を確認してください。"
      );
    }

    if (parsedData.kouSection.length === 0) {
      warnings.push("甲区（所有権に関する事項）が検出されませんでした。");
    }

    if (risks.filter((r) => r.severity === "high").length > 0) {
      warnings.push(
        `高リスクの項目が${risks.filter((r) => r.severity === "high").length}件検出されました。詳細を確認してください。`
      );
    }

    const response: ParseResponse = {
      success: true,
      data: parsedData,
      warnings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Parse API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "不明なエラーが発生しました。";

    const errorResponse: ParseResponse = {
      success: false,
      warnings: [],
      error: `解析中にエラーが発生しました: ${errorMessage}`,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

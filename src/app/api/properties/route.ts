import { NextResponse } from "next/server";
import { getProperties } from "@/lib/store";
import { PropertyListItem } from "@/types/api";

export async function GET() {
  try {
    const storedProperties = getProperties();

    const propertyList: PropertyListItem[] = storedProperties.map((prop) => {
      // Count risk severities across all otsu entries
      const riskSummary = { high: 0, medium: 0, low: 0 };

      for (const entry of prop.parsedData.otsuSection) {
        for (const risk of entry.riskFlags) {
          if (risk.severity === "high") {
            riskSummary.high++;
          } else if (risk.severity === "medium") {
            riskSummary.medium++;
          } else if (risk.severity === "low") {
            riskSummary.low++;
          }
        }
      }

      return {
        id: prop.id,
        name: prop.name,
        propertyType: prop.propertyType,
        parseConfidence: prop.parseConfidence,
        createdAt: prop.createdAt,
        riskSummary,
      };
    });

    return NextResponse.json(propertyList);
  } catch (error) {
    console.error("Properties list API error:", error);

    return NextResponse.json(
      { error: "物件一覧の取得中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}

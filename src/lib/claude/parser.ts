import { getClaudeClient } from "./client";
import { PARSE_SYSTEM_PROMPT } from "./prompts";
import { ToukiData } from "@/types/touki";
import { normalizeText } from "@/lib/utils/normalize";
import { ToukiDataSchema } from "@/lib/utils/validation";

export async function parseToukiText(rawText: string): Promise<{
  data: ToukiData;
  warnings: string[];
}> {
  const normalizedText = normalizeText(rawText);
  const client = getClaudeClient();
  const warnings: string[] = [];

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 4096,
    system: PARSE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `以下の登記情報をJSONに変換してください。\n\n${normalizedText}`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  let parsedData: unknown;
  try {
    parsedData = JSON.parse(jsonStr);
  } catch {
    throw new Error("Claude APIからの応答をJSONとしてパースできませんでした");
  }

  // Extract parseConfidence from Claude's response before building meta
  const rawData = parsedData as Record<string, unknown>;
  const parseConfidence =
    typeof rawData.parseConfidence === "number" ? rawData.parseConfidence : 0.8;
  delete rawData.parseConfidence;

  // Generate meta info
  const dataWithMeta = {
    ...rawData,
    meta: {
      ...((rawData.meta as Record<string, unknown>) || {}),
      id: crypto.randomUUID(),
      uploadedAt: new Date().toISOString(),
      source: "text" as const,
      rawText: rawText,
      parseConfidence,
    },
  };

  // Validate with Zod
  const result = ToukiDataSchema.safeParse(dataWithMeta);
  if (!result.success) {
    warnings.push("パース結果の一部が期待されるスキーマと一致しません");
    // Return with best-effort data
    return {
      data: dataWithMeta as ToukiData,
      warnings,
    };
  }

  return {
    data: result.data as ToukiData,
    warnings,
  };
}

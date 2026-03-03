import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * PDFバイナリ(base64)からテキストを抽出する
 */
export async function extractTextFromPdf(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const data = new Uint8Array(buffer);

  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item: Record<string, unknown>) => "str" in item)
      .map((item: Record<string, unknown>) => item.str as string)
      .join("");
    pages.push(pageText);
  }

  return pages.join("\n");
}

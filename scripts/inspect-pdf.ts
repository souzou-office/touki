/**
 * PDFからテキスト抽出結果を確認するスクリプト
 * Usage: npx tsx scripts/inspect-pdf.ts <path-to-pdf>
 */
import fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

async function main() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error("Usage: npx tsx scripts/inspect-pdf.ts <path-to-pdf>");
    process.exit(1);
  }

  const buffer = fs.readFileSync(pdfPath);
  console.log(`File size: ${buffer.length} bytes\n`);

  const data = await pdfParse(buffer);

  console.log("=== PDF Info ===");
  console.log(`Pages: ${data.numpages}`);
  console.log(`Version: ${data.version}`);
  console.log();

  console.log("=== Extracted Text ===");
  console.log(data.text);
  console.log();

  console.log("=== Text Length ===");
  console.log(`${data.text.length} characters`);

  // Show hex dump of first 200 chars to check encoding
  console.log("\n=== First 200 chars (with char codes) ===");
  for (let i = 0; i < Math.min(200, data.text.length); i++) {
    const ch = data.text[i];
    const code = data.text.charCodeAt(i);
    if (code > 127 || code < 32) {
      process.stdout.write(`[U+${code.toString(16).padStart(4, "0")}]`);
    } else {
      process.stdout.write(ch);
    }
  }
  console.log();
}

main().catch(console.error);

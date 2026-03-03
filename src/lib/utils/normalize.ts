/**
 * Normalize full-width/half-width characters
 */
export function normalizeWidth(text: string): string {
  // Full-width numbers to half-width
  let result = text.replace(/[０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  );
  // Full-width letters to half-width
  result = result.replace(/[Ａ-Ｚａ-ｚ]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  );
  return result;
}

/**
 * Normalize whitespace and line breaks
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u3000/g, " ")  // Full-width space to half-width
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Normalize text for parsing
 */
export function normalizeText(text: string): string {
  let result = normalizeWidth(text);
  result = normalizeWhitespace(result);
  return result;
}

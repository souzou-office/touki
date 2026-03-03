const ERA_MAP: { name: string; startYear: number; aliases: string[] }[] = [
  { name: "令和", startYear: 2019, aliases: ["令和", "R"] },
  { name: "平成", startYear: 1989, aliases: ["平成", "H"] },
  { name: "昭和", startYear: 1926, aliases: ["昭和", "S"] },
  { name: "大正", startYear: 1912, aliases: ["大正", "T"] },
  { name: "明治", startYear: 1868, aliases: ["明治", "M"] },
];

/**
 * Convert Japanese era date string to ISO date string
 * Examples: "令和5年3月15日" → "2023-03-15", "R5.3.15" → "2023-03-15"
 */
export function warekiToSeireki(dateStr: string): string {
  // Try full Japanese format: 令和5年3月15日
  const fullMatch = dateStr.match(
    /([令平昭大明][和成治正治])(\d{1,2}|元)年(\d{1,2})月(\d{1,2})日/
  );
  if (fullMatch) {
    const [, era, yearStr, month, day] = fullMatch;
    const year = yearStr === "元" ? 1 : parseInt(yearStr);
    const eraInfo = ERA_MAP.find((e) => e.aliases.includes(era));
    if (eraInfo) {
      const westernYear = eraInfo.startYear + year - 1;
      return `${westernYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  // Try abbreviated format: R5.3.15 or H25.8.20
  const abbrMatch = dateStr.match(/([RHSTM])(\d{1,2})\.(\d{1,2})\.(\d{1,2})/);
  if (abbrMatch) {
    const [, eraChar, yearStr, month, day] = abbrMatch;
    const year = parseInt(yearStr);
    const eraInfo = ERA_MAP.find((e) => e.aliases.includes(eraChar));
    if (eraInfo) {
      const westernYear = eraInfo.startYear + year - 1;
      return `${westernYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  return dateStr; // Return as-is if not parseable
}

/**
 * Convert ISO date string to Japanese era date string
 */
export function seirekiToWareki(dateStr: string): string {
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;

  const [, yearStr, month, day] = match;
  const year = parseInt(yearStr);

  for (const era of ERA_MAP) {
    if (year >= era.startYear) {
      const eraYear = year - era.startYear + 1;
      const eraYearStr = eraYear === 1 ? "元" : String(eraYear);
      return `${era.name}${eraYearStr}年${parseInt(month)}月${parseInt(day)}日`;
    }
  }

  return dateStr;
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  // If already in Japanese format, return as-is
  if (/[令平昭大明]/.test(dateStr)) return dateStr;
  // If in ISO format, convert
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return seirekiToWareki(dateStr);
  return dateStr;
}

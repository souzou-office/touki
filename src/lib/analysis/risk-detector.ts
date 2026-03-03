import { ToukiData, KouEntry, OtsuEntry } from "@/types/touki";
import { RiskFlag, RiskType } from "@/types/risk";

/**
 * Analyze parsed ToukiData and detect risks across kou (甲区) and otsu (乙区) sections.
 */
export function detectRisks(data: ToukiData): RiskFlag[] {
  const risks: RiskFlag[] = [];

  // Check kou section (甲区) entries
  for (const entry of data.kouSection) {
    risks.push(...detectKouRisks(entry, data));
  }

  // Check otsu section (乙区) entries
  for (const entry of data.otsuSection) {
    risks.push(...detectOtsuRisks(entry, data));
  }

  return risks;
}

/**
 * Get the current owner from the kou section.
 * The current owner is determined by the last active entry in the kou section
 * whose purpose relates to ownership (所有権).
 */
function getCurrentOwner(
  data: ToukiData
): { name: string; address: string; share?: string }[] | null {
  const activeEntries = data.kouSection.filter(
    (entry) => entry.isActive && !entry.strikethrough
  );

  // Walk backwards to find the last active ownership entry
  for (let i = activeEntries.length - 1; i >= 0; i--) {
    const entry = activeEntries[i];
    if (
      entry.purpose.includes("所有権") ||
      entry.purpose.includes("持分") ||
      entry.purpose === ""
    ) {
      return entry.rightHolder;
    }
  }

  // Fallback: return rightHolder from the last active entry
  if (activeEntries.length > 0) {
    return activeEntries[activeEntries.length - 1].rightHolder;
  }

  return null;
}

/**
 * Detect risks in kou section (甲区 — ownership section) entries.
 */
function detectKouRisks(entry: KouEntry, data: ToukiData): RiskFlag[] {
  const risks: RiskFlag[] = [];

  // --- Seizure detection (差押/仮差押) ---
  if (entry.purpose.includes("差押") || entry.purpose.includes("仮差押")) {
    const isProvisional = entry.purpose.includes("仮差押");
    risks.push({
      type: "seizure",
      severity: "high",
      message: isProvisional
        ? `仮差押が登記されています（受付番号: ${entry.receptionNumber}）。裁判所による仮差押命令が出されている可能性があります。`
        : `差押が登記されています（受付番号: ${entry.receptionNumber}）。強制執行や競売手続きが進行中の可能性があります。`,
      relatedEntry: entry.rankNumber,
    });
  }

  // --- Provisional registration (仮登記) ---
  if (entry.purpose.includes("仮登記")) {
    risks.push({
      type: "provisional_reg",
      severity: "high",
      message: `仮登記が設定されています（受付番号: ${entry.receptionNumber}）。本登記がなされると対抗力を失う可能性があります。`,
      relatedEntry: entry.rankNumber,
    });
  }

  // --- Repurchase special contract (買戻特約) ---
  if (entry.purpose.includes("買戻")) {
    risks.push({
      type: "repurchase",
      severity: "medium",
      message: `買戻特約が付されています（受付番号: ${entry.receptionNumber}）。売主が買戻権を行使する可能性があります。`,
      relatedEntry: entry.rankNumber,
    });
  }

  // --- Trust (信託) ---
  if (entry.purpose.includes("信託")) {
    risks.push({
      type: "trust",
      severity: "medium",
      message: `信託登記がされています（受付番号: ${entry.receptionNumber}）。信託契約の内容を確認する必要があります。`,
      relatedEntry: entry.rankNumber,
    });
  }

  // --- Multiple owners ---
  if (entry.isActive && !entry.strikethrough && entry.rightHolder.length > 1) {
    // Only flag if this is the current ownership entry
    const currentOwner = getCurrentOwner(data);
    if (
      currentOwner &&
      currentOwner.length > 1 &&
      currentOwner === entry.rightHolder
    ) {
      risks.push({
        type: "multiple_owners",
        severity: "low",
        message: `共有名義（${currentOwner.length}名）です。処分行為には共有者全員の同意が必要です。共有者: ${currentOwner.map((o) => o.name).join("、")}`,
        relatedEntry: entry.rankNumber,
      });
    }
  }

  // --- Inheritance ---
  if (
    entry.isActive &&
    !entry.strikethrough &&
    entry.cause.includes("相続")
  ) {
    // Check if this is the last active kou entry (most recent ownership event)
    const activeEntries = data.kouSection.filter(
      (e) => e.isActive && !e.strikethrough
    );
    const lastActive = activeEntries[activeEntries.length - 1];
    if (lastActive && lastActive.rankNumber === entry.rankNumber) {
      risks.push({
        type: "inheritance",
        severity: "medium",
        message: `相続による所有権移転です（原因日: ${entry.causeDate}）。遺産分割協議書や相続関係の確認が必要な場合があります。`,
        relatedEntry: entry.rankNumber,
      });
    }
  }

  // --- Address change needed ---
  if (entry.isActive && !entry.strikethrough) {
    const currentOwner = getCurrentOwner(data);
    if (currentOwner && currentOwner === entry.rightHolder) {
      for (const holder of entry.rightHolder) {
        if (needsAddressUpdate(holder.address, entry.receptionDate)) {
          risks.push({
            type: "address_change",
            severity: "medium",
            message: `所有者「${holder.name}」の住所が登記時（${entry.receptionDate}）から変更されている可能性があります。住所変更登記が必要か確認してください。`,
            relatedEntry: entry.rankNumber,
          });
        }
      }
    }
  }

  return risks;
}

/**
 * Detect risks in otsu section (乙区 — rights other than ownership) entries.
 */
function detectOtsuRisks(entry: OtsuEntry, data: ToukiData): RiskFlag[] {
  const risks: RiskFlag[] = [];

  // Only check active entries
  if (!entry.isActive || entry.strikethrough) {
    return risks;
  }

  // --- Seizure in otsu section ---
  if (entry.purpose.includes("差押") || entry.purpose.includes("仮差押")) {
    const isProvisional = entry.purpose.includes("仮差押");
    risks.push({
      type: "seizure",
      severity: "high",
      message: isProvisional
        ? `乙区に仮差押が登記されています（受付番号: ${entry.receptionNumber}）。`
        : `乙区に差押が登記されています（受付番号: ${entry.receptionNumber}）。`,
      relatedEntry: entry.rankNumber,
    });
  }

  // --- Provisional registration in otsu ---
  if (entry.purpose.includes("仮登記")) {
    risks.push({
      type: "provisional_reg",
      severity: "high",
      message: `乙区に仮登記が設定されています（受付番号: ${entry.receptionNumber}）。権利関係に影響する可能性があります。`,
      relatedEntry: entry.rankNumber,
    });
  }

  // --- Trust in otsu ---
  if (entry.purpose.includes("信託")) {
    risks.push({
      type: "trust",
      severity: "medium",
      message: `乙区に信託登記がされています（受付番号: ${entry.receptionNumber}）。信託契約の内容を確認する必要があります。`,
      relatedEntry: entry.rankNumber,
    });
  }

  // --- Revolving mortgage (根抵当権) ---
  if (entry.rightType === "根抵当権") {
    const currentOwner = getCurrentOwner(data);

    // Check debtor mismatch for revolving mortgage
    if (entry.debtor && currentOwner) {
      const ownerNames = currentOwner.map((o) => o.name);
      const debtorMatchesOwner = ownerNames.some(
        (name) => name === entry.debtor!.name
      );

      if (!debtorMatchesOwner) {
        risks.push({
          type: "revolving_mortgage",
          severity: "medium",
          message: `根抵当権の債務者「${entry.debtor.name}」が現在の所有者と一致しません。債務者変更の登記が必要な可能性があります。`,
          relatedEntry: entry.rankNumber,
        });
      } else {
        risks.push({
          type: "revolving_mortgage",
          severity: "low",
          message: `根抵当権が設定されています（極度額: ${entry.maxAmount || "不明"}、権利者: ${entry.rightHolder.name}）。`,
          relatedEntry: entry.rankNumber,
        });
      }
    } else {
      risks.push({
        type: "revolving_mortgage",
        severity: "low",
        message: `根抵当権が設定されています（極度額: ${entry.maxAmount || "不明"}、権利者: ${entry.rightHolder.name}）。`,
        relatedEntry: entry.rankNumber,
      });
    }
  }

  // --- Debtor mismatch (for regular mortgages, non-revolving) ---
  if (
    entry.rightType !== "根抵当権" &&
    (entry.rightType === "抵当権" || entry.purpose.includes("抵当権")) &&
    entry.debtor
  ) {
    const currentOwner = getCurrentOwner(data);
    if (currentOwner) {
      const ownerNames = currentOwner.map((o) => o.name);
      const debtorMatchesOwner = ownerNames.some(
        (name) => name === entry.debtor!.name
      );

      if (!debtorMatchesOwner) {
        risks.push({
          type: "debtor_mismatch",
          severity: "medium",
          message: `抵当権の債務者「${entry.debtor.name}」が現在の所有者「${ownerNames.join("、")}」と一致しません。確認が必要です。`,
          relatedEntry: entry.rankNumber,
        });
      }
    }
  }

  // --- Old mortgage (>20 years and still active) ---
  if (
    entry.rightType === "抵当権" ||
    entry.rightType === "根抵当権" ||
    entry.purpose.includes("抵当権")
  ) {
    const mortgageAge = calculateAgeInYears(entry.receptionDate);
    if (mortgageAge !== null && mortgageAge > 20) {
      risks.push({
        type: "old_mortgage",
        severity: "medium",
        message: `${mortgageAge}年以上前に設定された${entry.rightType || "抵当権"}が残存しています（受付日: ${entry.receptionDate}）。抹消漏れの可能性があります。`,
        relatedEntry: entry.rankNumber,
      });
    }
  }

  // --- Repurchase in otsu ---
  if (entry.purpose.includes("買戻")) {
    risks.push({
      type: "repurchase",
      severity: "medium",
      message: `乙区に買戻特約が登記されています（受付番号: ${entry.receptionNumber}）。`,
      relatedEntry: entry.rankNumber,
    });
  }

  return risks;
}

/**
 * Basic heuristic to check if an address might need updating.
 * Flags if the registration is old enough that an address change is plausible.
 * In practice this would be compared against external data; here we flag
 * registrations older than 10 years as potentially needing review.
 */
function needsAddressUpdate(address: string, receptionDate: string): boolean {
  // If address is empty or very short, likely needs update
  if (!address || address.trim().length < 3) {
    return true;
  }

  // If the registration is older than 10 years, flag for review
  const ageInYears = calculateAgeInYears(receptionDate);
  if (ageInYears !== null && ageInYears > 10) {
    return true;
  }

  return false;
}

/**
 * Calculate the age in years from a date string.
 * Supports common Japanese date formats:
 *   - 令和X年Y月Z日
 *   - 平成X年Y月Z日
 *   - 昭和X年Y月Z日
 *   - YYYY-MM-DD / YYYY/MM/DD
 */
function calculateAgeInYears(dateStr: string): number | null {
  const westernDate = parseJapaneseDate(dateStr);
  if (!westernDate) {
    return null;
  }

  const now = new Date();
  const diffMs = now.getTime() - westernDate.getTime();
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffYears);
}

/**
 * Parse a Japanese era date string into a JavaScript Date.
 */
function parseJapaneseDate(dateStr: string): Date | null {
  if (!dateStr) {
    return null;
  }

  // Try Japanese era format: 令和X年Y月Z日, 平成X年Y月Z日, 昭和X年Y月Z日, 大正X年Y月Z日
  const eraMatch = dateStr.match(
    /(令和|平成|昭和|大正)(\d{1,2})年(\d{1,2})月(\d{1,2})日/
  );
  if (eraMatch) {
    const [, era, yearStr, monthStr, dayStr] = eraMatch;
    const eraYear = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    let westernYear: number;
    switch (era) {
      case "令和":
        westernYear = 2018 + eraYear;
        break;
      case "平成":
        westernYear = 1988 + eraYear;
        break;
      case "昭和":
        westernYear = 1925 + eraYear;
        break;
      case "大正":
        westernYear = 1911 + eraYear;
        break;
      default:
        return null;
    }

    return new Date(westernYear, month - 1, day);
  }

  // Try western date format: YYYY-MM-DD or YYYY/MM/DD
  const westernMatch = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (westernMatch) {
    const [, yearStr, monthStr, dayStr] = westernMatch;
    return new Date(
      parseInt(yearStr, 10),
      parseInt(monthStr, 10) - 1,
      parseInt(dayStr, 10)
    );
  }

  return null;
}

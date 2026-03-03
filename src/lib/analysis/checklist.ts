import { ToukiData, KouEntry, OtsuEntry } from "@/types/touki";

export interface ChecklistItem {
  id: string;
  category: "required" | "recommended" | "info";
  title: string;
  description: string;
  reason: string;
  estimatedCost?: string;
  completed: boolean;
}

/**
 * Generate a checklist of recommended registration procedures based on the
 * current registry state and the planned transaction type.
 */
export function generateChecklist(
  data: ToukiData,
  transactionType: "sale" | "loan" | "inheritance" | "other",
  buyerName?: string,
  buyerAddress?: string
): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const currentOwner = getCurrentOwner(data);
  const activeMortgages = getActiveMortgages(data);
  const activeRevolvingMortgages = getActiveRevolvingMortgages(data);

  // --- Address change needed ---
  if (currentOwner) {
    const ownerEntry = getOwnerEntry(data);
    if (ownerEntry) {
      for (const holder of currentOwner) {
        if (looksLikeOutdatedAddress(holder.address, ownerEntry.receptionDate)) {
          items.push({
            id: "address-change",
            category: "recommended",
            title: "所有者住所変更登記",
            description: `所有者「${holder.name}」の登記住所（${holder.address}）が現在の住所と異なる場合、住所変更登記を行います。`,
            reason: `登記された住所は${ownerEntry.receptionDate}時点のものです。現住所と異なる場合、移転登記の前提として住所変更登記が必要です。`,
            estimatedCost: "1,000円〜（登録免許税）＋司法書士報酬",
            completed: false,
          });
          break; // One checklist item is sufficient for address change
        }
      }
    }
  }

  // --- Mortgage cancellation (for sale transactions) ---
  if (transactionType === "sale" && activeMortgages.length > 0) {
    for (const mortgage of activeMortgages) {
      items.push({
        id: `mortgage-cancel-${mortgage.rankNumber}`,
        category: "required",
        title: `抵当権抹消登記（${mortgage.rightHolder.name}）`,
        description: `${mortgage.rightType || "抵当権"}（順位番号${mortgage.rankNumber}、権利者: ${mortgage.rightHolder.name}、債権額: ${mortgage.debtAmount || mortgage.maxAmount || "不明"}）の抹消登記を行います。`,
        reason:
          "売買による所有権移転の前に、既存の抵当権を抹消する必要があります。金融機関からの抹消書類の取得が必要です。",
        estimatedCost: "1,000円（登録免許税）＋司法書士報酬",
        completed: false,
      });
    }
  }

  // --- Ownership transfer (sale transactions) ---
  if (transactionType === "sale") {
    const ownerNames = currentOwner
      ? currentOwner.map((o) => o.name).join("、")
      : "不明";
    const buyerDesc = buyerName || "買主";

    items.push({
      id: "ownership-transfer",
      category: "required",
      title: "所有権移転登記",
      description: `「${ownerNames}」から「${buyerDesc}」への所有権移転登記を行います。`,
      reason:
        "売買契約に基づき、所有権を買主に移転するための登記です。売買代金決済と同時に申請するのが一般的です。",
      estimatedCost:
        "固定資産税評価額 × 2%（登録免許税）＋司法書士報酬（住宅用土地・建物は軽減税率の適用あり）",
      completed: false,
    });

    // If buyer info provided, add address setup note
    if (buyerName && buyerAddress) {
      items.push({
        id: "buyer-address-confirm",
        category: "info",
        title: "買主住所の確認",
        description: `買主「${buyerName}」の登記住所: ${buyerAddress}`,
        reason:
          "住民票または戸籍の附票と一致する住所で登記する必要があります。",
        completed: false,
      });
    }
  }

  // --- New mortgage setup (loan transactions) ---
  if (transactionType === "loan") {
    items.push({
      id: "new-mortgage-setup",
      category: "required",
      title: "抵当権設定登記",
      description:
        "融資に基づく抵当権設定登記を行います。金融機関の指定する条件に従って設定します。",
      reason:
        "融資実行の条件として、担保となる不動産に抵当権を設定する必要があります。",
      estimatedCost:
        "債権額 × 0.4%（登録免許税）＋司法書士報酬（住宅ローンの場合は軽減税率 0.1% の適用あり）",
      completed: false,
    });

    // If existing mortgages, they may need to be dealt with
    if (activeMortgages.length > 0) {
      items.push({
        id: "existing-mortgage-review",
        category: "recommended",
        title: "既存抵当権の確認",
        description: `現在${activeMortgages.length}件の抵当権が設定されています。借換えの場合は既存抵当権の抹消が必要です。`,
        reason:
          "新規融資の順位確保のため、既存の抵当権の取扱い（抹消・順位変更等）を確認する必要があります。",
        completed: false,
      });
    }
  }

  // --- Inheritance registration ---
  if (transactionType === "inheritance") {
    items.push({
      id: "inheritance-registration",
      category: "required",
      title: "相続による所有権移転登記",
      description:
        "相続を原因とする所有権移転登記を行います。遺産分割協議書または遺言書に基づいて登記します。",
      reason:
        "令和6年4月1日より相続登記が義務化されました。相続開始を知った日から3年以内に登記を行う必要があります。",
      estimatedCost:
        "固定資産税評価額 × 0.4%（登録免許税）＋司法書士報酬",
      completed: false,
    });

    items.push({
      id: "inheritance-documents",
      category: "required",
      title: "相続関係書類の準備",
      description:
        "戸籍謄本（被相続人の出生から死亡まで）、相続人全員の戸籍謄本、遺産分割協議書（法定相続以外の場合）、相続人全員の印鑑証明書を準備します。",
      reason:
        "相続登記の申請には法定の添付書類が必要です。戸籍の収集に時間がかかる場合があります。",
      completed: false,
    });

    // Check if there is already a pending inheritance (cause = 相続 but address may be old)
    const lastKouEntry = getOwnerEntry(data);
    if (lastKouEntry && lastKouEntry.cause.includes("相続")) {
      items.push({
        id: "inheritance-chain-check",
        category: "recommended",
        title: "数次相続の確認",
        description:
          "直前の所有権移転が相続によるものです。さらなる相続（数次相続）が発生していないか確認してください。",
        reason:
          "数次相続の場合、中間の相続登記が省略できる場合と、各相続について順に登記が必要な場合があります。",
        completed: false,
      });
    }

    // If there are active mortgages, note them
    if (activeMortgages.length > 0) {
      items.push({
        id: "inheritance-mortgage-note",
        category: "info",
        title: "既存抵当権の確認（相続時）",
        description: `${activeMortgages.length}件の抵当権が設定されています。債務の承継について金融機関への確認が必要です。`,
        reason:
          "被相続人の債務は相続人に承継されます。抵当権付きの債務について金融機関と協議が必要な場合があります。",
        completed: false,
      });
    }
  }

  // --- Revolving mortgage debtor change ---
  if (activeRevolvingMortgages.length > 0 && currentOwner) {
    const ownerNames = currentOwner.map((o) => o.name);

    for (const rm of activeRevolvingMortgages) {
      if (rm.debtor) {
        const debtorMatchesOwner = ownerNames.some(
          (name) => name === rm.debtor!.name
        );

        if (!debtorMatchesOwner) {
          items.push({
            id: `revolving-debtor-change-${rm.rankNumber}`,
            category: "recommended",
            title: `根抵当権の債務者変更登記（順位番号${rm.rankNumber}）`,
            description: `根抵当権（権利者: ${rm.rightHolder.name}、極度額: ${rm.maxAmount || "不明"}）の債務者「${rm.debtor.name}」が現在の所有者「${ownerNames.join("、")}」と一致しません。`,
            reason:
              "根抵当権の債務者と所有者が異なる場合、取引や融資に支障が生じる可能性があります。債務者変更登記を検討してください。",
            estimatedCost: "20,000円（登録免許税）＋司法書士報酬",
            completed: false,
          });
        }
      }
    }
  }

  // --- Multiple owners note (for sale transactions) ---
  if (
    (transactionType === "sale" || transactionType === "other") &&
    currentOwner &&
    currentOwner.length > 1
  ) {
    items.push({
      id: "multiple-owners-consent",
      category: "required",
      title: "共有者全員の同意確認",
      description: `${currentOwner.length}名の共有名義です。共有者全員（${currentOwner.map((o) => o.name).join("、")}）の売却同意と登記手続きへの協力が必要です。`,
      reason:
        "共有不動産の処分には、民法上、共有者全員の同意が必要です（民法251条）。",
      completed: false,
    });
  }

  // --- Joint mortgage register note ---
  if (data.jointMortgageRegisters.length > 0) {
    const totalReferencedProperties = data.jointMortgageRegisters.reduce(
      (sum, reg) => sum + reg.properties.length,
      0
    );

    items.push({
      id: "joint-mortgage-check",
      category: "info",
      title: "共同担保目録の確認",
      description: `${data.jointMortgageRegisters.length}件の共同担保目録があり、計${totalReferencedProperties}筆の物件が含まれています。関連物件の登記状況も合わせて確認してください。`,
      reason:
        "共同担保に含まれる他の物件の登記状況が取引に影響する場合があります。",
      completed: false,
    });
  }

  // --- General: Stamp duty / tax note ---
  if (transactionType === "sale" || transactionType === "inheritance") {
    items.push({
      id: "tax-consultation",
      category: "recommended",
      title: "税務相談の検討",
      description:
        transactionType === "sale"
          ? "譲渡所得税、不動産取得税、固定資産税の精算について税理士への相談を検討してください。"
          : "相続税の申告が必要かどうか、税理士への相談を検討してください。相続税の申告期限は相続開始から10ヶ月以内です。",
      reason:
        "不動産の移転に伴う税務上の義務を適切に履行するために、専門家への相談が推奨されます。",
      completed: false,
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Get current owner from the kou section (last active ownership entry).
 */
function getCurrentOwner(
  data: ToukiData
): { name: string; address: string; share?: string }[] | null {
  const activeEntries = data.kouSection.filter(
    (entry) => entry.isActive && !entry.strikethrough
  );

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

  if (activeEntries.length > 0) {
    return activeEntries[activeEntries.length - 1].rightHolder;
  }

  return null;
}

/**
 * Get the kou entry for the current owner.
 */
function getOwnerEntry(data: ToukiData): KouEntry | null {
  const activeEntries = data.kouSection.filter(
    (entry) => entry.isActive && !entry.strikethrough
  );

  for (let i = activeEntries.length - 1; i >= 0; i--) {
    const entry = activeEntries[i];
    if (
      entry.purpose.includes("所有権") ||
      entry.purpose.includes("持分") ||
      entry.purpose === ""
    ) {
      return entry;
    }
  }

  if (activeEntries.length > 0) {
    return activeEntries[activeEntries.length - 1];
  }

  return null;
}

/**
 * Get all active mortgage entries from the otsu section (both regular and revolving).
 */
function getActiveMortgages(data: ToukiData): OtsuEntry[] {
  return data.otsuSection.filter(
    (entry) =>
      entry.isActive &&
      !entry.strikethrough &&
      (entry.rightType === "抵当権" ||
        entry.rightType === "根抵当権" ||
        entry.purpose.includes("抵当権"))
  );
}

/**
 * Get only active revolving mortgage (根抵当権) entries.
 */
function getActiveRevolvingMortgages(data: ToukiData): OtsuEntry[] {
  return data.otsuSection.filter(
    (entry) =>
      entry.isActive && !entry.strikethrough && entry.rightType === "根抵当権"
  );
}

/**
 * Basic heuristic to determine if an address might be outdated.
 * Flags registrations older than 10 years or addresses that appear incomplete.
 */
function looksLikeOutdatedAddress(
  address: string,
  receptionDate: string
): boolean {
  if (!address || address.trim().length < 3) {
    return true;
  }

  const ageInYears = calculateAgeInYears(receptionDate);
  if (ageInYears !== null && ageInYears > 10) {
    return true;
  }

  return false;
}

/**
 * Calculate the age in years from a date string.
 */
function calculateAgeInYears(dateStr: string): number | null {
  const date = parseJapaneseDate(dateStr);
  if (!date) {
    return null;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
}

/**
 * Parse a Japanese era date string into a JavaScript Date.
 */
function parseJapaneseDate(dateStr: string): Date | null {
  if (!dateStr) {
    return null;
  }

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

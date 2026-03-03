import { ToukiData, OtsuEntry } from "@/types/touki";

export interface ComparisonResult {
  ownerMatch: boolean;
  ownerDetails: { propertyName: string; ownerName: string; address: string }[];
  mortgageMatch: boolean;
  mortgageDetails: {
    propertyName: string;
    holder: string;
    amount: string;
  }[];
  jointMortgageMatch: boolean;
  differences: string[];
  warnings: string[];
}

/**
 * Compare multiple property registry records (ToukiData) to identify
 * matches and discrepancies in ownership, mortgages, and joint mortgage
 * register references.
 */
export function compareProperties(
  properties: ToukiData[]
): ComparisonResult {
  const ownerDetails: ComparisonResult["ownerDetails"] = [];
  const mortgageDetails: ComparisonResult["mortgageDetails"] = [];
  const differences: string[] = [];
  const warnings: string[] = [];

  if (properties.length === 0) {
    return {
      ownerMatch: true,
      ownerDetails: [],
      mortgageMatch: true,
      mortgageDetails: [],
      jointMortgageMatch: true,
      differences: [],
      warnings: ["比較対象の物件がありません。"],
    };
  }

  if (properties.length === 1) {
    const data = properties[0];
    const owner = getCurrentOwner(data);
    const propertyName = formatPropertyName(data);

    if (owner) {
      for (const holder of owner) {
        ownerDetails.push({
          propertyName,
          ownerName: holder.name,
          address: holder.address,
        });
      }
    }

    const mortgages = getActiveMortgages(data);
    for (const m of mortgages) {
      mortgageDetails.push({
        propertyName,
        holder: m.rightHolder.name,
        amount: m.debtAmount || m.maxAmount || "不明",
      });
    }

    return {
      ownerMatch: true,
      ownerDetails,
      mortgageMatch: true,
      mortgageDetails,
      jointMortgageMatch: true,
      differences: [],
      warnings: ["物件が1件のみのため比較を行えません。"],
    };
  }

  // --- Collect owner info for each property ---
  const ownersByProperty: {
    propertyName: string;
    owners: { name: string; address: string }[];
  }[] = [];

  for (const data of properties) {
    const propertyName = formatPropertyName(data);
    const owner = getCurrentOwner(data);
    const owners = owner || [];

    for (const holder of owners) {
      ownerDetails.push({
        propertyName,
        ownerName: holder.name,
        address: holder.address,
      });
    }

    ownersByProperty.push({ propertyName, owners });
  }

  // --- Compare owners across properties ---
  const ownerMatch = checkOwnerMatch(ownersByProperty, differences);

  // --- Collect mortgage info for each property ---
  const mortgagesByProperty: {
    propertyName: string;
    mortgages: OtsuEntry[];
  }[] = [];

  for (const data of properties) {
    const propertyName = formatPropertyName(data);
    const mortgages = getActiveMortgages(data);

    for (const m of mortgages) {
      mortgageDetails.push({
        propertyName,
        holder: m.rightHolder.name,
        amount: m.debtAmount || m.maxAmount || "不明",
      });
    }

    mortgagesByProperty.push({ propertyName, mortgages });
  }

  // --- Compare mortgages across properties ---
  const mortgageMatch = checkMortgageMatch(
    mortgagesByProperty,
    differences,
    warnings
  );

  // --- Compare joint mortgage register references ---
  const jointMortgageMatch = checkJointMortgageMatch(
    properties,
    differences,
    warnings
  );

  return {
    ownerMatch,
    ownerDetails,
    mortgageMatch,
    mortgageDetails,
    jointMortgageMatch,
    differences,
    warnings,
  };
}

/**
 * Get current owner (last active ownership entry in kou section).
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
 * Format a human-readable property name from ToukiData.
 */
function formatPropertyName(data: ToukiData): string {
  const typeLabel =
    data.property.type === "land"
      ? "土地"
      : data.property.type === "building"
        ? "建物"
        : "区分建物";
  return `${data.property.location} ${typeLabel}（${data.property.number}）`;
}

/**
 * Get all active mortgage entries from the otsu section.
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
 * Check whether owners match across all properties.
 * Populates differences array with any discrepancies found.
 */
function checkOwnerMatch(
  ownersByProperty: {
    propertyName: string;
    owners: { name: string; address: string }[];
  }[],
  differences: string[]
): boolean {
  if (ownersByProperty.length < 2) {
    return true;
  }

  const first = ownersByProperty[0];
  const firstNames = new Set(first.owners.map((o) => o.name));
  const firstAddresses = new Map(first.owners.map((o) => [o.name, o.address]));

  let allMatch = true;

  for (let i = 1; i < ownersByProperty.length; i++) {
    const current = ownersByProperty[i];
    const currentNames = new Set(current.owners.map((o) => o.name));

    // Check name match
    const missingInCurrent = [...firstNames].filter(
      (name) => !currentNames.has(name)
    );
    const extraInCurrent = [...currentNames].filter(
      (name) => !firstNames.has(name)
    );

    if (missingInCurrent.length > 0) {
      allMatch = false;
      differences.push(
        `「${current.propertyName}」に所有者「${missingInCurrent.join("、")}」が含まれていません（「${first.propertyName}」には存在）。`
      );
    }

    if (extraInCurrent.length > 0) {
      allMatch = false;
      differences.push(
        `「${current.propertyName}」に所有者「${extraInCurrent.join("、")}」が追加されています（「${first.propertyName}」には存在しない）。`
      );
    }

    // Check address match for common owners
    for (const owner of current.owners) {
      const firstAddress = firstAddresses.get(owner.name);
      if (firstAddress && firstAddress !== owner.address) {
        allMatch = false;
        differences.push(
          `所有者「${owner.name}」の住所が異なります。「${first.propertyName}」: ${firstAddress} ／「${current.propertyName}」: ${owner.address}`
        );
      }
    }
  }

  return allMatch;
}

/**
 * Check whether mortgage holders and amounts match across properties.
 * Populates differences and warnings arrays.
 */
function checkMortgageMatch(
  mortgagesByProperty: {
    propertyName: string;
    mortgages: OtsuEntry[];
  }[],
  differences: string[],
  warnings: string[]
): boolean {
  if (mortgagesByProperty.length < 2) {
    return true;
  }

  // Build a normalized set of mortgage keys (holder + amount) per property
  const mortgageSets = mortgagesByProperty.map(
    ({ propertyName, mortgages }) => {
      const keys = mortgages.map((m) => {
        const amount = m.debtAmount || m.maxAmount || "";
        return `${m.rightHolder.name}|${amount}`;
      });
      return { propertyName, keys: new Set(keys), mortgages };
    }
  );

  const first = mortgageSets[0];
  let allMatch = true;

  for (let i = 1; i < mortgageSets.length; i++) {
    const current = mortgageSets[i];

    const missingInCurrent = [...first.keys].filter(
      (key) => !current.keys.has(key)
    );
    const extraInCurrent = [...current.keys].filter(
      (key) => !first.keys.has(key)
    );

    if (missingInCurrent.length > 0) {
      allMatch = false;
      for (const key of missingInCurrent) {
        const [holder, amount] = key.split("|");
        differences.push(
          `「${current.propertyName}」に抵当権（権利者: ${holder}、金額: ${amount || "不明"}）が設定されていません（「${first.propertyName}」には存在）。`
        );
      }
    }

    if (extraInCurrent.length > 0) {
      allMatch = false;
      for (const key of extraInCurrent) {
        const [holder, amount] = key.split("|");
        differences.push(
          `「${current.propertyName}」に追加の抵当権（権利者: ${holder}、金額: ${amount || "不明"}）が存在します（「${first.propertyName}」には存在しない）。`
        );
      }
    }

    // Also compare mortgage counts for a general warning
    if (first.mortgages.length !== current.mortgages.length) {
      warnings.push(
        `抵当権の件数が異なります。「${first.propertyName}」: ${first.mortgages.length}件、「${current.propertyName}」: ${current.mortgages.length}件`
      );
    }
  }

  return allMatch;
}

/**
 * Check joint mortgage register references for consistency across properties.
 * If properties share a joint mortgage, they should reference each other.
 */
function checkJointMortgageMatch(
  properties: ToukiData[],
  differences: string[],
  warnings: string[]
): boolean {
  let allMatch = true;

  // Collect all joint mortgage register numbers across properties
  const registersByProperty: {
    propertyName: string;
    registerNumbers: Set<string>;
    referencedLocations: Map<string, string[]>;
  }[] = [];

  for (const data of properties) {
    const propertyName = formatPropertyName(data);
    const registerNumbers = new Set<string>();
    const referencedLocations = new Map<string, string[]>();

    // From joint mortgage registers
    for (const reg of data.jointMortgageRegisters) {
      registerNumbers.add(reg.registerNumber);
      const locations = reg.properties.map(
        (p) => `${p.location} ${p.number}`
      );
      referencedLocations.set(reg.registerNumber, locations);
    }

    // From otsu entries with joint mortgage references
    for (const entry of data.otsuSection) {
      if (entry.isActive && !entry.strikethrough && entry.jointMortgageRef) {
        registerNumbers.add(entry.jointMortgageRef);
      }
    }

    registersByProperty.push({
      propertyName,
      registerNumbers,
      referencedLocations,
    });
  }

  // Find register numbers that appear in multiple properties
  const allRegisters = new Map<string, string[]>();
  for (const { propertyName, registerNumbers } of registersByProperty) {
    for (const regNum of registerNumbers) {
      if (!allRegisters.has(regNum)) {
        allRegisters.set(regNum, []);
      }
      allRegisters.get(regNum)!.push(propertyName);
    }
  }

  // Check for registers that only appear in one property but should appear in multiple
  for (const [regNum, propertyNames] of allRegisters) {
    if (propertyNames.length === 1) {
      // Check if the joint mortgage register references other properties in our set
      const sourceProperty = registersByProperty.find((p) =>
        p.registerNumbers.has(regNum)
      );

      if (sourceProperty && sourceProperty.referencedLocations.has(regNum)) {
        const referencedLocs =
          sourceProperty.referencedLocations.get(regNum)!;

        // Check if any referenced locations match other properties in the comparison
        for (const other of properties) {
          if (formatPropertyName(other) === sourceProperty.propertyName) {
            continue;
          }

          const isReferenced = referencedLocs.some(
            (loc) =>
              loc.includes(other.property.location) ||
              loc.includes(other.property.number)
          );

          if (isReferenced) {
            const otherHasRegister = registersByProperty
              .find((p) => p.propertyName === formatPropertyName(other))
              ?.registerNumbers.has(regNum);

            if (!otherHasRegister) {
              allMatch = false;
              differences.push(
                `共同担保目録「${regNum}」が「${sourceProperty.propertyName}」には存在しますが、参照先の「${formatPropertyName(other)}」には対応する記載がありません。`
              );
            }
          }
        }
      } else {
        warnings.push(
          `共同担保目録「${regNum}」は「${propertyNames[0]}」のみに存在します。他の物件との関連を確認してください。`
        );
      }
    }
  }

  // Check consistency: if two properties share a register number, verify the references
  for (const [regNum, propertyNames] of allRegisters) {
    if (propertyNames.length >= 2) {
      for (const {
        propertyName,
        referencedLocations,
      } of registersByProperty) {
        if (!referencedLocations.has(regNum)) {
          continue;
        }
        const refs = referencedLocations.get(regNum)!;

        // Each other property that shares this register should be referenced
        for (const otherName of propertyNames) {
          if (otherName === propertyName) continue;
          const otherData = properties.find(
            (p) => formatPropertyName(p) === otherName
          );
          if (!otherData) continue;

          const isReferenced = refs.some(
            (loc) =>
              loc.includes(otherData.property.location) ||
              loc.includes(otherData.property.number)
          );

          if (!isReferenced) {
            warnings.push(
              `共同担保目録「${regNum}」の「${propertyName}」側の記載に「${otherName}」への参照が見つかりません。`
            );
          }
        }
      }
    }
  }

  return allMatch;
}

export interface RiskFlag {
  type: RiskType;
  severity: "high" | "medium" | "low";
  message: string;
  relatedEntry: number;
}

export type RiskType =
  | "seizure"
  | "provisional_reg"
  | "repurchase"
  | "trust"
  | "revolving_mortgage"
  | "debtor_mismatch"
  | "address_change"
  | "old_mortgage"
  | "multiple_owners"
  | "inheritance"
  | "other";

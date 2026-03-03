import { RiskFlag } from "./risk";

export interface ToukiData {
  meta: {
    id: string;
    uploadedAt: string;
    source: "pdf" | "text" | "scan";
    rawText: string;
    parseConfidence: number;
  };
  property: {
    type: "land" | "building" | "condominium";
    location: string;
    number: string;
    landCategory?: string;
    area?: string;
    structure?: string;
    buildingType?: string;
    floorAreas?: {
      floor: string;
      area: string;
    }[];
  };
  kouSection: KouEntry[];
  otsuSection: OtsuEntry[];
  jointMortgageRegisters: JointMortgageRegister[];
}

export interface KouEntry {
  rankNumber: number;
  purpose: string;
  receptionDate: string;
  receptionNumber: string;
  cause: string;
  causeDate: string;
  rightHolder: {
    name: string;
    address: string;
    share?: string;
  }[];
  isActive: boolean;
  strikethrough: boolean;
  subEntries?: SubEntry[];
}

export interface OtsuEntry {
  rankNumber: number;
  purpose: string;
  receptionDate: string;
  receptionNumber: string;
  rightType: string;
  cause: string;
  debtAmount?: string;
  maxAmount?: string;
  interestRate?: string;
  damageRate?: string;
  debtor?: {
    name: string;
    address: string;
  };
  rightHolder: {
    name: string;
    address: string;
  };
  jointMortgageRef?: string;
  isActive: boolean;
  strikethrough: boolean;
  subEntries?: SubEntry[];
  riskFlags: RiskFlag[];
}

export interface SubEntry {
  subNumber: string;
  purpose: string;
  receptionDate: string;
  receptionNumber: string;
  details: string;
}

export interface JointMortgageRegister {
  registerNumber: string;
  properties: {
    location: string;
    number: string;
    description: string;
  }[];
}

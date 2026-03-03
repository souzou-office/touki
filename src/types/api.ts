import { ToukiData } from "./touki";

export interface ParseRequest {
  text?: string;
  fileId?: string;
}

export interface ParseResponse {
  success: boolean;
  data?: ToukiData;
  warnings: string[];
  error?: string;
}

export interface PropertyListItem {
  id: string;
  name: string;
  propertyType: "land" | "building" | "condominium";
  parseConfidence: number;
  createdAt: string;
  riskSummary: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface CompareSession {
  id: string;
  name: string;
  propertyIds: string[];
  createdAt: string;
}

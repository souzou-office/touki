import { ToukiData } from "@/types/touki";

export interface StoredProperty {
  id: string;
  name: string;
  propertyType: "land" | "building" | "condominium";
  rawText: string;
  parsedData: ToukiData;
  parseConfidence: number;
  createdAt: string;
  updatedAt: string;
}

// In-memory store for MVP
const properties = new Map<string, StoredProperty>();

export function getProperties(): StoredProperty[] {
  return Array.from(properties.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getProperty(id: string): StoredProperty | undefined {
  return properties.get(id);
}

export function saveProperty(property: StoredProperty): void {
  properties.set(property.id, property);
}

export function deleteProperty(id: string): boolean {
  return properties.delete(id);
}

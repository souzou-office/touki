import { z } from "zod/v4";

const SubEntrySchema = z.object({
  subNumber: z.string(),
  purpose: z.string(),
  receptionDate: z.string(),
  receptionNumber: z.string(),
  details: z.string(),
});

const RiskFlagSchema = z.object({
  type: z.enum([
    "seizure",
    "provisional_reg",
    "repurchase",
    "trust",
    "revolving_mortgage",
    "debtor_mismatch",
    "address_change",
    "old_mortgage",
    "multiple_owners",
    "inheritance",
    "other",
  ]),
  severity: z.enum(["high", "medium", "low"]),
  message: z.string(),
  relatedEntry: z.number(),
});

const RightHolderSchema = z.object({
  name: z.string(),
  address: z.string(),
  share: z.string().optional(),
});

const KouEntrySchema = z.object({
  rankNumber: z.number(),
  purpose: z.string(),
  receptionDate: z.string(),
  receptionNumber: z.string(),
  cause: z.string(),
  causeDate: z.string(),
  rightHolder: z.array(RightHolderSchema),
  isActive: z.boolean(),
  strikethrough: z.boolean(),
  subEntries: z.array(SubEntrySchema).optional(),
});

const DebtorSchema = z.object({
  name: z.string(),
  address: z.string(),
});

const OtsuRightHolderSchema = z.object({
  name: z.string(),
  address: z.string(),
});

const OtsuEntrySchema = z.object({
  rankNumber: z.number(),
  purpose: z.string(),
  receptionDate: z.string(),
  receptionNumber: z.string(),
  rightType: z.string(),
  cause: z.string(),
  debtAmount: z.string().optional(),
  maxAmount: z.string().optional(),
  interestRate: z.string().optional(),
  damageRate: z.string().optional(),
  debtor: DebtorSchema.optional(),
  rightHolder: OtsuRightHolderSchema,
  jointMortgageRef: z.string().optional(),
  isActive: z.boolean(),
  strikethrough: z.boolean(),
  subEntries: z.array(SubEntrySchema).optional(),
  riskFlags: z.array(RiskFlagSchema),
});

const JointMortgageRegisterSchema = z.object({
  registerNumber: z.string(),
  properties: z.array(
    z.object({
      location: z.string(),
      number: z.string(),
      description: z.string(),
    })
  ),
});

const FloorAreaSchema = z.object({
  floor: z.string(),
  area: z.string(),
});

export const ToukiDataSchema = z.object({
  meta: z.object({
    id: z.string(),
    uploadedAt: z.string(),
    source: z.enum(["pdf", "text", "scan"]),
    rawText: z.string(),
    parseConfidence: z.number().min(0).max(1),
  }),
  property: z.object({
    type: z.enum(["land", "building", "condominium"]),
    location: z.string(),
    number: z.string(),
    landCategory: z.string().optional(),
    area: z.string().optional(),
    structure: z.string().optional(),
    buildingType: z.string().optional(),
    floorAreas: z.array(FloorAreaSchema).optional(),
  }),
  kouSection: z.array(KouEntrySchema),
  otsuSection: z.array(OtsuEntrySchema),
  jointMortgageRegisters: z.array(JointMortgageRegisterSchema),
});

export type ValidatedToukiData = z.infer<typeof ToukiDataSchema>;

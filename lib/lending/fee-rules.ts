import type { FeeRule } from "./fees";

export const PERSONAL_LOAN_PROCESSING_FEE_RULES: FeeRule[] = [
  {
    minAmount: 1,
    maxAmount: 5_000,
    feeAmount: 300,
  },
  {
    minAmount: 5_001,
    maxAmount: 10_000,
    feeAmount: 350,
  },
  {
    minAmount: 10_001,
    maxAmount: 20_000,
    feeAmount: 400,
  },
];
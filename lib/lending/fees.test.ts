import {
  calculateProcessingFee,
} from "./fees";

import {
  PERSONAL_LOAN_PROCESSING_FEE_RULES,
} from "./fee-rules";

function assertEqual(actual: unknown, expected: unknown) {
  if (actual !== expected) {
    throw new Error(
      `Expected ${expected}, received ${actual}`
    );
  }
}

// Lower boundary
assertEqual(
  calculateProcessingFee(
    1,
    PERSONAL_LOAN_PROCESSING_FEE_RULES
  ).feeAmount,
  300
);

// Upper boundary
assertEqual(
  calculateProcessingFee(
    5_000,
    PERSONAL_LOAN_PROCESSING_FEE_RULES
  ).feeAmount,
  300
);

// First dollar of next tier
assertEqual(
  calculateProcessingFee(
    5_001,
    PERSONAL_LOAN_PROCESSING_FEE_RULES
  ).feeAmount,
  350
);

// Second tier upper boundary
assertEqual(
  calculateProcessingFee(
    10_000,
    PERSONAL_LOAN_PROCESSING_FEE_RULES
  ).feeAmount,
  350
);

// Third tier
assertEqual(
  calculateProcessingFee(
    10_001,
    PERSONAL_LOAN_PROCESSING_FEE_RULES
  ).feeAmount,
  400
);

// Third tier upper boundary
assertEqual(
  calculateProcessingFee(
    20_000,
    PERSONAL_LOAN_PROCESSING_FEE_RULES
  ).feeAmount,
  400
);

// No rule above $20,000 yet
let threw = false;

try {
  calculateProcessingFee(
    20_001,
    PERSONAL_LOAN_PROCESSING_FEE_RULES
  );
} catch {
  threw = true;
}

assertEqual(threw, true);

console.log("Fee engine tests passed.");
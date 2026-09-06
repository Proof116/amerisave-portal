export type FeeRule = {
  minAmount: number;
  maxAmount: number | null;
  feeAmount: number;
};

export type ProcessingFeeResult = {
  loanAmount: number;
  feeAmount: number;
  rule: FeeRule;
};

/**
 * Finds the processing fee for a loan amount.
 *
 * Rules are inclusive:
 *   $1 - $5,000       => $300
 *   $5,001 - $10,000  => $350
 *   $10,001 - $20,000 => $400
 */
export function calculateProcessingFee(
  loanAmount: number,
  rules: FeeRule[]
): ProcessingFeeResult {
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
    throw new Error("Loan amount must be greater than zero.");
  }

  if (!Array.isArray(rules) || rules.length === 0) {
    throw new Error("At least one fee rule is required.");
  }

  const sortedRules = [...rules].sort(
    (a, b) => a.minAmount - b.minAmount
  );

  const matchingRule = sortedRules.find((rule) => {
    const meetsMinimum = loanAmount >= rule.minAmount;

    const meetsMaximum =
      rule.maxAmount === null ||
      loanAmount <= rule.maxAmount;

    return meetsMinimum && meetsMaximum;
  });

  if (!matchingRule) {
    throw new Error(
      `No processing fee rule applies to loan amount ${loanAmount}.`
    );
  }

  return {
    loanAmount,
    feeAmount: matchingRule.feeAmount,
    rule: matchingRule,
  };
}
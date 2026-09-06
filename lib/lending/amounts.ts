export function parseLoanAmount(value: unknown): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Loan amount must be greater than zero.");
    }

    return value;
  }

  if (typeof value !== "string") {
    throw new Error("Loan amount must be a number.");
  }

  const normalized = value
    .replace(/[$,\s]/g, "")
    .trim();

  if (!normalized) {
    throw new Error("Loan amount is required.");
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid loan amount.");
  }

  return amount;
}

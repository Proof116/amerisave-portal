export type LoanTermsInput = {
  principal: number;
  apr: number;
  termMonths: number;
};

export type LoanTerms = {
  principal: number;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
};

export function calculateLoanTerms({
  principal,
  apr,
  termMonths,
}: LoanTermsInput): LoanTerms {
  if (!Number.isFinite(principal) || principal <= 0) {
    throw new Error("Loan amount must be greater than zero.");
  }

  if (!Number.isFinite(apr) || apr < 0) {
    throw new Error("APR must be zero or greater.");
  }

  if (!Number.isInteger(termMonths) || termMonths <= 0) {
    throw new Error("Loan term must be a positive number of months.");
  }

  const monthlyRate = apr / 100 / 12;

  const monthlyPayment =
    monthlyRate === 0
      ? principal / termMonths
      : (principal * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -termMonths));

  const roundedMonthlyPayment = roundCurrency(monthlyPayment);
  const totalRepayment = roundCurrency(
    roundedMonthlyPayment * termMonths
  );
  const totalInterest = roundCurrency(totalRepayment - principal);

  return {
    principal: roundCurrency(principal),
    apr,
    termMonths,
    monthlyPayment: roundedMonthlyPayment,
    totalRepayment,
    totalInterest,
  };
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

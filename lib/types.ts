export type LoanType = "home" | "personal";

export type LoanApplication = {
  id: string;
  loanType: LoanType;
  status: "draft" | "submitted" | "under_review" | "approved" | "declined";
  createdAt: string;
  answers: Record<string, string>;
};

export type DemoAccount = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  loggedIn: boolean;
  applications: LoanApplication[];
};
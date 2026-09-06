"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type LoanType = "home" | "personal";

type Question = {
  id: string;
  title: string;
  description?: string;
  options?: string[];
  placeholder?: string;
};

const homeLoanQuestions: Question[] = [
  {
    id: "purpose",
    title: "What are you looking to do?",
    options: [
      "Buy a home",
      "Refinance my current home",
      "Access home equity",
    ],
  },
  {
    id: "state",
    title: "Where is the property located?",
    description: "Choose the state where the property is located.",
    options: [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Florida",
      "Georgia",
      "Illinois",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "New Jersey",
      "New York",
      "North Carolina",
      "Ohio",
      "Oregon",
      "Pennsylvania",
      "Texas",
      "Virginia",
      "Washington",
      "Other",
    ],
  },
  {
    id: "homeValue",
    title: "What is the estimated value of the home?",
    description: "An estimate is fine for now.",
    placeholder: "Example: $400,000",
  },
  {
    id: "loanAmount",
    title: "How much financing are you looking for?",
    description: "Enter an approximate amount.",
    placeholder: "Example: $300,000",
  },
  {
    id: "employment",
    title: "What best describes your employment?",
    options: [
      "Employed",
      "Self-employed",
      "Retired",
      "Other",
    ],
  },
];

const personalLoanQuestions: Question[] = [
  {
    id: "purpose",
    title: "What would you use the personal loan for?",
    options: [
      "Debt consolidation",
      "Home improvement",
      "Major purchase",
      "Unexpected expense",
      "Other",
    ],
  },
  {
    id: "loanAmount",
    title: "How much financing are you looking for?",
    description: "Enter an approximate amount.",
    placeholder: "Example: $25,000",
  },
  {
    id: "employment",
    title: "What best describes your employment?",
    options: [
      "Employed",
      "Self-employed",
      "Retired",
      "Other",
    ],
  },
  {
    id: "incomeRange",
    title: "What is your approximate annual income range?",
    description: "This is only for the initial application flow.",
    options: [
      "Under $25,000",
      "$25,000 – $49,999",
      "$50,000 – $74,999",
      "$75,000 – $99,999",
      "$100,000 – $149,999",
      "$150,000+",
    ],
  },
];

export default function ApplyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loanType, setLoanType] = useState<LoanType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [savingApplication, setSavingApplication] = useState(false);

  const questions = useMemo(() => {
    if (loanType === "home") return homeLoanQuestions;
    if (loanType === "personal") return personalLoanQuestions;
    return [];
  }, [loanType]);

  const currentQuestion = questions[currentStep];

  const totalSteps = questions.length;

  const progress =
    totalSteps > 0
      ? ((currentStep + 1) / totalSteps) * 100
      : 0;

  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id] || ""
    : "";

  function selectLoanType(type: LoanType) {
    setLoanType(type);
    setCurrentStep(0);
    setAnswers({});
    setShowSummary(false);
  }

  function updateAnswer(value: string) {
    if (!currentQuestion) return;

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: value,
    }));
  }

  function handleContinue() {
    if (!currentAnswer.trim()) return;

    if (currentStep < totalSteps - 1) {
      setCurrentStep((step) => step + 1);
      return;
    }

    setShowSummary(true);
  }

  function handleBack() {
    if (showSummary) {
      setShowSummary(false);
      setCurrentStep(totalSteps - 1);
      return;
    }

    if (currentStep === 0) {
      setLoanType(null);
      setAnswers({});
      return;
    }

    setCurrentStep((step) => step - 1);
  }

  function editApplication() {
    setShowSummary(false);
    setCurrentStep(0);
  }

 async function continueToAccount() {
  if (!loanType) return;

  const pendingApplication = {
    loanType,
    answers,
  };

  setApplicationError("");
  setSavingApplication(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingApplication),
    });

    if (!response.ok) {
      setApplicationError("Unable to save your application. Please try again.");
      setSavingApplication(false);
      return;
    }

    router.push("/dashboard");
    return;
  }

  sessionStorage.setItem(
    "pendingApplication",
    JSON.stringify(pendingApplication)
  );

  router.push(`/create-account?loanType=${loanType}`);
}

  function getQuestionTitle(id: string) {
    const question = questions.find((item) => item.id === id);
    return question?.title || id;
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-[#172033]">
      <header className="border-b border-[#dfe4ec] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            AMERISAVE
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-[#687386] hover:text-[#1769e0]"
          >
            Exit
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-12">
        {!loanType ? (
          <>
            <div className="mb-10 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#1769e0]">
                Get started
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                What type of financing are you looking for?
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-[#687386]">
                Choose an option below to begin. We&apos;ll ask a
                few questions to understand what you&apos;re looking
                for.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => selectLoanType("home")}
                className="rounded-2xl border border-[#dfe4ec] bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#1769e0] hover:shadow-md"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#eaf2ff] text-2xl">
                  🏠
                </div>

                <h2 className="text-xl font-bold">
                  Home Loan
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#687386]">
                  Buy a home, refinance your current home, or
                  explore home equity options.
                </p>

                <div className="mt-6 font-semibold text-[#1769e0]">
                  Start Home Loan →
                </div>
              </button>

              <button
                type="button"
                onClick={() => selectLoanType("personal")}
                className="rounded-2xl border border-[#dfe4ec] bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#1769e0] hover:shadow-md"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#eaf2ff] text-2xl">
                  💳
                </div>

                <h2 className="text-xl font-bold">
                  Personal Loan
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#687386]">
                  Explore financing for debt consolidation,
                  home improvements, purchases, and other needs.
                </p>

                <div className="mt-6 font-semibold text-[#1769e0]">
                  Start Personal Loan →
                </div>
              </button>
            </div>
          </>
        ) : showSummary ? (
          <>
            <div className="mb-8 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#1769e0]">
                Review
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                Review your application
              </h1>

              <p className="mt-3 text-[#687386]">
                Make sure everything looks correct before continuing.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#dfe4ec] bg-white shadow-sm">
              <div className="border-b border-[#dfe4ec] bg-[#f8fafc] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#687386]">
                      Financing type
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {loanType === "home"
                        ? "Home Loan"
                        : "Personal Loan"}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf2ff] text-xl">
                    {loanType === "home" ? "🏠" : "💳"}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[#dfe4ec]">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-sm text-[#687386]">
                      {getQuestionTitle(question.id)}
                    </div>

                    <div className="font-semibold sm:text-right">
                      {answers[question.id] || "Not provided"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={editApplication}
                className="w-full rounded-xl border border-[#dfe4ec] bg-white px-6 py-4 font-semibold transition hover:border-[#1769e0] hover:text-[#1769e0]"
              >
                Edit Application
              </button>

              <button
                type="button"
                onClick={continueToAccount}
                disabled={savingApplication}
                className="w-full rounded-xl bg-[#1769e0] px-6 py-4 font-semibold text-white transition hover:bg-[#0f56c7]"
              >
                {savingApplication
                  ? "Saving Application..."
                  : "Continue to Account"}
              </button>
            </div>

            {applicationError && (
              <p className="mt-4 text-center text-sm text-red-700">
                {applicationError}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {loanType === "home"
                    ? "Home Loan"
                    : "Personal Loan"}
                </span>

                <span className="text-[#687386]">
                  Step {currentStep + 1} of {totalSteps}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#e5e9f0]">
                <div
                  className="h-full rounded-full bg-[#1769e0] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#dfe4ec] bg-white p-7 shadow-sm sm:p-10">
              <button
                type="button"
                onClick={handleBack}
                className="mb-8 text-sm font-medium text-[#687386] hover:text-[#1769e0]"
              >
                ← Back
              </button>

              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {currentQuestion.title}
                </h1>

                {currentQuestion.description && (
                  <p className="mt-3 text-[#687386]">
                    {currentQuestion.description}
                  </p>
                )}
              </div>

              {currentQuestion.options ? (
                <div className="grid gap-3">
                  {currentQuestion.options.map((option) => {
                    const selected = currentAnswer === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateAnswer(option)}
                        className={`rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-[#1769e0] bg-[#eaf2ff] text-[#1769e0]"
                            : "border-[#dfe4ec] bg-white hover:border-[#1769e0]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {option}
                          </span>

                          {selected && (
                            <span className="font-bold">✓</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(event) =>
                    updateAnswer(event.target.value)
                  }
                  placeholder={currentQuestion.placeholder}
                  className="w-full rounded-xl border border-[#dfe4ec] px-4 py-4 outline-none transition focus:border-[#1769e0] focus:ring-2 focus:ring-[#1769e0]/10"
                />
              )}

              <button
                type="button"
                onClick={handleContinue}
                disabled={!currentAnswer.trim()}
                className="mt-8 w-full rounded-xl bg-[#1769e0] px-6 py-4 font-semibold text-white transition hover:bg-[#0f56c7] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {currentStep === totalSteps - 1
                  ? "Review Application"
                  : "Continue"}
              </button>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-[#687386]">
              This initial questionnaire is for demonstration
              purposes. Sensitive information should only be collected
              through a properly secured, authorized application system.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
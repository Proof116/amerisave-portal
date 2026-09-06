import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">

            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#1769e0]">
                Home Financing
              </p>

              <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-[#172033] sm:text-5xl lg:text-6xl">
                Move closer to the home you want.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[#687386]">
                Explore your home financing options through a simple,
                straightforward experience designed to help you move forward
                with confidence.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/apply"
                  className="rounded-lg bg-[#1769e0] px-7 py-4 text-center font-bold text-white shadow-sm transition hover:bg-[#0f56c7]"
                >
                  Get Started
                </a>

                <a
                  href="#loans"
                  className="rounded-lg border-2 border-[#1769e0] px-7 py-4 text-center font-bold text-[#1769e0] transition hover:bg-[#eef5ff]"
                >
                  Explore Options
                </a>
              </div>

              <p className="mt-5 text-sm text-[#687386]">
                Checking your options may not affect your credit score.
              </p>
            </div>

            {/* Hero Card */}
            <div className="rounded-2xl border border-[#dfe4ec] bg-[#f8faff] p-6 shadow-sm sm:p-8">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-[#687386]">
                  START YOUR JOURNEY
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#172033]">
                  Find the right path for your home.
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#687386]">
                  Answer a few questions and we'll help you explore the next
                  steps.
                </p>

                <a
                  href="/apply"
                  className="mt-6 block rounded-lg bg-[#1769e0] px-5 py-3 text-center font-bold text-white"
                >
                  Begin Application
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* Loan Options */}
        <section id="loans" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1769e0]">
              Loan Options
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#172033]">
              Financing built around your goals.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <LoanCard
              title="Buy a Home"
              description="Explore financing options for purchasing a new home."
            />

            <LoanCard
              title="Refinance"
              description="Review options for an existing mortgage."
            />

            <LoanCard
              title="Home Equity"
              description="Explore ways to access available home equity."
            />

          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="bg-white px-5 py-16 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1769e0]">
                How It Works
              </p>

              <h2 className="mt-3 text-3xl font-bold text-[#172033]">
                A simpler way to get started.
              </h2>
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-3">

              <Step
                number="01"
                title="Tell us about your goals"
                description="Answer a few questions about the home financing you're considering."
              />

              <Step
                number="02"
                title="Create your account"
                description="Set up a secure account so you can save your progress."
              />

              <Step
                number="03"
                title="Continue your application"
                description="Return to your secure dashboard to review and continue."
              />

            </div>
          </div>
        </section>

        {/* Help */}
        <section
          id="help"
          className="mx-auto max-w-7xl px-5 py-16 lg:px-8"
        >
          <div className="rounded-2xl bg-[#172033] px-6 py-10 text-white sm:px-10">
            <h2 className="text-2xl font-bold">
              Need help?
            </h2>

            <p className="mt-3 max-w-xl text-white/70">
              Our support experience will eventually give customers a secure
              way to get assistance with their application.
            </p>

            <button
              type="button"
              className="mt-6 rounded-lg bg-white px-6 py-3 font-bold text-[#172033]"
            >
              Contact Support
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#dfe4ec] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[#687386] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} AmeriSave</p>

          <div className="flex gap-5">
            <a href="/privacy" className="hover:text-[#1769e0]">
              Privacy
            </a>

            <a href="/terms" className="hover:text-[#1769e0]">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoanCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#dfe4ec] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eef5ff] text-xl font-bold text-[#1769e0]">
        +
      </div>

      <h3 className="mt-5 text-xl font-bold text-[#172033]">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-[#687386]">
        {description}
      </p>

      <a
        href="/apply"
        className="mt-5 inline-block font-bold text-[#1769e0]"
      >
        Learn more →
      </a>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="text-sm font-bold tracking-widest text-[#1769e0]">
        {number}
      </div>

      <h3 className="mt-3 text-xl font-bold text-[#172033]">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-[#687386]">
        {description}
      </p>
    </div>
  );
}
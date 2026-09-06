export default function LoanDisclosuresPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm md:p-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            AmeriSave
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
            Loan Disclosures
          </h1>

          <p className="mt-4 text-sm text-gray-500">
            Important information about applications, fees, approvals, and
            funding
          </p>

          <div className="mt-10 space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                Applications Are Subject to Review
              </h2>
              <p className="mt-3 leading-7">
                Submitting an application does not guarantee approval, a
                particular loan amount, interest rate, repayment term, or
                funding date. Applications may be subject to identity,
                eligibility, income, credit, documentation, underwriting, and
                other applicable requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                Loan Terms
              </h2>
              <p className="mt-3 leading-7">
                Actual loan terms, including applicable interest rates, fees,
                repayment schedules, and other material terms, will depend on
                the applicable loan product and the borrower's eligibility.
                Required disclosures will be provided before a borrower becomes
                obligated under applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                Processing Fees
              </h2>
              <p className="mt-3 leading-7">
                A processing fee may apply to an eligible application where
                permitted by applicable law and the applicable loan agreement.
                The current application workflow may display a $300 processing
                fee where that fee applies.
              </p>

              <p className="mt-3 leading-7">
                Any applicable fee must be clearly disclosed before payment.
                Payment of a fee does not guarantee approval, loan funding, or
                access to loan proceeds.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                Payment Processing
              </h2>
              <p className="mt-3 leading-7">
                Where online payment is offered, payment information is
                processed through the applicable payment provider. Payment
                confirmation does not by itself mean that a loan has been
                funded or that loan proceeds are available.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                Loan Funding
              </h2>
              <p className="mt-3 leading-7">
                Loan proceeds should only be represented as available after
                the applicable funding process has actually been completed.
                An application status of approved does not, by itself, mean
                that funds have been disbursed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                Eligibility and Availability
              </h2>
              <p className="mt-3 leading-7">
                Loan products and eligibility requirements may vary by product,
                borrower circumstances, and applicable jurisdiction. Availability
                is subject to applicable legal and regulatory requirements.
              </p>

              <p className="mt-3 leading-7">
                State-specific licensing, eligibility, and disclosure
                information should be confirmed before this page is used for
                real borrower applications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                Questions About Your Application
              </h2>

              <div className="mt-4 rounded-2xl bg-gray-50 p-5">
                <p>
                  <strong>Email:</strong>{" "}
                  support.mail.amerisave@gmail.com
                </p>

                <p className="mt-2">
                  <strong>Phone:</strong> +1 (804) 963-6866
                </p>

                <p className="mt-2">
                  <strong>Location:</strong> Texas
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-semibold text-amber-900">
                Compliance Review Required
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                This page is a preliminary technical disclosure draft. Before
                accepting applications or payments from real borrowers, the
                disclosures, fee structure, licensing information, state
                availability, and loan terms should be reviewed and approved
                by qualified lending and compliance professionals.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

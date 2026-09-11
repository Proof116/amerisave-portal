export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm md:p-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            GetSaved Support
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
            Contact Us
          </h1>

          <p className="mt-4 max-w-2xl text-gray-600">
            Have a question about your account, application, documents, or
            payment? Our support team is available to help.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Email Support
              </h2>

              <p className="mt-3 text-gray-600">
                For account and application questions:
              </p>

              <a
                href="mailto:support.mail.amerisave@gmail.com"
                className="mt-3 inline-block font-medium text-blue-600 hover:text-blue-700"
              >
                support.mail.amerisave@gmail.com
              </a>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Phone Support
              </h2>

              <p className="mt-3 text-gray-600">
                Contact our support team by phone:
              </p>

              <a
                href="tel:+18049636866"
                className="mt-3 inline-block font-medium text-blue-600 hover:text-blue-700"
              >
                +1 (804) 963-6866
              </a>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Application Support
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              If you already have an account, please sign in before contacting
              us when possible. This can help our team locate the appropriate
              application or account information.
            </p>

            <p className="mt-3 leading-7 text-gray-600">
              For your security, do not send passwords, full Social Security
              numbers, bank passwords, payment-card numbers, or other highly
              sensitive credentials by email.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-semibold text-amber-900">
              Important Notice
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Support information and operating hours should be confirmed
              before this page is used as the official customer-support
              channel. Additional required regulatory and accessibility
              information may also need to be added after compliance review.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

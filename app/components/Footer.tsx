import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">GetSaved</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              A modern home and personal lending experience.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Company</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Link
                href="/contact"
                className="block text-gray-600 hover:text-gray-900"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="block text-gray-600 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-gray-600 hover:text-gray-900"
              >
                Terms of Use
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Loan Information</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Link
                href="/loan-disclosures"
                className="block text-gray-600 hover:text-gray-900"
              >
                Loan Disclosures
              </Link>
              <Link
                href="/apply"
                className="block text-gray-600 hover:text-gray-900"
              >
                Apply Now
              </Link>
              <Link
                href="/login"
                className="block text-gray-600 hover:text-gray-900"
              >
                Customer Login
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Support</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <p>support.mail.amerisave@gmail.com</p>
              <p>+1 (804) 963-6866</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <p className="text-xs leading-5 text-gray-500">
            © {new Date().getFullYear()} GetSaved. All rights reserved.
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-500">
            Loan applications are subject to eligibility, verification,
            underwriting, and applicable terms and conditions. Submission of
            an application does not guarantee approval or funding.
          </p>
        </div>
      </div>
    </footer>
  );
}

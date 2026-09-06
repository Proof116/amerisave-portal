import Link from "next/link";

export default function AdminNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/admin"
            className="text-xl font-bold text-slate-900"
          >
            Admin Command Center
          </Link>

          <p className="text-xs text-slate-500">
            Loan operations & customer management
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/applications"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Applications
          </Link>

          <Link
            href="/admin/customers"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Customers
          </Link>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
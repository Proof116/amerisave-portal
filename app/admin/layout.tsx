import Link from "next/link";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <Link
              href="/admin"
              className="text-xl font-bold tracking-tight text-blue-700"
            >
              AMERISAVE
            </Link>

            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Administration
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-600 hover:text-blue-700"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-blue-700"
            >
              Customer Portal
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
"use client";

import { LoanApplication } from "@/lib/types";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [applications, setApplications] = useState<LoanApplication[]>([]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#dfe4ec] bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        
        {/* Logo */}
        <a
          href="/"
          className="text-2xl font-bold tracking-[0.22em] text-[#1769e0]"
        >
          AMERISAVE
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#loans"
            className="text-sm font-semibold text-[#172033] transition hover:text-[#1769e0]"
          >
            Home Loans
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-semibold text-[#172033] transition hover:text-[#1769e0]"
          >
            How It Works
          </a>

          <a
            href="#help"
            className="text-sm font-semibold text-[#172033] transition hover:text-[#1769e0]"
          >
            Help
          </a>

          <a
            href="/login"
            className="rounded-lg border-2 border-[#1769e0] px-5 py-2.5 text-sm font-bold text-[#1769e0] transition hover:bg-[#1769e0] hover:text-white"
          >
            Sign In
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          className="rounded-lg p-2 text-[#172033] md:hidden"
        >
          <span className="text-2xl">
            {menuOpen ? "×" : "☰"}
          </span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="border-t border-[#dfe4ec] bg-white px-5 py-5 md:hidden">
          <div className="flex flex-col gap-5">
            <a href="#loans" className="font-semibold">
              Home Loans
            </a>

            <a href="#how-it-works" className="font-semibold">
              How It Works
            </a>

            <a href="#help" className="font-semibold">
              Help
            </a>

            <a
              href="/login"
              className="rounded-lg bg-[#1769e0] px-5 py-3 text-center font-bold text-white"
            >
              Sign In
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ApplicationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") ?? ""
  );

  const status = searchParams.get("status") ?? "";
  const type = searchParams.get("type") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (status) {
      params.set("status", status);
    }

    if (type) {
      params.set("type", type);
    }

    if (sort !== "newest") {
      params.set("sort", sort);
    }

    const query = params.toString();

    router.push(
      query
        ? `/admin/applications?${query}`
        : "/admin/applications"
    );
  }

  function handleFilterChange(
    name: string,
    value: string
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    router.push(
      `/admin/applications${
        params.toString()
          ? `?${params.toString()}`
          : ""
      }`
    );
  }

  function clearFilters() {
    setSearch("");
    router.push("/admin/applications");
  }

  return (
    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-[1fr_180px_180px_180px_auto]"
      >

        {/* Search */}

        <div>
          <label
            htmlFor="search"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Search
          </label>

          <input
            id="search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Customer or application ID"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Status */}

        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) =>
              handleFilterChange(
                "status",
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">
              Under Review
            </option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {/* Loan Type */}

        <div>
          <label
            htmlFor="type"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Loan Type
          </label>

          <select
            id="type"
            value={type}
            onChange={(event) =>
              handleFilterChange(
                "type",
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Types</option>
            <option value="home">Home Loans</option>
            <option value="personal">
              Personal Loans
            </option>
          </select>
        </div>

        {/* Sort */}

        <div>
          <label
            htmlFor="sort"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Sort
          </label>

          <select
            id="sort"
            value={sort}
            onChange={(event) =>
              handleFilterChange(
                "sort",
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>
          </select>
        </div>

        {/* Search Button */}

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Search
          </button>
        </div>

      </form>

      {/* Clear */}

      {(search || status || type || sort !== "newest") && (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
        >
          Clear all filters
        </button>
      )}

    </div>
  );
}
// src/pages/AdminDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/* ---------------- Types ---------------- */
type PostRow = {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  cover: string | null;
  category: string | null;
  tags: string[] | null;
  author_name: string | null;
  author_avatar: string | null;
  published_at: string | null; // ISO (date)
  read_time: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type FetchResult = {
  rows: PostRow[];
  total: number;
};

/* ---------------- Utils ---------------- */
const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso ?? "—";
  }
};

const cls = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

const PAGE_SIZE = 10;

/* ---------------- Page ---------------- */
export default function AdminDashboard(): React.ReactElement {
  const navigate = useNavigate();

  // Filters / pagination
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [page, setPage] = useState<number>(1);

  // Data
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // KPIs
  const [kpiTotal, setKpiTotal] = useState<number>(0);
  const [kpiLast30, setKpiLast30] = useState<number>(0);
  const [kpiAvgRead, setKpiAvgRead] = useState<string>("—");
  const [kpiCats, setKpiCats] = useState<number>(0);

  // Re-run when filters/page change
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { rows, total } = await fetchPosts({ page, q, category });
        if (!alive) return;
        setPosts(rows);
        setTotal(total);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page, q, category]);

  // Initial KPI load (lightweight, counts only)
  useEffect(() => {
    let alive = true;
    (async () => {
      // total
      const tRes = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true });
      if (alive) setKpiTotal(tRes.count ?? 0);

      // last 30 days (by published_at)
      const d = new Date();
      d.setDate(d.getDate() - 30);
      const last30 = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .gte("published_at", d.toISOString().slice(0, 10));
      if (alive) setKpiLast30(last30.count ?? 0);

      // avg read time (best-effort: parse leading number from "6 min" etc.)
      const r = await supabase.from("posts").select("read_time").limit(500);
      if (alive) {
        const mins = (r.data ?? [])
          .map((x) => Number(String(x.read_time ?? "").match(/\d+/)?.[0] ?? 0))
          .filter((n) => !Number.isNaN(n) && n > 0);
        const avg = mins.length
          ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length)
          : 0;
        setKpiAvgRead(avg ? `${avg} min` : "—");
      }

      // unique categories
      const cats = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null)
        .limit(1000);
      if (alive) {
        const uniq = new Set((cats.data ?? []).map((x) => x.category as string));
        setKpiCats(uniq.size);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => setPage(1), [q, category]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;

      // refresh current page; if page becomes empty, go back one page
      const newCount = total - 1;
      const lastPage = Math.max(1, Math.ceil(newCount / PAGE_SIZE));
      if (page > lastPage) setPage(lastPage);
      else {
        const { rows, total: newTotal } = await fetchPosts({ page, q, category });
        setPosts(rows);
        setTotal(newTotal);
      }
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Header + KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-slate-600">
            Manage blog posts. Create, edit, publish, and monitor performance.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/posts/new")}
          className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          New Post
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Posts" value={String(kpiTotal)} />
        <KpiCard title="Published (30 days)" value={String(kpiLast30)} />
        <KpiCard title="Avg Read Time" value={kpiAvgRead} />
        <KpiCard title="Categories" value={String(kpiCats)} />
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative w-full md:max-w-sm">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title/excerpt/tags…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm bg-white"
        >
          <option value="All">All categories</option>
          <CategoryOptions />
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th className="min-w-[320px]">Title</Th>
              <Th>Category</Th>
              <Th>Published</Th>
              <Th>Read</Th>
              <Th className="text-right pr-4">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No posts found.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="font-semibold text-slate-800 line-clamp-2">
                      {p.title}
                    </div>
                    <div className="text-slate-500 line-clamp-1">
                      {p.excerpt || "—"}
                    </div>
                  </td>
                  <td className="p-3">
                    {p.category ? (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                        {p.category}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3">{fmtDate(p.published_at)}</td>
                  <td className="p-3">{p.read_time || "—"}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/blog/${p.slug || p.id}`}
                        className="text-slate-600 hover:underline"
                        title="View"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => navigate(`/admin/posts/${p.id}`)}
                        className="text-blue-600 hover:underline"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className={cls(
                          "text-rose-600 hover:underline disabled:opacity-50",
                          deletingId === p.id && "pointer-events-none"
                        )}
                        title="Delete"
                      >
                        {deletingId === p.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          {posts.length ? (
            <>
              Showing{" "}
              <span className="font-semibold">
                {(page - 1) * PAGE_SIZE + 1}–
                {(page - 1) * PAGE_SIZE + posts.length}
              </span>{" "}
              of <span className="font-semibold">{total}</span>
            </>
          ) : (
            "—"
          )}
        </div>

        <div className="flex items-center gap-2">
          <PageBtn onClick={() => setPage(1)} disabled={page <= 1}>
            «
          </PageBtn>
          <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            ‹
          </PageBtn>
          <span className="text-sm">
            Page <strong>{page}</strong> / {Math.max(1, Math.ceil(total / PAGE_SIZE))}
          </span>
          <PageBtn
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / PAGE_SIZE)}
          >
            ›
          </PageBtn>
          <PageBtn
            onClick={() => setPage(Math.max(1, Math.ceil(total / PAGE_SIZE)))}
            disabled={page >= Math.ceil(total / PAGE_SIZE)}
          >
            »
          </PageBtn>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Fetch helper (server-side filters + count) ---------------- */
async function fetchPosts({
  page,
  q,
  category,
}: {
  page: number;
  q: string;
  category: string;
}): Promise<FetchResult> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, cover, category, tags, author_name, author_avatar, published_at, read_time, updated_at",
      { count: "exact" }
    )
    .order("published_at", { ascending: false })
    .range(from, to);

  const term = q.trim();
  if (term) {
    // search in title/excerpt/tags
    // NOTE: Supabase OR filter syntax
    const like = `%${term}%`;
    query = query.or(
      `title.ilike.${like},excerpt.ilike.${like},tags.cs.{${term}}`
    );
  }

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error(error);
    return { rows: [], total: 0 };
  }
  return { rows: (data ?? []) as PostRow[], total: count ?? 0 };
}

/* ---------------- Small bits ---------------- */
function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={cls("px-3 py-2 text-left text-xs font-semibold uppercase", className)}>{children}</th>;
}

function PageBtn({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cls(
        "inline-flex h-9 w-9 items-center justify-center rounded-md ring-1 ring-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

/** Options pull live categories for the select (client-only convenience). */
function CategoryOptions(): React.ReactElement {
  const [cats, setCats] = React.useState<string[]>([]);
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null)
        .order("category", { ascending: true })
        .limit(1000);
      if (error) return console.error(error);
      const uniq = Array.from(new Set((data ?? []).map((x) => String(x.category))));
      setCats(uniq);
    })();
  }, []);
  return (
    <>
      {cats.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </>
  );
}

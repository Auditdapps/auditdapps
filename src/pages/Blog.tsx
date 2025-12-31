// src/pages/Blog.tsx
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

/* --------------------------- TYPES --------------------------- */
type Post = {
  id: string;
  slug?: string | null;
  title: string;
  excerpt?: string | null;
  cover?: string | null;
  author_name?: string | null;
  author_avatar?: string | null;
  category?: string | null;
  tags?: string[] | null;
  read_time?: string | null;
  published_at?: string | null; // ISO date
};

type SearchBarProps = {
  value: string;
  onChange: (v: string) => void;
};

type CategoryPillsProps = {
  value: string;
  onChange: (v: string) => void;
  categories: string[];
};

type PostCardProps = {
  post: Post;
};

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
};

/* --------------------------- PAGE --------------------------- */
export default function Blog(): React.ReactElement {
  const [query, setQuery] = useState<string>("");
  const [category, setCategory] = useState<string>("All");
  const [page, setPage] = useState<number>(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const PER_PAGE = 6;

  // Reset to page 1 when filters change
  useEffect(() => setPage(1), [query, category]);

  // Fetch categories (deduped) from Supabase
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null);

      if (error) {
        // Don't block page if this fails; keep default categories ["All"]
        console.error("Category load failed:", error);
        return;
      }

      const uniq = Array.from(
        new Set((data ?? []).map((r) => (r as { category: string | null }).category!).filter(Boolean))
      );
      if (active) setCategories(["All", ...uniq]);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Fetch posts (server-side filtering + pagination)
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * PER_PAGE;
      let q = supabase
        .from("posts")
        .select(
          "id, slug, title, excerpt, cover, author_name, author_avatar, category, tags, read_time, published_at",
          { count: "exact" }
        )
        .order("published_at", { ascending: false });

      if (category !== "All") {
        q = q.eq("category", category);
      }

      const qStr = query.trim();
      if (qStr) {
        // Search in title OR excerpt (case-insensitive)
        q = q.or(`title.ilike.%${qStr}%,excerpt.ilike.%${qStr}%`);
      }

      const { data, error, count } = await q.range(offset, offset + PER_PAGE - 1);

      if (error) {
        console.error(error);
        if (active) {
          setError("Failed to load posts.");
          setPosts([]);
          setTotalCount(0);
        }
      } else if (active) {
        setPosts((data ?? []) as Post[]);
        setTotalCount(count ?? (data?.length ?? 0));
      }

      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [query, category, page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PER_PAGE)),
    [totalCount]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 to-white" />
        <div className="container mx-auto px-4 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-700/80 bg-blue-50 ring-1 ring-blue-100 px-3 py-1 rounded-full">
              Insights & Guides
            </p>
            <h1 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-tight">
              Audit DApps Blog
              <span className="block text-blue-600">
                Security, DeFi, and engineering playbooks.
              </span>
            </h1>
            <p className="mt-4 text-slate-600">
              Actionable tutorials, checklists, and architecture notes from the team building
              AI-assisted self-audits.
            </p>
          </motion.div>

          {/* Controls */}
          <div className="mt-8 flex flex-col md:flex-row gap-3 md:items-center">
            <SearchBar value={query} onChange={setQuery} />
            <CategoryPills value={category} onChange={setCategory} categories={categories} />
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white">
                <div className="aspect-[16/10] w-full bg-slate-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {posts.length ? (
                <motion.div
                  key={`${category}-${query}-${page}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {posts.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                    >
                      <PostCard post={p} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600"
                >
                  No posts found. Try a different search or category.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}

            {/* Newsletter CTA */}
            <div className="mt-16">
              <Newsletter />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

/* --------------------------- SUB COMPONENTS --------------------------- */
function SearchBar({ value, onChange }: SearchBarProps): React.ReactElement {
  return (
    <div className="relative w-full md:max-w-sm">
      <input
        aria-label="Search blog posts"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search articles, e.g. reentrancy, RLS, pre-audits…"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
  );
}

function CategoryPills({
  value,
  onChange,
  categories,
}: CategoryPillsProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => {
        const active = value === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition ${
              active
                ? "bg-blue-600 text-white ring-blue-600"
                : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

function PostCard({ post }: PostCardProps): React.ReactElement {
  const to = `/blog/${post.slug || post.id}`;
  const tags = (post.tags ?? []).slice(0, 3);

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md focus-within:shadow-md">
      <Link to={to} className="block rounded-t-2xl overflow-hidden">
        <div className="aspect-[16/10] w-full bg-slate-100">
          {post.cover ? (
            <img
              src={post.cover}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : null}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {post.category ? (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700 ring-1 ring-blue-100">
              {post.category}
            </span>
          ) : null}
          {post.published_at && (
            <>
              {post.category && <span>•</span>}
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            </>
          )}
          {post.read_time && (
            <>
              <span>•</span>
              <span>{post.read_time}</span>
            </>
          )}
        </div>

        <h3 className="mt-2 text-lg font-bold tracking-tight">
          <Link to={to} className="hover:text-blue-700">
            {post.title}
          </Link>
        </h3>

        {post.excerpt && <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt=""
                className="h-7 w-7 rounded-full ring-1 ring-slate-200"
                loading="lazy"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-slate-200" />
            )}
            <div className="text-sm text-slate-700">
              {post.author_name || "Audit DApps Team"}
            </div>
          </div>
          <div className="hidden sm:flex flex-wrap gap-1">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function Pagination({ page, totalPages, onChange }: PaginationProps): React.ReactElement {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const buttonBase =
    "inline-flex items-center justify-center h-9 w-9 rounded-md ring-1 ring-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed";

  const pages = makeWindow(page, totalPages);

  return (
    <nav className="flex items-center gap-2" aria-label="Pagination">
      <button className={buttonBase} onClick={() => onChange(1)} disabled={!canPrev} aria-label="First">
        «
      </button>
      <button className={buttonBase} onClick={() => onChange(page - 1)} disabled={!canPrev} aria-label="Previous">
        ‹
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={
              p === page
                ? "h-9 px-3 rounded-md bg-blue-600 text-white text-sm font-semibold"
                : "h-9 px-3 rounded-md ring-1 ring-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50"
            }
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button className={buttonBase} onClick={() => onChange(page + 1)} disabled={!canNext} aria-label="Next">
        ›
      </button>
      <button className={buttonBase} onClick={() => onChange(totalPages)} disabled={!canNext} aria-label="Last">
        »
      </button>
    </nav>
  );
}

function Newsletter(): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 md:p-10"
    >
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-100 blur-3xl" />
      <div className="relative">
        <h4 className="text-xl font-bold tracking-tight">Get the monthly security brief</h4>
        <p className="mt-1 text-slate-600 text-sm">
          Short, practical updates on smart-contract security. No spam, unsubscribe anytime.
        </p>
        <form
          className="mt-4 flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const email = fd.get("email") as string | null;
            if (!email) return;
            alert(`Subscribed: ${email}`); // replace with your API call
            e.currentTarget.reset();
          }}
        >
          <input
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="w-full sm:flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Subscribe
          </button>
        </form>
      </div>
    </motion.div>
  );
}

/* --------------------------- UTILS --------------------------- */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Returns a small window like [1, …, 4, 5, 6, …, 12] */
function makeWindow(page: number, total: number, pad = 1): Array<number | "…"> {
  const pages: Array<number | "…"> = [];
  const start = Math.max(1, page - pad);
  const end = Math.min(total, page + pad);
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("…");
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total) {
    if (end < total - 1) pages.push("…");
    pages.push(total);
  }
  return pages;
}

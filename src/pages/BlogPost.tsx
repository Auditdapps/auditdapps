// src/pages/BlogPost.tsx
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../lib/supabaseClient";

/* ----------------------- Types ----------------------- */
type PostRecord = {
  id: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  cover?: string | null;
  category?: string | null;
  tags?: string[] | string | null;
  author_name?: string | null;
  author_avatar?: string | null;
  published_at?: string | null; // ISO
  read_time?: string | null;
  slug?: string | null;
};

type RelatedPost = Pick<
  PostRecord,
  "id" | "title" | "excerpt" | "cover" | "category" | "published_at" | "read_time" | "slug"
>;

type LoadState = "loading" | "ready" | "error";

function isUuid(v: string): boolean {
  // uuid v4-ish check (good enough for routing)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

/* ----------------------- Page ----------------------- */
export default function BlogPost(): React.ReactElement {
  const { id } = useParams<{ id: string }>(); // route param can be slug OR id
  const navigate = useNavigate();

  const [post, setPost] = useState<PostRecord | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    let active = true;
    (async () => {
      setState("loading");
      if (!id) {
        if (active) setState("error");
        return;
      }

      try {
        // Fetch by slug when param isn't a UUID; otherwise by id
        const query = supabase.from("posts").select("*").limit(1);
        const { data: rows, error } = isUuid(id)
          ? await query.eq("id", id)
          : await query.eq("slug", id);

        if (error) throw error;
        const p = rows?.[0] as PostRecord | undefined;

        if (!p) {
          if (active) setState("error");
          return;
        }

        // Related
        let rel: RelatedPost[] = [];
        if (p.category) {
          const { data } = await supabase
            .from("posts")
            .select("id, slug, title, excerpt, cover, category, published_at, read_time")
            .eq("category", p.category)
            .neq("id", p.id)
            .order("published_at", { ascending: false })
            .limit(3);
          rel = (data ?? []) as RelatedPost[];
        } else {
          const { data } = await supabase
            .from("posts")
            .select("id, slug, title, excerpt, cover, category, published_at, read_time")
            .neq("id", p.id)
            .order("published_at", { ascending: false })
            .limit(3);
          rel = (data ?? []) as RelatedPost[];
        }

        if (!active) return;
        setPost(p);
        setRelated(rel);
        setState("ready");
      } catch (e) {
        console.error(e);
        if (active) setState("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  if (state === "loading") return <LoadingSkeleton />;

  if (state === "error" || !post) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-red-600 font-semibold">We couldn't load this article.</p>
          <button
            onClick={() => navigate("/blog")}
            className="mt-4 inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Back to Blog
          </button>
        </div>
      </main>
    );
  }

  const tags: string[] = Array.isArray(post.tags)
    ? post.tags
    : post.tags
    ? String(post.tags).split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const formattedDate = safeDate(post.published_at);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 to-white" />
        <div className="container mx-auto px-4 pt-10 pb-6 md:pt-16 md:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl"
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-700/80 bg-blue-50 ring-1 ring-blue-100 px-3 py-1 rounded-full"
            >
              ← Back to Blog
            </Link>

            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
              {post.title}
            </h1>

            {post.excerpt && <p className="mt-4 text-slate-600">{post.excerpt}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <AuthorBadge name={post.author_name ?? undefined} avatar={post.author_avatar ?? undefined} />
              <span>•</span>
              <time dateTime={post.published_at ?? undefined}>{formattedDate}</time>
              {post.read_time && (
                <>
                  <span>•</span>
                  <span>{post.read_time}</span>
                </>
              )}
              {post.category && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    {post.category}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      {post.cover && (
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="rounded-2xl overflow-hidden border border-slate-200 bg-white"
          >
            <img
              src={post.cover}
              alt=""
              className="w-full h-auto object-cover aspect-[16/8]"
              loading="lazy"
            />
          </motion.div>
        </div>
      )}

      {/* Article + Sidebar */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Article */}
          <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm"
          >
            <div className="prose prose-slate max-w-none prose-img:rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content ?? ""}</ReactMarkdown>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Link
                    key={t}
                    to={`/blog?tag=${encodeURIComponent(t)}`}
                    className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="mt-8 border-t pt-6 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Share:</span>
              <ShareButton
                label="Twitter / X"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.title
                )}&url=${encodeURIComponent(window.location.href)}`}
              />
              <ShareButton
                label="LinkedIn"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  window.location.href
                )}`}
              />
              <ShareButton
                label="Copy link"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              />
            </div>
          </motion.article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <AuthorCard
              name={post.author_name ?? undefined}
              avatar={post.author_avatar ?? undefined}
              bio="Writes about smart-contract security, DeFi, and engineering workflows."
            />
            <NewsletterCard />
            {related.length > 0 && <RelatedPosts posts={related} />}
          </aside>
        </div>
      </section>
    </main>
  );
}

/* ----------------------- Subcomponents ----------------------- */

function LoadingSkeleton(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <div className="h-5 w-40 rounded bg-slate-200 animate-pulse" />
          <div className="h-10 w-3/4 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="mt-8 h-64 w-full rounded-2xl bg-slate-200 animate-pulse" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="space-y-3">
              <div className="h-5 w-1/2 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}

function AuthorBadge({ name, avatar }: { name?: string; avatar?: string }): React.ReactElement {
  return (
    <span className="inline-flex items-center gap-2">
      {avatar ? (
        <img src={avatar} alt="" className="h-7 w-7 rounded-full ring-1 ring-slate-200" />
      ) : (
        <span className="h-7 w-7 rounded-full bg-slate-200 inline-block" />
      )}
      <span className="text-sm text-slate-700">{name || "Audit DApps"}</span>
    </span>
  );
}

function AuthorCard({
  name,
  avatar,
  bio,
}: {
  name?: string;
  avatar?: string;
  bio: string;
}): React.ReactElement {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt="" className="h-10 w-10 rounded-full ring-1 ring-slate-200" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-slate-200" />
        )}
        <div>
          <div className="font-semibold text-slate-800">{name || "Audit DApps Team"}</div>
          <div className="text-xs text-slate-500">Editor</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600">{bio}</p>
    </div>
  );
}

function NewsletterCard(): React.ReactElement {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-800">Get new posts monthly</h4>
      <p className="mt-1 text-slate-600 text-sm">
        Short, practical updates on smart-contract security.
      </p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const email = new FormData(e.currentTarget).get("email") as string | null;
          if (email) alert(`Subscribed: ${email}`); // replace with API call
          e.currentTarget.reset();
        }}
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}

function RelatedPosts({ posts }: { posts: RelatedPost[] }): React.ReactElement {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-800">Related posts</h4>
      <div className="mt-3 space-y-4">
        {posts.map((p) => (
          <Link
            key={p.id}
            to={`/blog/${p.slug || p.id}`}
            className="group flex gap-3 items-center"
          >
            <div className="h-16 w-24 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200">
              {p.cover ? (
                <img
                  src={p.cover}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="line-clamp-2 text-sm font-semibold group-hover:text-blue-700">
                {p.title}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {safeDate(p.published_at)} • {p.read_time || "—"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ShareButton({
  label,
  href,
  onClick,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
}): React.ReactElement {
  const base =
    "inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base}>
        {label}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={base}>
      {label}
    </button>
  );
}

/* ----------------------- Utilities ----------------------- */
function safeDate(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso ?? "";
  }
}

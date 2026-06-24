import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { blogDb } from "@/lib/firebase";
import type { Post } from "./blog";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [{ title: "Blog — Vishal Gurung" }],
  }),
  component: BlogPost,
});

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function BlogPost() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(
          query(collection(blogDb, "posts"), where("slug", "==", slug)),
        );
        if (snap.empty) {
          setPost(null);
        } else {
          const doc = snap.docs[0];
          setPost({
            id: doc.id,
            ...(doc.data() as Omit<Post, "id" | "createdAt">),
            createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
          });
        }
      } catch (e) {
        console.error(e);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24 animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-32" />
        <div className="h-10 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full mt-8" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/5" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24 text-center">
        <h1 className="font-display text-4xl">Post not found</h1>
        <p className="mt-4 text-muted-foreground">That slug doesn't match any post.</p>
        <Link to="/blog" className="inline-block mt-8 ink-link">
          ← Back to blog
        </Link>
      </div>
    );
  }

  const paragraphs = post.content.split(/\n\n+/).filter(Boolean);

  return (
    <article className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
        ← Blog
      </Link>

      {post.doodleUrl && (
        <div className="paper-card p-3 mb-10 wobble rotate-1 max-w-sm">
          <span className="tape" />
          <img
            src={post.doodleUrl}
            alt=""
            className="w-full h-auto rounded-md"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-sm text-clay tracking-widest uppercase">
          {formatDate(post.createdAt)}
        </span>
        {post.tags?.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-card border border-border"
          >
            {tag}
          </span>
        ))}
      </div>

      <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight">
        {post.title}
      </h1>

      <p className="mt-5 text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>

      <div className="mt-10 border-t border-border pt-10 space-y-5">
        {paragraphs.map((p, i) => (
          <p key={i} className="leading-[1.85] text-[1.05rem]">
            {p}
          </p>
        ))}
      </div>

      <div className="mt-16 pt-10 border-t border-border flex items-center justify-between">
        <p className="text-muted-foreground text-sm">— Vishal · 東京</p>
        <Link to="/blog" className="ink-link text-sm">
          ← All posts
        </Link>
      </div>
    </article>
  );
}

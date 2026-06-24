import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { blogDb } from "@/lib/firebase";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Vishal Gurung" },
      { name: "description", content: "Thoughts, notes, and doodle-backed posts by Vishal Gurung (goblin)." },
      { property: "og:title", content: "Blog — Vishal Gurung" },
    ],
  }),
  component: Blog,
});

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  doodleUrl?: string;
  createdAt: Date;
  tags: string[];
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(query(collection(blogDb, "posts"), orderBy("createdAt", "desc")));
        setPosts(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Post, "id" | "createdAt">),
            createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
          })),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <p className="text-sm tracking-widest uppercase text-clay">Writing</p>
      <h1 className="font-display font-extrabold text-5xl sm:text-6xl mt-3">Blog</h1>
      <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
        Notes on building things, drawing things, and existing in Japan.
      </p>

      <div className="mt-14 space-y-8">
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="paper-card p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-4" />
                <div className="h-7 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="paper-card p-10 text-center relative">
            <span className="tape" />
            <p className="font-display text-2xl">Nothing written yet</p>
            <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
              Stories and thoughts will show up here once I start writing. Check back soon.
            </p>
          </div>
        )}

        {!loading &&
          posts.map((post) => (
            <Link
              key={post.id}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="block paper-card p-6 sm:p-8 wobble group"
            >
              <div className="flex flex-col sm:flex-row sm:gap-8 items-start">
                {post.doodleUrl && (
                  <img
                    src={post.doodleUrl}
                    alt=""
                    className="w-full sm:w-36 h-auto sm:h-36 rounded-lg object-cover mb-5 sm:mb-0 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-xs text-clay tracking-widest uppercase">
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
                  <h2 className="font-display font-bold text-2xl sm:text-3xl group-hover:underline decoration-accent decoration-2 underline-offset-2 transition-all">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <p className="mt-4 text-sm font-medium">Read more →</p>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { blogDb, doodleDb } from "@/lib/firebase";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [counts, setCounts] = useState({ posts: 0, projects: 0, doodles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [posts, projects, doodles] = await Promise.all([
        getDocs(collection(blogDb, "posts")),
        getDocs(collection(blogDb, "projects")),
        getDocs(collection(doodleDb, "doodles")),
      ]);
      setCounts({ posts: posts.size, projects: projects.size, doodles: doodles.size });
      setLoading(false);
    }
    load().catch(console.error);
  }, []);

  const cards = [
    { label: "Blog posts", count: counts.posts, to: "/admin/blog", cta: "Write something →", emoji: "✍" },
    { label: "Projects", count: counts.projects, to: "/admin/projects", cta: "Add a project →", emoji: "◣" },
    { label: "Doodles", count: counts.doodles, to: "/admin/doodles", cta: "Manage the wall →", emoji: "✏" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <p className="text-sm tracking-widest uppercase text-clay">Admin</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-2 mb-10">Your content</h1>

      <div className="grid sm:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <Link
            key={c.to}
            to={c.to}
            className="paper-card p-6 wobble relative group block hover:shadow-md transition-shadow"
          >
            {i === 0 && <span className="tape" />}
            <p className="text-2xl mb-4">{c.emoji}</p>
            <p className="text-xs uppercase tracking-widest text-clay">{c.label}</p>
            <p className="font-display text-5xl mt-1">
              {loading ? <span className="w-10 h-8 bg-muted rounded animate-pulse inline-block" /> : c.count}
            </p>
            <p className="text-sm text-muted-foreground mt-5 group-hover:text-foreground transition-colors">
              {c.cta}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 paper-card p-6 relative">
        <span className="tape" />
        <p className="text-xs uppercase tracking-widest text-clay mb-3">Quick links</p>
        <div className="flex flex-wrap gap-2">
          <Link to="/" className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
            ← View site
          </Link>
          <Link to="/blog" className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
            Blog →
          </Link>
          <Link to="/projects" className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
            Projects →
          </Link>
          <Link to="/doodles" className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
            Doodles →
          </Link>
        </div>
      </div>
    </div>
  );
}

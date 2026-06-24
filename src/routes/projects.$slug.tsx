import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { blogDb } from "@/lib/firebase";
import type { Project } from "./projects.index";
import mapImg from "@/assets/project-reality-map.jpg";
import doodle1 from "@/assets/doodle-1.jpg";
import doodle2 from "@/assets/doodle-2.jpg";
import doodle3 from "@/assets/doodle-3.jpg";
import doodle4 from "@/assets/doodle-4.jpg";
import doodle5 from "@/assets/doodle-5.jpg";
import doodle6 from "@/assets/doodle-6.jpg";

const SLUG_IMAGES: Record<string, string> = {
  "reality-map": mapImg,
  autcaster: doodle5,
};
const FALLBACK_IMAGES = [doodle1, doodle2, doodle3, doodle4, doodle5, doodle6];

export const Route = createFileRoute("/projects/$slug")({
  head: () => ({ meta: [{ title: "Project — Vishal Gurung" }] }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        // try by document ID first (fastest)
        const direct = await getDoc(doc(blogDb, "projects", slug));
        if (direct.exists()) {
          setProject({ id: direct.id, ...(direct.data() as Omit<Project, "id">) });
          return;
        }
        // fall back to slug field query
        const snap = await getDocs(query(collection(blogDb, "projects"), where("slug", "==", slug)));
        if (!snap.empty) {
          const d = snap.docs[0];
          setProject({ id: d.id, ...(d.data() as Omit<Project, "id">) });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24 animate-pulse space-y-5">
        <div className="h-4 bg-muted rounded w-32" />
        <div className="h-10 bg-muted rounded w-2/3" />
        <div className="h-5 bg-muted rounded w-1/2" />
        <div className="h-40 bg-muted rounded mt-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24 text-center">
        <h1 className="font-display text-4xl">Project not found</h1>
        <Link to="/projects" className="inline-block mt-8 ink-link">← Back to projects</Link>
      </div>
    );
  }

  const p = project;
  const coverImage = p.coverImage || SLUG_IMAGES[slug] || FALLBACK_IMAGES[0];

  return (
    <article className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
        ← Projects
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 text-xs tracking-widest uppercase text-clay mb-4">
        <span>{p.role}</span>
        {p.year && <><span className="w-1 h-1 rounded-full bg-clay" /><span>{p.year}</span></>}
      </div>
      <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight">{p.name}</h1>
      <p className="mt-4 text-xl text-muted-foreground italic leading-relaxed">{p.tagline}</p>

      {/* Cover image */}
      <div className="paper-card p-4 mt-10 wobble">
        <span className="tape" />
        <img
          src={coverImage}
          alt={p.name}
          className="w-full h-auto rounded-md aspect-[16/9] object-cover"
        />
      </div>

      {/* Stack */}
      {p.stack && p.stack.length > 0 && (
        <div className="mt-10">
          <p className="text-xs tracking-widest uppercase text-clay mb-3">Stack</p>
          <div className="flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <span key={s} className="text-sm px-3 py-1 rounded-full bg-card border border-border">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {p.summary && (
        <div className="mt-10 border-t border-border pt-10">
          <p className="text-lg leading-relaxed">{p.summary}</p>
        </div>
      )}

      {/* Story */}
      {p.story && p.story.length > 0 && (
        <div className="mt-8 space-y-5">
          {p.story.map((para, i) => (
            <p key={i} className="leading-[1.85] text-[1.05rem] text-muted-foreground">{para}</p>
          ))}
        </div>
      )}

      {/* Highlights */}
      {p.highlights && p.highlights.length > 0 && (
        <div className="mt-12">
          <p className="text-xs tracking-widest uppercase text-clay mb-4">Highlights</p>
          <ul className="space-y-2">
            {p.highlights.map((h, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span className="leading-relaxed">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modules */}
      {p.modules && p.modules.length > 0 && (
        <div className="mt-12">
          <p className="text-xs tracking-widest uppercase text-clay mb-4">Architecture</p>
          <div className="space-y-3">
            {p.modules.map((m, i) => (
              <div key={i} className="paper-card p-4">
                <p className="font-mono text-sm font-medium">{m.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenges */}
      {p.challenges && p.challenges.length > 0 && (
        <div className="mt-12">
          <p className="text-xs tracking-widest uppercase text-clay mb-4">Challenges</p>
          <ul className="space-y-2">
            {p.challenges.map((c, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="mt-1.5 text-clay shrink-0">—</span>
                <span className="leading-relaxed text-muted-foreground">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Links */}
      {p.links && p.links.length > 0 && (
        <div className="mt-12 pt-10 border-t border-border flex flex-wrap gap-5">
          {p.links.map((l) =>
            l.href.startsWith("/") ? (
              <Link key={l.label} to={l.href} className="ink-link text-sm">
                {l.label} →
              </Link>
            ) : (
              <a key={l.label} className="ink-link text-sm" href={l.href} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            ),
          )}
        </div>
      )}

      <div className="mt-16 pt-10 border-t border-border flex justify-between items-center">
        <p className="text-muted-foreground text-sm">— Vishal · 東京</p>
        <Link to="/projects" className="ink-link text-sm">← All projects</Link>
      </div>
    </article>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { blogDb } from "@/lib/firebase";
import mapImg from "@/assets/project-reality-map.jpg";
import doodle1 from "@/assets/doodle-1.jpg";
import doodle2 from "@/assets/doodle-2.jpg";
import doodle3 from "@/assets/doodle-3.jpg";
import doodle4 from "@/assets/doodle-4.jpg";
import doodle5 from "@/assets/doodle-5.jpg";
import doodle6 from "@/assets/doodle-6.jpg";

// Specific image per known slug, fallback cycles through doodles
const SLUG_IMAGES: Record<string, string> = {
  "reality-map": mapImg,
  autcaster: doodle5,
};
const FALLBACK_IMAGES = [doodle1, doodle2, doodle3, doodle4, doodle5, doodle6];

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Vishal Gurung" },
      { name: "description", content: "Side projects, npm packages, and small experiments by goblin." },
      { property: "og:title", content: "Projects — Vishal Gurung" },
    ],
  }),
  component: Projects,
});

export type Project = {
  id: string;
  name: string;
  tagline: string;
  role: string;
  year: string;
  summary: string;
  story?: string[];
  highlights?: string[];
  challenges?: string[];
  modules?: { name: string; description: string }[];
  stack?: string[];
  coverImage?: string;
  links?: { label: string; href: string }[];
  slug?: string;
};

const STATIC: Project[] = [
  {
    id: "s1",
    name: "The Doodle Wall",
    role: "Web · Firebase",
    year: "2025",
    tagline: "A shared sketchbook on the internet.",
    summary: "Anyone can scribble on a tiny canvas; every drawing is saved to Firebase and tiled onto a growing wall.",
    stack: ["React", "Firebase", "Canvas API"],
    links: [{ label: "View gallery", href: "/doodles" }],
    coverImage: doodle3,
  },
  {
    id: "s2",
    name: "reality-map",
    role: "npm · TypeScript · solo",
    year: "2025",
    tagline: "Map messy real-world things into tidy data.",
    summary: "A small utility package for transforming nested, irregular real-world inputs into predictable normalized shapes.",
    stack: ["TypeScript", "Node.js"],
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/reality-map" },
      { label: "GitHub", href: "https://github.com/g0GobliN" },
    ],
    coverImage: mapImg,
  },
  {
    id: "s3",
    name: "システム開発",
    role: "Work · Japan",
    year: "ongoing",
    tagline: "System development in Tokyo.",
    summary: "Building internal systems with a small Japanese team. Lots of 確認 and careful design.",
    coverImage: doodle1,
  },
];

function Projects() {
  const [projects, setProjects] = useState<Project[]>(STATIC);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const snap = await getDocs(collection(blogDb, "projects"));
        if (!snap.empty) {
          setProjects(
            snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Project, "id">) })),
          );
        }
      } catch {
        // static fallback stays
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <p className="text-sm tracking-widest uppercase text-clay">Projects</p>
      <h1 className="font-display text-5xl sm:text-6xl mt-3">Things I've put into the world</h1>
      <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">
        A mix of side projects, packages, and the day job. Some are finished, some are forever-in-progress.
      </p>

      <div className="mt-16 space-y-20">
        {loading
          ? [1, 2, 3].map((i) => (
              <div key={i} className="grid md:grid-cols-2 gap-10 items-center animate-pulse">
                <div className="paper-card p-4">
                  <div className="w-full aspect-[4/3] bg-muted rounded-md" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded w-32" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </div>
            ))
          : projects.map((p, i) => {
              const slug = p.slug || p.id;
              const body = Array.isArray(p.story) && p.story.length > 0 ? p.story[0] : p.summary;
              const image = p.coverImage || SLUG_IMAGES[slug] || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
              return (
                <article
                  key={p.id}
                  className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
                >
                  <div className="paper-card p-4 wobble relative">
                    {i % 2 === 0 && <span className="tape" />}
                    <img
                      src={image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-auto rounded-md aspect-[4/3] object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3 text-xs tracking-widest uppercase text-clay">
                      <span>{p.role}</span>
                      {p.year && <><span className="w-1 h-1 rounded-full bg-clay" /><span>{p.year}</span></>}
                    </div>
                    <h2 className="font-display text-3xl sm:text-4xl mt-2">{p.name}</h2>
                    <p className="mt-3 text-lg text-foreground italic">{p.tagline}</p>
                    <p className="mt-4 text-muted-foreground leading-relaxed line-clamp-3">{body}</p>

                    {p.stack && p.stack.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.stack.map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-card border border-border">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-4 text-sm">
                      <Link to="/projects/$slug" params={{ slug }} className="ink-link font-medium">
                        Full story →
                      </Link>
                      {p.links?.map((l) =>
                        l.href.startsWith("/") ? (
                          <Link key={l.label} to={l.href} className="ink-link text-muted-foreground">
                            {l.label}
                          </Link>
                        ) : (
                          <a key={l.label} className="ink-link text-muted-foreground" href={l.href} target="_blank" rel="noreferrer">
                            {l.label} ↗
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
      </div>
    </div>
  );
}

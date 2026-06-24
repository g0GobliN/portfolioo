import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { blogDb } from "@/lib/firebase";
import { adminInput, adminBtn, adminBtnGhost, adminBtnDanger } from "./admin";

export const Route = createFileRoute("/admin/projects")({
  component: AdminProjects,
});

type Project = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  role: string;
  year: string;
  summary: string;
  story: string[];
  stack: string[];
  coverImage: string;
  links: string[];
};

type Form = {
  name: string;
  slug: string;
  tagline: string;
  role: string;
  year: string;
  summary: string;
  story: string;
  stack: string;
  coverImage: string;
  links: string;
};

const EMPTY: Form = { name: "", slug: "", tagline: "", role: "", year: "", summary: "", story: "", stack: "", coverImage: "", links: "" };

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchProjects() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(blogDb, "projects"));
      setProjects(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name ?? "",
            slug: data.slug ?? d.id,
            tagline: data.tagline ?? "",
            role: data.role ?? "",
            year: data.year ?? "",
            summary: data.summary ?? "",
            story: data.story ?? [],
            stack: data.stack ?? [],
            coverImage: data.coverImage ?? "",
            links: data.links ?? [],
          };
        }),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProjects(); }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setMode("form");
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, tagline: p.tagline, role: p.role,
      year: p.year, summary: p.summary, story: p.story.join("\n\n"),
      stack: p.stack.join(", "), coverImage: p.coverImage, links: p.links.join("\n"),
    });
    setError("");
    setMode("form");
  }

  function set(key: keyof Form, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !editing) next.slug = toSlug(value);
      return next;
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) { setError("Name and slug are required."); return; }
    setSaving(true);
    setError("");
    try {
      const slug = form.slug.trim();
      const data = {
        name: form.name.trim(),
        slug,
        tagline: form.tagline.trim(),
        role: form.role.trim(),
        year: form.year.trim(),
        summary: form.summary.trim(),
        story: form.story.split("\n\n").map((s) => s.trim()).filter(Boolean),
        stack: form.stack.split(",").map((s) => s.trim()).filter(Boolean),
        coverImage: form.coverImage.trim(),
        links: form.links.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      await setDoc(doc(blogDb, "projects", slug), data, { merge: true });
      await fetchProjects();
      setMode("list");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(blogDb, "projects", id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch { alert("Failed to delete."); }
    finally { setDeleting(null); }
  }

  if (mode === "form") {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <button onClick={() => setMode("list")} className="text-sm text-muted-foreground hover:text-foreground mb-8 flex items-center gap-1 transition-colors">
          ← Back to projects
        </button>
        <p className="text-sm tracking-widest uppercase text-clay">{editing ? "Editing" : "New project"}</p>
        <h1 className="font-display text-4xl mt-1 mb-8">{editing ? editing.name || "Untitled" : "Add a project"}</h1>

        <form onSubmit={save} className="space-y-6">
          {/* Basic info */}
          <div className="paper-card p-6 sm:p-8 relative space-y-6">
            <span className="tape" />
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Project name">
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="My Project" className={adminInput} />
              </Field>
              <Field label="Slug" hint="Used as the URL and doc ID">
                <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="my-project" className={adminInput} />
              </Field>
            </div>
            <Field label="Tagline" hint="One catchy line">
              <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="What this project does in one line" className={adminInput} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Your role">
                <input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Solo builder" className={adminInput} />
              </Field>
              <Field label="Year">
                <input value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2024" className={adminInput} />
              </Field>
            </div>
          </div>

          {/* Story */}
          <div className="paper-card p-6 sm:p-8 relative space-y-6">
            <Field label="Summary" hint="One sentence overview">
              <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={2} placeholder="What this project is in one sentence." className={adminInput} />
            </Field>
            <Field label="Full story" hint="The write-up. Separate paragraphs with a blank line.">
              <textarea
                value={form.story}
                onChange={(e) => set("story", e.target.value)}
                rows={10}
                placeholder={"How it started...\n\nWhat you built...\n\nWhat you learned..."}
                className={adminInput}
              />
            </Field>
          </div>

          {/* Tech + links */}
          <div className="paper-card p-6 sm:p-8 relative space-y-6">
            <span className="tape" />
            <Field label="Stack" hint="Comma-separated">
              <input value={form.stack} onChange={(e) => set("stack", e.target.value)} placeholder="TypeScript, React, Firebase" className={adminInput} />
            </Field>
            <Field label="Cover image URL" hint="Optional — paste any image URL">
              <input value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="https://..." className={adminInput} />
            </Field>
            <Field label="Links" hint="One URL per line">
              <textarea
                value={form.links}
                onChange={(e) => set("links", e.target.value)}
                rows={3}
                placeholder={"https://github.com/...\nhttps://npmjs.com/..."}
                className={adminInput}
              />
            </Field>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className={adminBtn}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add project"}
            </button>
            <button type="button" onClick={() => setMode("list")} className={adminBtnGhost}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-sm tracking-widest uppercase text-clay">Admin</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-1">Projects</h1>
        </div>
        <button onClick={openNew} className={adminBtn}>+ New project</button>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="paper-card p-6 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3 mb-3" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="paper-card p-12 text-center relative">
          <span className="tape" />
          <p className="font-display text-2xl">No projects yet</p>
          <p className="text-muted-foreground mt-2 mb-6">Add your first project to show it on your portfolio.</p>
          <button onClick={openNew} className={adminBtn}>Add your first project</button>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="space-y-4">
          {projects.map((p, i) => (
            <div key={p.id} className="paper-card p-5 sm:p-6 relative flex flex-col sm:flex-row sm:items-start gap-4">
              {i === 0 && <span className="tape" />}
              <div className="flex-1 min-w-0">
                <p className="font-display text-xl leading-tight">{p.name}</p>
                <p className="text-xs text-clay mt-1">/projects/{p.slug}</p>
                {p.tagline && <p className="text-sm text-muted-foreground italic mt-2">{p.tagline}</p>}
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  {p.role && <span>{p.role}</span>}
                  {p.year && <span>{p.year}</span>}
                </div>
                {p.stack.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {p.stack.map((s) => (
                      <span key={s} className="text-xs bg-card border border-border px-2 py-0.5 rounded-full text-clay">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(p)} className={adminBtnGhost}>Edit</button>
                <button onClick={() => remove(p.id, p.name)} disabled={deleting === p.id} className={adminBtnDanger}>
                  {deleting === p.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-clay mb-1">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-2">{hint}</p>}
      {children}
    </div>
  );
}

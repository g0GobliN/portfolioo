import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { blogDb } from "@/lib/firebase";
import { adminInput, adminBtn, adminBtnGhost, adminBtnDanger } from "./admin";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlog,
});

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  image?: string;
};

type Form = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  image: string;
};

const EMPTY: Form = { title: "", slug: "", excerpt: "", content: "", tags: "", image: "" };

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchPosts() {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(blogDb, "posts"), orderBy("createdAt", "desc")));
      setPosts(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title ?? "",
            slug: data.slug ?? "",
            excerpt: data.excerpt ?? "",
            content: data.content ?? "",
            tags: data.tags ?? [],
            image: data.image ?? "",
          };
        }),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPosts(); }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setMode("form");
  }

  function openEdit(p: Post) {
    setEditing(p);
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, tags: p.tags.join(", "), image: p.image ?? "" });
    setError("");
    setMode("form");
  }

  function set(key: keyof Form, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !editing) next.slug = toSlug(value);
      return next;
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) { setError("Title and slug are required."); return; }
    setSaving(true);
    setError("");
    try {
      const data = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        image: form.image.trim(),
      };
      if (editing) {
        await updateDoc(doc(blogDb, "posts", editing.id), data);
      } else {
        await addDoc(collection(blogDb, "posts"), { ...data, createdAt: serverTimestamp() });
      }
      await fetchPosts();
      setMode("list");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(blogDb, "posts", id));
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch { alert("Failed to delete."); }
    finally { setDeleting(null); }
  }

  if (mode === "form") {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <button onClick={() => setMode("list")} className="text-sm text-muted-foreground hover:text-foreground mb-8 flex items-center gap-1 transition-colors">
          ← Back to posts
        </button>
        <p className="text-sm tracking-widest uppercase text-clay">{editing ? "Editing" : "New post"}</p>
        <h1 className="font-display text-4xl mt-1 mb-8">{editing ? editing.title || "Untitled" : "Write something"}</h1>

        <form onSubmit={save} className="space-y-6">
          <div className="paper-card p-6 sm:p-8 relative space-y-6">
            <span className="tape" />
            <Field label="Title">
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="My post title" className={adminInput} />
            </Field>
            <Field label="Slug" hint="/blog/your-slug — auto-generated from title">
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="my-post-title" className={adminInput} />
            </Field>
            <Field label="Excerpt" hint="Short summary shown in the blog list">
              <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} placeholder="A one-line summary..." className={adminInput} />
            </Field>
          </div>

          <div className="paper-card p-6 sm:p-8 relative space-y-6">
            <Field label="Content" hint="Separate paragraphs with a blank line">
              <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={14} placeholder={"Your first paragraph.\n\nYour second paragraph."} className={adminInput} />
            </Field>
          </div>

          <div className="paper-card p-6 sm:p-8 relative space-y-6">
            <span className="tape" />
            <Field label="Tags" hint="Comma-separated">
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="design, engineering, japan" className={adminInput} />
            </Field>
            <Field label="Cover image URL" hint="Optional — paste any image URL">
              <input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." className={adminInput} />
            </Field>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className={adminBtn}>
              {saving ? "Saving…" : editing ? "Save changes" : "Publish post"}
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
          <h1 className="font-display text-4xl sm:text-5xl mt-1">Blog posts</h1>
        </div>
        <button onClick={openNew} className={adminBtn}>+ New post</button>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="paper-card p-6 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/2 mb-3" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="paper-card p-12 text-center relative">
          <span className="tape" />
          <p className="font-display text-2xl">Nothing written yet</p>
          <p className="text-muted-foreground mt-2 mb-6">Your posts will show up here once you write them.</p>
          <button onClick={openNew} className={adminBtn}>Write your first post</button>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="paper-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-display text-xl leading-tight">{p.title}</p>
                <p className="text-xs text-clay mt-1">/blog/{p.slug}</p>
                {p.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.excerpt}</p>}
                {p.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {p.tags.map((t) => (
                      <span key={t} className="text-xs bg-card border border-border px-2 py-0.5 rounded-full text-clay">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(p)} className={adminBtnGhost}>Edit</button>
                <button onClick={() => remove(p.id)} disabled={deleting === p.id} className={adminBtnDanger}>
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

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { doodleDb, doodleStorage } from "@/lib/firebase";

export const Route = createFileRoute("/admin/doodles")({
  component: AdminDoodles,
});

type Doodle = {
  id: string;
  src: string;
  caption: string;
  rot: number;
  storagePath?: string;
};

function AdminDoodles() {
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(doodleDb, "doodles"));
        setDoodles(
          snap.docs.map((d) => {
            const data = d.data();
            const src = (data.imageUrl || data.doodle) as string;
            return {
              id: d.id,
              src,
              caption: (data.caption || data.name || "untitled") as string,
              rot: (data.rot ?? data.rotation ?? 0) as number,
              storagePath: src?.includes("firebasestorage")
                ? decodeURIComponent(src.split("/o/")[1]?.split("?")[0] ?? "")
                : undefined,
            };
          }),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function remove(doodle: Doodle) {
    if (!confirm(`Delete "${doodle.caption}"?`)) return;
    setDeleting(doodle.id);
    try {
      await deleteDoc(doc(doodleDb, "doodles", doodle.id));
      if (doodle.storagePath) {
        try { await deleteObject(ref(doodleStorage, doodle.storagePath)); } catch { /* non-critical */ }
      }
      setDoodles((prev) => prev.filter((d) => d.id !== doodle.id));
    } catch {
      alert("Failed to delete.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-sm tracking-widest uppercase text-clay">Admin</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-1">Doodles</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {loading ? "Loading…" : `${doodles.length} drawing${doodles.length !== 1 ? "s" : ""} on the wall`}
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="paper-card p-2 animate-pulse">
              <div className="aspect-square bg-muted rounded-md" />
              <div className="h-2.5 bg-muted rounded mt-2 mx-2" />
            </div>
          ))}
        </div>
      )}

      {!loading && doodles.length === 0 && (
        <div className="paper-card p-12 text-center relative">
          <span className="tape" />
          <p className="font-display text-2xl">Nothing on the wall yet</p>
          <p className="text-muted-foreground mt-2">
            Go draw something on the{" "}
            <a href="/doodles" className="ink-link">doodles page</a>.
          </p>
        </div>
      )}

      {!loading && doodles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {doodles.map((d, i) => (
            <div
              key={d.id}
              className="paper-card p-2 wobble relative group"
              style={{ transform: `rotate(${d.rot * 0.5}deg)` }}
            >
              {i % 5 === 0 && <span className="tape" />}
              <img
                src={d.src}
                alt={d.caption}
                className="w-full aspect-square object-cover rounded-md"
                loading="lazy"
              />
              <p className="text-xs text-center text-muted-foreground italic mt-2 mb-0.5 truncate px-1">
                {d.caption}
              </p>
              <button
                onClick={() => remove(d)}
                disabled={deleting === d.id}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-foreground text-background text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-red-500"
              >
                {deleting === d.id ? "…" : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

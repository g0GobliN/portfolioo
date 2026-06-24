import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { doodleDb } from "@/lib/firebase";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/doodles")({
  head: () => ({
    meta: [
      { title: "Doodles — Vishal Gurung" },
      {
        name: "description",
        content: "A wall of doodles by goblin — drawn by me and anyone passing through.",
      },
      { property: "og:title", content: "Doodles — Vishal Gurung" },
    ],
  }),
  component: Doodles,
});

type Doodle = { id: string; src: string; caption: string; rot: number };

function Doodles() {
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchDoodles() {
      try {
        const snap = await getDocs(collection(doodleDb, "doodles"));
        setDoodles(
          snap.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              src: (d.imageUrl || d.doodle) as string,
              caption: (d.caption || d.name || "untitled") as string,
              rot: (d.rot ?? d.rotation ?? 0) as number,
            };
          }),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDoodles();
  }, []);

  function onNewDoodle({
    imageUrl,
    caption,
    rot,
  }: {
    imageUrl: string;
    caption: string;
    rot: number;
  }) {
    setDoodles((prev) => [{ id: `new-${Date.now()}`, src: imageUrl, caption, rot }, ...prev]);
    setOpen(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <p className="text-sm tracking-widest uppercase text-clay">Doodles</p>
          <h1 className="font-display text-5xl sm:text-6xl mt-3">The wall</h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
            A growing collection of drawings — mine and yours.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-foreground text-background text-sm font-medium shadow-md hover:bg-clay active:scale-95 transition-all"
          >
            ✏ Draw something
          </button>
          {!loading && (
            <p className="text-sm text-muted-foreground italic">
              {doodles.length} drawing{doodles.length !== 1 ? "s" : ""} · live from people like you.
            </p>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-14 columns-1 sm:columns-2 lg:columns-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-6 break-inside-avoid paper-card p-3 animate-pulse">
              <div className="w-full aspect-square bg-muted rounded-md" />
              <div className="mt-2 h-3 bg-muted rounded w-24 mx-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && doodles.length === 0 && (
        <div className="mt-14 paper-card p-12 text-center relative">
          <span className="tape" />
          <p className="font-display text-2xl">Nothing pinned yet</p>
          <p className="mt-3 text-muted-foreground">
            Be the first — hit the draw button and pin something to the wall.
          </p>
        </div>
      )}

      {/* Masonry wall */}
      {!loading && doodles.length > 0 && (
        <div className="mt-14 columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {doodles.map((d, i) => (
            <figure
              key={d.id}
              className="mb-6 break-inside-avoid paper-card p-3 wobble relative"
              style={{ transform: `rotate(${d.rot}deg)` }}
            >
              {i % 3 === 0 && <span className="tape" />}
              <img
                src={d.src}
                alt={d.caption}
                loading="lazy"
                className="w-full h-auto rounded-md"
              />
              <figcaption className="mt-2 text-center text-sm text-muted-foreground italic">
                {d.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="h-[92dvh] rounded-t-2xl px-3 pt-3 sm:px-5 sm:pt-4 flex flex-col overflow-hidden"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <SheetHeader className="mb-2 shrink-0">
            <SheetTitle className="font-display text-lg text-left">Leave a mark</SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0">
            <DrawingCanvas onSave={onNewDoodle} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

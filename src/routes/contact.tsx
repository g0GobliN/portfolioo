import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Vishal Gurung" },
      { name: "description", content: "Say hi to Vishal Gurung (goblin) — for collaborations, commissions, or just a chat." },
      { property: "og:title", content: "Contact — Vishal Gurung" },
      { property: "og:description", content: "Say hi to Vishal Gurung (goblin)." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
      <p className="text-sm tracking-widest uppercase text-clay">Contact</p>
      <h1 className="font-display text-5xl sm:text-6xl mt-3">Drop me a line.</h1>
      <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-xl">
        Freelance work, collaborations, or just to talk shop — inbox is open.
      </p>

      <div className="mt-12 grid sm:grid-cols-2 gap-5">
        <a
          href="https://github.com/g0GobliN"
          target="_blank"
          rel="noreferrer"
          className="paper-card p-6 wobble block"
        >
          <p className="text-xs tracking-widest uppercase text-clay">GitHub</p>
          <p className="font-display text-2xl mt-1">@g0GobliN</p>
          <p className="text-sm text-muted-foreground mt-2">Code, side projects, and the occasional README rant.</p>
        </a>
        <a
          href="https://instagram.com/goblin01_"
          target="_blank"
          rel="noreferrer"
          className="paper-card p-6 wobble block"
        >
          <p className="text-xs tracking-widest uppercase text-clay">Instagram</p>
          <p className="font-display text-2xl mt-1">@goblin01_</p>
          <p className="text-sm text-muted-foreground mt-2">Doodles, sketchbook pages, slices of Japan.</p>
        </a>
      </div>

      <a
        href="mailto:grgvishal.gurung17@gmail.com"
        className="mt-10 paper-card p-8 relative wobble block"
      >
        <span className="tape" />
        <p className="font-display text-2xl">Prefer email?</p>
        <p className="mt-3 text-muted-foreground">
          Reach me through either link above and I'll reply from there. I read everything, even if it takes a few days.
        </p>
      </a>

      <p className="mt-16 text-center text-sm text-muted-foreground italic">
        — Vishal · g0GobliN
      </p>
    </div>
  );
}

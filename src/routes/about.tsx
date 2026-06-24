import { createFileRoute } from "@tanstack/react-router";
import portrait from "@/assets/IMG_4029.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Vishal Gurung" },
      { name: "description", content: "From a shy Nepali kid to Tokyo engineer. The story of Vishal Gurung, aka Goblin." },
      { property: "og:title", content: "About — Vishal Gurung" },
      {
        property: "og:description",
        content: "From a shy Nepali kid to Tokyo engineer. The story of Vishal Gurung, aka Goblin.",
      },
    ],
  }),
  component: About,
});

const PARAGRAPHS = [
  `I'm Goblin, though my real name is Vishal Gurung. I'm originally from Nepal and currently working as an IT engineer in Tokyo.`,
  `Growing up, my parents gave me a phone, a computer, and plenty of video games to keep me occupied. Somewhere along the way, technology became more than just entertainment. I became curious about how things worked and started spending more time exploring, breaking, and fixing things on my computer.`,
  `While I was still in school, I started learning Japanese. There wasn't any grand plan behind it, but that decision eventually brought me to Japan before I had even decided what to study in college back home.`,
  `Since then, I've been building software, learning as much as I can, and working on real-world systems. Most days involve solving problems, debugging unexpected issues, and figuring out how to make things work a little better than they did yesterday.`,
  `Outside of work, I enjoy building open-source projects and experimenting with ideas that I find interesting. One of those projects is RealityMap, a tool I created because I wished something like it existed when I was learning and exploring codebases myself.`,
  `I'm still learning every day, but that's probably what I enjoy most about software engineering.`,
];

function About() {
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <div className="grid md:grid-cols-[1fr_1.3fr] gap-12 items-start">
        <div className="paper-card p-4 rotate-[-2deg] wobble relative md:sticky md:top-24">
          <span className="tape" />
          <img src={portrait} alt="Vishal Gurung" width={1024} height={1024} className="rounded-md w-full h-auto" />
          <p className="mt-3 text-center text-sm text-muted-foreground italic">Vishal, aka Goblin</p>
        </div>

        <div>
          <p className="text-sm tracking-widest uppercase text-clay">About</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-tight">
            From a shy Nepali kid to Tokyo engineer.
          </h1>
          <p className="mt-2 text-muted-foreground italic">No perfect plan. No genius story. Just curiosity that never really stopped.</p>

          <div className="mt-10 space-y-5 text-lg leading-relaxed text-foreground/90">
            {PARAGRAPHS.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <hr className="my-12 border-border" />

          <h2 className="font-display text-2xl">Find me</h2>
          <ul className="mt-5 space-y-2 text-foreground">
            <li>GitHub — <a className="ink-link" href="https://github.com/g0GobliN" target="_blank" rel="noreferrer">@g0GobliN</a></li>
            <li>Instagram — <a className="ink-link" href="https://instagram.com/goblin01_" target="_blank" rel="noreferrer">@goblin01_</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

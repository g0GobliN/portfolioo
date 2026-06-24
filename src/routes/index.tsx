import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-goblin.jpg";
import doodle1 from "@/assets/doodle-1.jpg";
import doodle2 from "@/assets/doodle-2.jpg";
import doodle3 from "@/assets/doodle-3.jpg";
import doodle4 from "@/assets/doodle-4.jpg";
import doodle5 from "@/assets/doodle-5.jpg";
import doodle6 from "@/assets/doodle-6.jpg";
import mapImg from "@/assets/project-reality-map.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vishal Gurung — Goblin Studio" },
      { name: "description", content: "Doodles, side projects, and system 開発 by Vishal Gurung (goblin)." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <div>
          <p className="text-sm tracking-widest uppercase text-clay mb-5">
            ◣ portfolio · {new Date().getFullYear()}
          </p>
          <h1 className="font-display font-extrabold text-5xl sm:text-7xl leading-[0.95] text-foreground">
            Vishal Gurung.<br />
            Known online as <span className="underline decoration-accent decoration-[6px] underline-offset-4">goblin</span>.
          </h1>
          <p className="mt-7 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Developer building <span className="text-foreground font-medium">システム開発</span> in Japan
            by day, shipping side projects by night.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="px-5 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-clay transition-colors"
            >
              See projects →
            </Link>
            <Link
              to="/doodles"
              className="px-5 py-3 rounded-full border border-border text-sm font-medium hover:bg-card transition-colors"
            >
              Flip through doodles
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="paper-card p-4 rotate-2 wobble relative">
            <span className="tape" />
            <img
              src={heroImg}
              alt="A friendly hand-drawn goblin"
              width={1024}
              height={1024}
              className="w-full h-auto rounded-lg"
            />
            <p className="mt-3 text-center text-sm text-muted-foreground italic">
              self-portrait — close enough
            </p>
          </div>
        </div>
      </section>

      {/* About strip */}
      <section className="bg-card/60 border-y border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 grid md:grid-cols-3 gap-10">
          {[
            { k: "01", t: "Build", d: "Web apps, internal tools, npm packages. I care about software that's sharp, fast, and doesn't get in the way." },
            { k: "02", t: "Explore", d: "Side projects, open-source experiments, and tools I built because I wished they existed. RealityMap is one of them." },
            { k: "03", t: "Japan", d: "Based in Tokyo doing system development. Bilingual-ish in 日本語 and English, working on the rest." },
          ].map((x) => (
            <div key={x.k}>
              <p className="font-display text-clay text-sm tracking-widest">{x.k}</p>
              <h3 className="font-display text-2xl mt-2">{x.t}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm tracking-widest uppercase text-clay">Selected work</p>
            <h2 className="font-display font-bold text-4xl mt-2">Recent projects</h2>
          </div>
          <Link to="/projects" className="ink-link text-sm text-muted-foreground hover:text-foreground">
            All projects →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Link
            to="/doodles"
            className="paper-card p-5 group block wobble"
          >
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[doodle1, doodle2, doodle3, doodle4, doodle5, doodle6].map((src, i) => (
                <img key={i} src={src} alt="" loading="lazy" className="rounded-md aspect-square object-cover w-full" />
              ))}
            </div>
            <p className="text-xs tracking-widest uppercase text-clay">Doodles · Web</p>
            <h3 className="font-display text-2xl mt-1">The Doodle Wall</h3>
            <p className="mt-2 text-muted-foreground">Anyone can drop a drawing on the wall. It stays there. The wall just keeps getting bigger.</p>
          </Link>

          <Link to="/projects" className="paper-card p-5 group block wobble">
            <img src={mapImg} alt="Hand-drawn map" width={1024} height={768} loading="lazy" className="rounded-md mb-5 aspect-[4/3] object-cover" />
            <p className="text-xs tracking-widest uppercase text-clay">reality-map · npm</p>
            <h3 className="font-display text-2xl mt-1">reality-map</h3>
            <p className="mt-2 text-muted-foreground">A small npm package for mapping the messy real world into tidy little data structures.</p>
          </Link>
        </div>
      </section>

      {/* Letter */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
        <div className="paper-card p-8 sm:p-12 relative">
          <span className="tape" />
          <p className="font-display text-2xl leading-relaxed">
            I like building things that actually work. Nothing fancy — just good, honest software.
            If you want to work on something together, <Link to="/contact" className="ink-link">reach out</Link>.
          </p>
          <p className="mt-6 text-muted-foreground">— Vishal · 東京</p>
        </div>
      </section>
    </div>
  );
}

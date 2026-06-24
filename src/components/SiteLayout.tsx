import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/doodles", label: "Doodles" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-tight flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent" />
            goblin<span className="text-muted-foreground">.studio</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 sm:gap-2 text-sm">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="sm:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-card transition-colors"
                aria-label="Open menu"
              >
                <span className={`block w-5 h-0.5 bg-foreground transition-all origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-5 h-0.5 bg-foreground transition-all ${open ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-foreground transition-all origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-6 flex flex-col">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="font-display text-lg tracking-tight flex items-center gap-2 mb-8"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                goblin<span className="text-muted-foreground">.studio</span>
              </Link>
              <nav className="flex flex-col gap-1">
                {nav.map((n) => {
                  const active = pathname === n.to;
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className={`px-4 py-3 rounded-xl text-base transition-colors ${
                        active
                          ? "bg-foreground text-background font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-card"
                      }`}
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vishal Gurung · built in Tokyo.</p>
          <div className="flex gap-5">
            <a className="ink-link" href="https://github.com/g0GobliN" target="_blank" rel="noreferrer">GitHub</a>
            <a className="ink-link" href="https://instagram.com/goblin01_" target="_blank" rel="noreferrer">Instagram</a>
            <a className="ink-link" href="mailto:grgvishal.gurung17@gmail.com">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { blogAuth } from "@/lib/firebase";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/blog", label: "Blog" },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/doodles", label: "Doodles" },
];

function AdminLayout() {
  const [user, setUser] = useState<User | null | "loading">("loading");
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    return onAuthStateChanged(blogAuth, (u) => setUser(u));
  }, []);

  if (user === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginForm />;

  function isActive(n: (typeof NAV)[number]) {
    return n.exact
      ? pathname === "/admin" || pathname === "/admin"
      : pathname.startsWith(n.to);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/admin"
            className="font-display text-xl tracking-tight flex items-center gap-2 shrink-0"
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent" />
            goblin<span className="text-muted-foreground">.admin</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 flex-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive(n)
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Desktop: user + sign out */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <span className="text-xs text-muted-foreground truncate max-w-[160px]">
              {user.email}
            </span>
            <div className="flex gap-2">
              <Link
                to="/"
                className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              >
                ← Site
              </Link>
              <button
                onClick={() => signOut(blogAuth)}
                className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="sm:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-card transition-colors"
                aria-label="Open menu"
              >
                <span className={`block w-5 h-0.5 bg-foreground transition-all origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-5 h-0.5 bg-foreground transition-all ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-foreground transition-all origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-6 flex flex-col">
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="font-display text-lg tracking-tight flex items-center gap-2 mb-2"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                goblin<span className="text-muted-foreground">.admin</span>
              </Link>
              <p className="text-xs text-muted-foreground mb-6 truncate">{user.email}</p>
              <nav className="flex flex-col gap-1 flex-1">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base transition-colors ${
                      isActive(n)
                        ? "bg-foreground text-background font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-2 mt-6 pt-6 border-t border-border">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                >
                  ← Back to site
                </Link>
                <button
                  onClick={() => { signOut(blogAuth); setMenuOpen(false); }}
                  className="px-4 py-2.5 rounded-xl text-sm text-left text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                >
                  Sign out
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("grgvishal.gurung17@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(blogAuth, email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-block w-3 h-3 rounded-full bg-accent mb-4" />
          <h1 className="font-display text-4xl">goblin.admin</h1>
          <p className="text-muted-foreground text-sm mt-2">Sign in to manage your content</p>
        </div>
        <form onSubmit={handleSubmit} className="paper-card p-8 relative space-y-5">
          <span className="tape" />
          <div>
            <label className="block text-xs uppercase tracking-widest text-clay mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={adminInput}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-clay mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className={adminInput}
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          <button type="submit" disabled={loading} className={`${adminBtn} w-full justify-center`}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export const adminInput =
  "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y";
export const adminBtn =
  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-clay transition-colors disabled:opacity-50";
export const adminBtnGhost =
  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-card transition-colors";
export const adminBtnDanger =
  "inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-colors disabled:opacity-50";

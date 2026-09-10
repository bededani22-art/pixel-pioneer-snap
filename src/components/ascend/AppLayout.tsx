import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  CalendarClock,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  Gavel,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  TimerReset,
} from "lucide-react";
import { Logo } from "./Logo";
import { Button, Input, cx } from "./ui";
import {
  loadDatabase,
  loadSession,
  signIn,
  signOut,
  useCurrentUser,
  useDatabase,
  useSession,
} from "@/lib/ascend/store";
import { useTheme } from "@/lib/ascend/useTheme";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Project Registry", icon: FolderKanban },
  { to: "/letters", label: "Letter Registry", icon: FileText },
  { to: "/claims", label: "Claims", icon: Gavel },
  { to: "/delays", label: "Delay Register", icon: TimerReset },
  { to: "/plan", label: "Next Week Plan", icon: CalendarClock },
  { to: "/chatbot", label: "Chatbot", icon: Bot },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [booted, setBooted] = useState(false);
  const session = useSession();
  const user = useCurrentUser();

  useEffect(() => {
    loadDatabase();
    loadSession();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!session) {
      setBooted(false);
      return;
    }
    const t = setTimeout(() => setBooted(true), 1700);
    return () => clearTimeout(t);
  }, [session]);

  if (!mounted) return <BootScreen quiet />;
  if (!session || !user) return <LoginScreen />;
  if (!booted) return <BootScreen />;

  return <Shell>{children}</Shell>;
}

/* ------------------------------- Login -------------------------------- */

function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggle } = useTheme();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter both your username and password.");
      return;
    }
    const res = signIn(username, password);
    if (!res.ok) setError(res.error ?? "Sign-in failed.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex justify-end p-4">
        <Button variant="ghost" size="sm" onClick={toggle} aria-label="Switch theme">
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {theme === "dark" ? "Light" : "Dark"}
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo className="h-24 w-auto" />
          </div>
          <form onSubmit={submit} className="panel space-y-4 p-6">
            <div>
              <h1 className="text-base font-semibold">Contract Administration & Claims</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Sign in to access the ASCEND project and claims records.
              </p>
            </div>
            <label className="block">
              <span className="field-label">Username</span>
              <Input
                autoFocus
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="admin"
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="field-label">Password</span>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>
            {error ? (
              <p className="rounded-sm bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p>
            ) : null}
            <Button type="submit" variant="primary" className="w-full">
              Sign in
            </Button>
            <p className="text-center text-[0.7rem] leading-relaxed text-muted-foreground">
              Demonstration accounts: <strong>admin / ascend2026</strong>,{" "}
              <strong>contracts / contracts</strong>, <strong>viewer / viewer</strong>.
              <br />
              Prototype sign-in only — credentials are stored in this browser and are not
              production-grade security.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Splash -------------------------------- */

function BootScreen({ quiet }: { quiet?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background">
      <Logo className="h-28 w-auto" />
      {!quiet ? (
        <div className="h-0.5 w-56 overflow-hidden rounded-sm bg-neutral-soft">
          <div className="h-full w-1/3 animate-[ascend-load_1.2s_ease-in-out_infinite] bg-primary" />
        </div>
      ) : null}
      <p className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
        {quiet ? "" : "Loading workspace"}
      </p>
    </div>
  );
}

/* ------------------------------- Shell -------------------------------- */

function Shell({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="border-b border-sidebar-border px-4 py-5">
          <Logo forceDark className="h-11 w-auto" />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {NAV.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cx(
                  "flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-hover font-medium text-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border px-4 py-3 text-[0.7rem] text-sidebar-foreground/60">
          ASCEND Consulting Engineers PLC
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="lg:hidden">
            <Logo className="h-8 w-auto" />
          </div>
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggle} aria-label="Switch theme">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <div className="hidden text-right sm:block">
              <div className="text-xs font-medium leading-tight">{user?.name}</div>
              <div className="text-[0.7rem] leading-tight text-muted-foreground">{user?.role}</div>
            </div>
            <Button variant="default" size="sm" onClick={() => signOut()}>
              <LogOut className="size-3.5" /> Sign out
            </Button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-2 py-1.5 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded-sm px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              activeProps={{ className: "text-primary font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

/* --------------------------- Global search ---------------------------- */

function GlobalSearch() {
  const db = useDatabase();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const hit = (...v: (string | undefined)[]) =>
      v.some((s) => (s ?? "").toLowerCase().includes(term));
    const out: { label: string; sub: string; kind: string; to: string }[] = [];
    db.projects
      .filter((p) => hit(p.name, p.contractRef, p.employer, p.contractor, p.consultant))
      .forEach((p) =>
        out.push({ label: p.name, sub: p.contractRef, kind: "Project", to: `/projects/${p.id}` }),
      );
    db.letters
      .filter((l) => hit(l.ref, l.subject, l.sender, l.recipient))
      .forEach((l) => out.push({ label: l.ref, sub: l.subject, kind: "Letter", to: "/letters" }));
    db.claims
      .filter((c) => hit(c.ref, c.title))
      .forEach((c) => out.push({ label: c.ref, sub: c.title, kind: "Claim", to: "/claims" }));
    db.events
      .filter((e) => hit(e.ref, e.title))
      .forEach((e) => out.push({ label: e.ref, sub: e.title, kind: "Delay", to: "/delays" }));
    return out.slice(0, 12);
  }, [q, db]);

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search projects, letters, claims, delay events…"
        className="pl-8"
      />
      {open && results.length > 0 ? (
        <ul className="panel absolute left-0 right-0 top-full z-40 mt-1 max-h-80 overflow-y-auto p-1 shadow-lg">
          {results.map((r, i) => (
            <li key={`${r.kind}-${r.label}-${i}`}>
              <button
                onClick={() => {
                  setOpen(false);
                  setQ("");
                  navigate({ to: r.to });
                }}
                className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="w-16 shrink-0 text-[0.65rem] uppercase tracking-wider text-primary">
                  {r.kind}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

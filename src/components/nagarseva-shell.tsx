import { Link, useLocation } from "@tanstack/react-router";
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  Map,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/citizen", label: "My reports", icon: ClipboardList },
  { to: "/map", label: "Safety map", icon: Map },
  { to: "/ward", label: "Ward dashboard", icon: LayoutDashboard },
  { to: "/officer", label: "Officer workspace", icon: Building2 },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
];
export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-foreground">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-civic text-civic-foreground">
        <Building2 className="h-4 w-4" />
      </span>
      NagarSeva
    </Link>
  );
}
export function PublicHeader() {
  return (
    <header className="border-b border-border bg-background/95">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Brand />
        <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
          <Link to="/map">Safety map</Link>
          <Link to="/ward">Ward dashboard</Link>
          <Link to="/officer">For officers</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/citizen">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/report">Report an issue</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
export function AppShell({
  children,
  title,
  eyebrow,
}: {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
}) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="page-shell flex h-16 items-center justify-between">
          <Brand />
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <UserRound /> Public view
            </Link>
          </Button>
        </div>
      </header>
      <div className="page-shell grid gap-7 py-7 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Workspace
          </p>
          <nav className="grid gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
                  location.pathname === to
                    ? "bg-civic-soft text-civic"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">
          <p className="section-label">{eyebrow ?? "NagarSeva civic service"}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}

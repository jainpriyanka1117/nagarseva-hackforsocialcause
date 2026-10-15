import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpDown, CheckCircle2, Clock3, Filter, Search, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/nagarseva-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { complaints, statusStyles } from "@/lib/nagarseva-data";
export const Route = createFileRoute("/officer")({
  head: () => ({
    meta: [
      { title: "Officer workspace — NagarSeva" },
      {
        name: "description",
        content: "Prioritized civic complaint operations workspace for NagarSeva officers.",
      },
      { property: "og:title", content: "Officer workspace — NagarSeva" },
      { property: "og:description", content: "Prioritized civic complaint operations workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Officer,
});
function Officer() {
  const firstComplaint = complaints[0];
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(firstComplaint?.id ?? "");
  const rows = useMemo(
    () =>
      complaints.filter((item) =>
        `${item.category} ${item.location} ${item.id}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  if (!firstComplaint) return null;
  const selected = complaints.find((item) => item.id === active) ?? firstComplaint;
  return (
    <AppShell title="Operations workspace" eyebrow="Ward 82 · Drainage Operations">
      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 pl-9"
                placeholder="Search reports, streets or references"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter /> Filters
              </Button>
              <Button variant="outline" size="sm">
                <ArrowUpDown /> Priority
              </Button>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
            <div className="hidden grid-cols-[minmax(0,1.3fr)_140px_130px_130px] gap-4 border-b border-border bg-muted px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground md:grid">
              <span>Report</span>
              <span>Status</span>
              <span>SLA</span>
              <span>Priority</span>
            </div>
            {rows.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`grid w-full gap-3 border-b border-border p-4 text-left transition-colors md:grid-cols-[minmax(0,1.3fr)_140px_130px_130px] md:items-center ${active === item.id ? "bg-civic-soft/50" : "hover:bg-muted"}`}
              >
                <div>
                  <p className="font-bold">{item.category}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.id} · {item.location}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-md px-2 py-1 text-xs font-bold ${statusStyles[item.status]}`}
                >
                  {item.status}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  {item.sla}
                </span>
                <span
                  className={`w-fit rounded-md px-2 py-1 text-xs font-bold ${item.priority === "High" ? "bg-risk text-risk-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {item.priority}
                </span>
              </button>
            ))}
          </div>
        </section>
        <aside className="app-panel h-fit rounded-lg p-5">
          <p className="section-label">Selected complaint</p>
          <h2 className="mt-3 text-xl font-extrabold">{selected.category}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {selected.id} · {selected.location}
          </p>
          <div className="mt-5 rounded-md bg-muted p-4 text-sm leading-6">
            {selected.description}
          </div>
          <div className="mt-5 space-y-2">
            <Button className="w-full" onClick={() => toast.success("Status set to In Progress.")}>
              <Wrench /> Begin work
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast.info("Additional information request queued.")}
            >
              Request information
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                toast.info("Resolution evidence capture is available when storage is connected.")
              }
            >
              <CheckCircle2 /> Submit resolution evidence
            </Button>
          </div>
          <Link
            to="/complaint/$id"
            params={{ id: selected.id }}
            className="mt-5 block text-center text-sm font-bold text-civic"
          >
            Open full history
          </Link>
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-sm font-bold">Audit visibility</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Actions, reassignment reasons and updates remain visible to authorized ward
              leadership.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

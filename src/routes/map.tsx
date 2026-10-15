import { createFileRoute } from "@tanstack/react-router";
import { Clock3, Info, MapPin, Navigation, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { CivicMap } from "@/components/civic-map";
import { AppShell } from "@/components/nagarseva-shell";
import { Button } from "@/components/ui/button";
import {
  complaints as fallbackComplaints,
  type Complaint,
  type Status,
} from "@/lib/nagarseva-data";
import { fetchComplaints } from "@/server/complaints";

export const Route = createFileRoute("/map")({
  loader: async () => {
    try {
      const liveComplaints = await fetchComplaints();
      const mappedComplaints: Complaint[] = liveComplaints.map((c) => ({
        id: c.id,
        category: c.category,
        location: c.location,
        ward: c.ward,
        status: c.status as Status,
        priority: (c.priority as "High" | "Medium" | "Low") ?? "Medium",
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recent",
        sla: c.slaRemaining ?? "Standard SLA",
        description: c.description,
        x: c.x,
        y: c.y,
        safety: !!c.safety,
      }));
      return {
        complaints: mappedComplaints.length > 0 ? mappedComplaints : fallbackComplaints,
      };
    } catch {
      return { complaints: fallbackComplaints };
    }
  },
  head: () => ({
    meta: [
      { title: "Community safety map — NagarSeva" },
      {
        name: "description",
        content: "Explore civic reports and community safety signals in NagarSeva.",
      },
      { property: "og:title", content: "Community safety map — NagarSeva" },
      {
        property: "og:description",
        content: "Explore civic reports and community safety signals responsibly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SafetyMap,
});

function SafetyMap() {
  const { complaints: allComplaints } = Route.useLoaderData();
  const [filter, setFilter] = useState<"all" | "civic" | "safety">("all");
  const filteredComplaints = allComplaints.filter((item) => {
    if (filter === "safety") return !!item.safety;
    if (filter === "civic") return !item.safety;
    return true;
  });
  const firstComplaint = filteredComplaints[0] ?? allComplaints[0];
  const [selection, setSelection] = useState<Complaint | undefined>(firstComplaint);

  const activeSelection =
    selection && filteredComplaints.some((c) => c.id === selection.id) ? selection : firstComplaint;

  return (
    <AppShell title="Community safety map" eyebrow="Reported context, not proof">
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        Safety signals reflect community reports, corroboration and time decay. A single report does
        not establish that an area is unsafe.
      </p>
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="app-panel overflow-hidden rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All reports ({allComplaints.length})
              </Button>
              <Button
                size="sm"
                variant={filter === "civic" ? "default" : "outline"}
                onClick={() => setFilter("civic")}
              >
                Civic issues ({allComplaints.filter((c) => !c.safety).length})
              </Button>
              <Button
                size="sm"
                variant={filter === "safety" ? "default" : "outline"}
                onClick={() => setFilter("safety")}
              >
                <ShieldAlert className="mr-1 h-3.5 w-3.5" /> Safety signals (
                {allComplaints.filter((c) => !!c.safety).length})
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Clock3 className="h-4 w-4" /> Evening · 18:00–22:00
            </div>
          </div>
          <CivicMap large selectedId={activeSelection?.id} items={filteredComplaints} />
        </section>
        <aside className="space-y-4">
          {activeSelection && (
            <div className="app-panel rounded-lg p-5">
              <p className="section-label">Selected report</p>
              <h2 className="mt-3 text-lg font-extrabold">{activeSelection.category}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{activeSelection.location}</p>
              <p className="mt-4 text-sm leading-6">{activeSelection.description}</p>
              {activeSelection.safety ? (
                <div className="mt-5 flex items-center gap-2 rounded-md bg-risk/10 p-3 text-sm font-semibold text-risk">
                  <ShieldAlert className="h-4 w-4" /> Community-reported context
                </div>
              ) : (
                <div className="mt-5 flex items-center gap-2 rounded-md bg-civic/10 p-3 text-sm font-semibold text-civic">
                  <MapPin className="h-4 w-4" /> Ward: {activeSelection.ward} · SLA:{" "}
                  {activeSelection.sla}
                </div>
              )}
            </div>
          )}
          <div className="app-panel rounded-lg p-5">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-civic" />
              <h2 className="font-extrabold">Route comparison</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Route times and distances appear only when a routing service is connected.
            </p>
            <div className="mt-4 divide-y divide-border rounded-md border border-border text-sm">
              <div className="p-3">
                <strong>Recommended route</strong>
                <span className="ml-2 text-muted-foreground">Routing unavailable</span>
              </div>
              <div className="p-3">
                <strong>Alternative route</strong>
                <span className="ml-2 text-muted-foreground">Routing unavailable</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <Info className="mb-2 h-4 w-4 text-civic" />
            Demonstration records are shown. Risk displays require corroboration and decay over time
            in the live service.
          </div>
          <div className="grid gap-2">
            {filteredComplaints.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelection(item)}
                className="app-panel rounded-md p-3 text-left text-sm font-bold hover:bg-muted"
              >
                <MapPin className="mr-2 inline h-4 w-4 text-civic" />
                {item.category}
                <span className="block pl-6 pt-1 text-xs font-medium text-muted-foreground">
                  {item.location}
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

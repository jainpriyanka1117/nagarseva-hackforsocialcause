import { createFileRoute } from "@tanstack/react-router";
import { Clock3, Info, MapPin, Navigation, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { CivicMap } from "@/components/civic-map";
import { AppShell } from "@/components/nagarseva-shell";
import { Button } from "@/components/ui/button";
import { complaints } from "@/lib/nagarseva-data";
export const Route = createFileRoute("/map")({
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
  const firstSafetyComplaint = complaints[1] ?? complaints[0];
  const [selection, setSelection] = useState(firstSafetyComplaint);
  if (!firstSafetyComplaint || !selection) return null;
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
              <Button size="sm">All reports</Button>
              <Button size="sm" variant="outline">
                Civic issues
              </Button>
              <Button size="sm" variant="outline">
                <ShieldAlert /> Safety signals
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Clock3 className="h-4 w-4" /> Evening · 18:00–22:00
            </div>
          </div>
          <CivicMap large selectedId={selection.id} />
        </section>
        <aside className="space-y-4">
          <div className="app-panel rounded-lg p-5">
            <p className="section-label">Selected report</p>
            <h2 className="mt-3 text-lg font-extrabold">{selection.category}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{selection.location}</p>
            <p className="mt-4 text-sm leading-6">{selection.description}</p>
            <div className="mt-5 flex items-center gap-2 rounded-md bg-risk/10 p-3 text-sm font-semibold text-risk">
              <ShieldAlert className="h-4 w-4" /> Community-reported context
            </div>
          </div>
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
            {complaints.map((item) => (
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

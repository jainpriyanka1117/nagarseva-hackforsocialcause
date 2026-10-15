import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Plus, Timer } from "lucide-react";
import { AppShell } from "@/components/nagarseva-shell";
import { Button } from "@/components/ui/button";
import { complaints as fallbackComplaints, statusStyles, type Status } from "@/lib/nagarseva-data";
import { fetchComplaints } from "@/server/complaints";

export const Route = createFileRoute("/citizen")({
  loader: async () => {
    return await fetchComplaints({ ward: "Ward 82" });
  },
  head: () => ({
    meta: [
      { title: "My reports — NagarSeva" },
      {
        name: "description",
        content: "Track your NagarSeva civic reports and their resolution progress.",
      },
      { property: "og:title", content: "My reports — NagarSeva" },
      {
        property: "og:description",
        content: "Track civic reports from submission through verified resolution.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Citizen,
});

function Citizen() {
  const dbComplaints = Route.useLoaderData();
  const complaintList = dbComplaints && dbComplaints.length > 0 ? dbComplaints : fallbackComplaints;

  const firstComplaint = complaintList[0]!;
  const verificationComplaint =
    complaintList.find((c) => c.status === "Resolved — pending verification") ??
    complaintList[1] ??
    firstComplaint;

  const submittedCount = complaintList.filter((c) => c.status === "Submitted").length;
  const inProgressCount = complaintList.filter(
    (c) => c.status === "In Progress" || c.status === "Accepted",
  ).length;
  const resolvedCount = complaintList.filter(
    (c) =>
      c.status === "Closed: verified" ||
      c.status === "Closed: unverified" ||
      c.status === "Resolved — pending verification",
  ).length;

  return (
    <AppShell title="Good evening, Ananya" eyebrow="Citizen dashboard">
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section>
          <div className="app-panel rounded-lg p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold">Make your neighbourhood count.</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your reports help the right civic team act faster.
                </p>
              </div>
              <Button asChild>
                <Link to="/report">
                  <Plus /> Report issue
                </Link>
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-3 divide-x divide-border">
              <Summary value={String(submittedCount).padStart(2, "0")} label="Submitted" />
              <Summary value={String(inProgressCount).padStart(2, "0")} label="In progress" />
              <Summary value={String(resolvedCount).padStart(2, "0")} label="Resolved" />
            </div>
          </div>
          <div className="mt-7 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Recent reports</h2>
            <Link
              to="/complaint/$id"
              params={{ id: firstComplaint.id }}
              className="text-sm font-bold text-civic"
            >
              View latest
            </Link>
          </div>
          <div className="mt-3 grid gap-3">
            {complaintList.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                to="/complaint/$id"
                params={{ id: item.id }}
                className="app-panel grid gap-3 rounded-lg p-4 transition-transform hover:-translate-y-0.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{item.category}</p>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-bold ${statusStyles[item.status as Status] ?? "bg-muted"}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {item.location} · {item.id}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  {"slaRemaining" in item && item.slaRemaining
                    ? item.slaRemaining
                    : "sla" in item
                      ? String(item.sla)
                      : "Target SLA: 48h"}
                </span>
              </Link>
            ))}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="app-panel rounded-lg p-5">
            <Bell className="h-5 w-5 text-civic" />
            <h2 className="mt-4 font-extrabold">One update needs you</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {verificationComplaint.category} report has an update. Please confirm the outcome.
            </p>
            <Button className="mt-4 w-full" variant="outline" asChild>
              <Link to="/complaint/$id" params={{ id: verificationComplaint.id }}>
                Review resolution <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="app-panel rounded-lg p-5">
            <p className="section-label">Nearby context</p>
            <p className="mt-3 font-bold">{complaintList.length} open reports in Ward 82</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review nearby issues before submitting to help avoid duplicates.
            </p>
            <Link to="/map" className="mt-4 inline-flex text-sm font-bold text-civic">
              Explore map <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-3 text-center">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

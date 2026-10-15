import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowUpDown, CheckCircle2, Clock3, Filter, Search, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/nagarseva-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { complaints as fallbackComplaints, statusStyles, type Status } from "@/lib/nagarseva-data";
import { fetchComplaints, updateComplaintStatusServerFn } from "@/server/complaints";

export const Route = createFileRoute("/officer")({
  loader: async () => {
    return await fetchComplaints({ ward: "Ward 82" });
  },
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
  const router = useRouter();
  const dbComplaints = Route.useLoaderData();
  const complaintList = dbComplaints && dbComplaints.length > 0 ? dbComplaints : fallbackComplaints;

  const firstComplaint = complaintList[0]!;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(firstComplaint.id);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const rows = useMemo(() => {
    return complaintList.filter((item) => {
      const matchQuery = `${item.category} ${item.location} ${item.id}`
        .toLowerCase()
        .includes(query.toLowerCase());
      if (!matchQuery) return false;
      if (priorityFilter && item.priority !== priorityFilter) return false;
      return true;
    });
  }, [complaintList, query, priorityFilter]);

  const selected = complaintList.find((item) => item.id === active) ?? firstComplaint;

  const handleStatusChange = async (newStatus: Status, message: string) => {
    try {
      await updateComplaintStatusServerFn({
        data: {
          id: selected.id,
          status: newStatus,
          actorName: "Ramesh Kumar (JE)",
          actorRole: "Operations Officer",
          message,
        },
      });
      toast.success(`Complaint updated to ${newStatus}`);
      router.invalidate();
    } catch (e) {
      toast.error((e as Error).message || "Update failed");
    }
  };

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
              <Button
                variant={priorityFilter ? "default" : "outline"}
                size="sm"
                onClick={() => setPriorityFilter((prev) => (prev === "High" ? null : "High"))}
              >
                <Filter /> {priorityFilter ? "High only" : "All Priorities"}
              </Button>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {rows.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={`app-panel flex w-full flex-col gap-3 rounded-lg p-5 text-left transition sm:flex-row sm:items-center sm:justify-between ${active === item.id ? "ring-2 ring-civic" : ""}`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold">{item.category}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-bold ${statusStyles[item.status as Status] ?? "bg-muted"}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.location} · {item.id}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">
                    <Clock3 className="mr-1 inline h-3.5 w-3.5 text-civic" />
                    {"slaRemaining" in item && item.slaRemaining
                      ? item.slaRemaining
                      : "sla" in item
                        ? String(item.sla)
                        : "Target SLA: 48h"}
                  </p>
                </div>
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
            <Button
              className="w-full"
              disabled={selected.status === "In Progress"}
              onClick={() =>
                handleStatusChange("In Progress", "Field team assigned and initiated ground works.")
              }
            >
              <Wrench /> {selected.status === "In Progress" ? "Work In Progress" : "Begin work"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={selected.status === "Resolved — pending verification"}
              onClick={() =>
                handleStatusChange(
                  "Resolved — pending verification",
                  "Repair completed by field team. Awaiting citizen confirmation.",
                )
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

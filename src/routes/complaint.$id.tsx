import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CivicMap } from "@/components/civic-map";
import { AppShell } from "@/components/nagarseva-shell";
import { Button } from "@/components/ui/button";
import { complaints, statusStyles, type Status } from "@/lib/nagarseva-data";
import { fetchComplaintById, updateComplaintStatusServerFn } from "@/server/complaints";

export const Route = createFileRoute("/complaint/$id")({
  loader: async ({ params }) => {
    return await fetchComplaintById(params.id);
  },
  head: () => ({
    meta: [
      { title: "Complaint tracking — NagarSeva" },
      {
        name: "description",
        content:
          "Follow the activity, responsibility and resolution verification for a NagarSeva complaint.",
      },
      { property: "og:title", content: "Complaint tracking — NagarSeva" },
      {
        property: "og:description",
        content: "Follow civic complaint progress through verified resolution.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComplaintDetail,
});

function ComplaintDetail() {
  const { id } = Route.useParams();
  const dbData = Route.useLoaderData();
  const fallback = complaints.find((item) => item.id === id) ?? complaints[0]!;

  const [complaint, setComplaint] = useState(
    dbData ?? {
      ...fallback,
      id,
      timeline: [
        {
          id: "1",
          action: "Submitted",
          message: "Report received and routed to Ward 82.",
          createdAt: "Today, 09:14",
        },
      ],
      evidence: [],
    },
  );

  const handleVerify = async () => {
    try {
      const updated = await updateComplaintStatusServerFn({
        data: {
          id: complaint.id,
          status: "Closed: verified" as Status,
          actorName: "Ananya Roy",
          actorRole: "Citizen",
          verificationFeedback: "Citizen verified outcome on ground.",
        },
      });
      if (updated) setComplaint(updated);
      toast.success("Resolution marked verified.");
    } catch (e) {
      toast.error((e as Error).message || "Verification failed");
    }
  };

  const handleReopen = async () => {
    try {
      const updated = await updateComplaintStatusServerFn({
        data: {
          id: complaint.id,
          status: "Reopened" as Status,
          actorName: "Ananya Roy",
          actorRole: "Citizen",
          message: "Citizen reported problem persists at location.",
        },
      });
      if (updated) setComplaint(updated);
      toast.info("Report escalated back to operations.");
    } catch (e) {
      toast.error((e as Error).message || "Action failed");
    }
  };

  return (
    <AppShell title={complaint.category} eyebrow={`Complaint ${complaint.id}`}>
      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5">
          <div className="app-panel rounded-lg p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-bold ${statusStyles[complaint.status as Status] ?? "bg-muted"}`}
              >
                {complaint.status}
              </span>
              <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
                {complaint.priority} priority
              </span>
            </div>
            <p className="mt-5 text-lg font-bold">{complaint.description}</p>
            <div className="mt-5 grid gap-3 border-t border-border pt-5 text-sm text-muted-foreground sm:grid-cols-3">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-civic" />
                {complaint.location}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-civic" />
                {"createdAt" in complaint && typeof complaint.createdAt === "string"
                  ? complaint.createdAt.slice(0, 10)
                  : "Today"}
              </span>
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-civic" />
                {"slaRemaining" in complaint && complaint.slaRemaining
                  ? complaint.slaRemaining
                  : "sla" in complaint && complaint.sla
                    ? (complaint.sla as string)
                    : "Standard SLA"}
              </span>
            </div>
          </div>
          <div className="app-panel rounded-lg p-5">
            <h2 className="text-lg font-extrabold">Activity Timeline</h2>
            <div className="mt-6 space-y-6 border-l border-border pl-5">
              {"timeline" in complaint && complaint.timeline && complaint.timeline.length > 0 ? (
                complaint.timeline.map((item, idx) => (
                  <Timeline
                    key={item.id}
                    title={item.action}
                    detail={item.message}
                    time={
                      typeof item.createdAt === "string" && item.createdAt.includes("T")
                        ? `${item.createdAt.slice(0, 10)} ${item.createdAt.slice(11, 16)}`
                        : String(item.createdAt)
                    }
                    active={idx === 0}
                  />
                ))
              ) : (
                <Timeline
                  title="Submitted"
                  detail="Report received and routed to Ward 82."
                  time="Today, 09:14"
                  active
                />
              )}
            </div>
          </div>
          {complaint.status === "Resolved — pending verification" && (
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-5">
              <h2 className="font-extrabold">Can you confirm the result?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The official has supplied resolution evidence. Your confirmation closes this report
                as verified.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={handleVerify}>
                  <CheckCircle2 /> Yes, resolved
                </Button>
                <Button variant="outline" onClick={handleReopen}>
                  Problem persists / Reopen
                </Button>
              </div>
            </div>
          )}
        </section>
        <aside className="space-y-5">
          <div className="app-panel overflow-hidden rounded-lg">
            <CivicMap selectedId={complaint.id} />
            <div className="p-4">
              <p className="font-bold">Location context</p>
              <p className="mt-1 text-sm text-muted-foreground">Ward 82 · Drainage Operations</p>
            </div>
          </div>
          <div className="app-panel rounded-lg p-5">
            <p className="section-label">Accountability</p>
            <p className="mt-3 font-bold">SLA deadline</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {"slaRemaining" in complaint && complaint.slaRemaining
                ? complaint.slaRemaining
                : "sla" in complaint && complaint.sla
                  ? (complaint.sla as string)
                  : "Target SLA: 48h"}
            </p>
            <Link
              to="/ward"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-civic"
            >
              Ward performance <ShieldCheck className="h-4 w-4" />
            </Link>
          </div>
          <div className="app-panel rounded-lg p-5">
            <MessageSquare className="h-5 w-5 text-civic" />
            <p className="mt-3 font-bold">Need help with this report?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Support and messaging are available when the service is connected.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Timeline({
  title,
  detail,
  time,
  active,
}: {
  title: string;
  detail: string;
  time: string;
  active?: boolean;
}) {
  return (
    <div className="relative">
      <span
        className={`absolute -left-[30px] top-1 h-3 w-3 rounded-full ${active ? "bg-civic" : "bg-border"}`}
      />
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      <p className="mt-1 text-xs font-semibold text-muted-foreground">{time}</p>
    </div>
  );
}

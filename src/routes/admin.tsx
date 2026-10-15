import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Ban, FileSearch, Scale, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/nagarseva-shell";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Platform administration — NagarSeva" },
      {
        name: "description",
        content:
          "NagarSeva platform administration overview for trust, abuse and account operations.",
      },
      { property: "og:title", content: "Platform administration — NagarSeva" },
      { property: "og:description", content: "Trust, abuse and account operations for NagarSeva." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});
function Admin() {
  return (
    <AppShell title="Platform administration" eyebrow="Trust, safety & service integrity">
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <Stat icon={Users} value="1,248" label="Active accounts" />
        <Stat icon={AlertTriangle} value="08" label="Trust reviews open" />
        <Stat icon={Scale} value="03" label="Disputed reopens" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="app-panel rounded-lg p-5">
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-civic" />
            <h2 className="font-extrabold">Trust & abuse review</h2>
          </div>
          <div className="mt-5 divide-y divide-border">
            <Review
              title="Repeated location submissions"
              detail="Account activity needs rate-limit review · Ward 82"
              action="Open review"
            />
            <Review
              title="Resolution evidence discrepancy"
              detail="Citizen and officer evidence do not match · NS-24-01788"
              action="Compare evidence"
            />
          </div>
        </section>
        <section className="app-panel rounded-lg p-5">
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-risk" />
            <h2 className="font-extrabold">Account controls</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Use platform-level controls only for verified policy concerns. Officer assignments and
            ward operations are managed separately.
          </p>
          <div className="mt-5 rounded-md border border-border p-4">
            <p className="font-bold">Rate-limiting</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No active automatic restrictions in this demonstration.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => toast.info("Controls require a connected account service.")}
            >
              Manage controls
            </Button>
          </div>
        </section>
        <section className="app-panel rounded-lg p-5 lg:col-span-2">
          <p className="section-label">Audit log preview</p>
          <div className="mt-4 grid divide-y divide-border text-sm">
            <Log text="Trust review created for NS-24-01788" time="Today · 11:42" />
            <Log text="Ward 82 department reassignment recorded" time="Today · 10:20" />
            <Log text="Citizen reopened NS-24-01671 with new evidence" time="Yesterday · 16:08" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return (
    <div className="app-panel rounded-lg p-5">
      <Icon className="h-5 w-5 text-civic" />
      <p className="mt-4 text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
function Review({ title, detail, action }: { title: string; detail: string; action: string }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.info("Review tools require connected live services.")}
      >
        {action}
      </Button>
    </div>
  );
}
function Log({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-4">
      <span className="font-semibold">{text}</span>
      <span className="text-muted-foreground">{time}</span>
    </div>
  );
}

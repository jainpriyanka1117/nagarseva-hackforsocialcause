import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock3, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CivicMap } from "@/components/civic-map";
import { PublicHeader } from "@/components/nagarseva-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NagarSeva — Your neighbourhood deserves better" },
      {
        name: "description",
        content:
          "Report civic problems, follow the response, and help make your neighbourhood safer with NagarSeva.",
      },
      { property: "og:title", content: "NagarSeva — Civic accountability, made visible" },
      {
        property: "og:description",
        content: "Report civic problems and follow every step toward a verified resolution.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
function Home() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <section className="page-shell grid gap-12 py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:py-20">
          <div>
            <p className="section-label">Civic action, in public view</p>
            <h1 className="mt-4 max-w-xl text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">
              Your neighbourhood deserves better.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              Report what needs attention, see who is responsible, and follow every step until a
              resolution is verified by people who live there.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/report">
                  Report an issue <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/ward">Explore ward dashboard</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm font-semibold text-muted-foreground">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-civic" />
                Accountable updates
              </span>
              <span className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-civic" />
                Local context
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-civic" />
                Citizen-verified closures
              </span>
            </div>
          </div>
          <div className="app-panel overflow-hidden rounded-lg">
            <CivicMap />
            <div className="grid gap-2 border-t border-border bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-bold">Ward 82 · Indiranagar</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Live-looking demonstration of reported civic issues and community safety signals.
                </p>
              </div>
              <Link
                to="/map"
                className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-civic sm:mt-0"
              >
                Open safety map <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
        <section className="border-y border-border bg-card">
          <div className="page-shell grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
            <Metric value="4.2 days" label="Median resolution time" />
            <Metric value="12%" label="Escalation rate" />
            <Metric value="6%" label="Reopen rate" />
          </div>
        </section>
        <section className="page-shell py-18">
          <div className="max-w-xl">
            <p className="section-label">A clearer path to resolution</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
              Every report stays visible until the work is done.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Feature
              icon={MapPinned}
              title="Report with context"
              copy="Capture the issue, location and details in a focused, mobile-first flow."
            />
            <Feature
              icon={Clock3}
              title="Track the response"
              copy="See responsibility, deadlines, updates and escalation in one accountable timeline."
            />
            <Feature
              icon={Sparkles}
              title="Verify what changed"
              copy="A resolution only earns a verified closure when the citizen confirms the outcome."
            />
          </div>
        </section>
        <section className="border-t border-border bg-surface">
          <div className="page-shell grid gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="section-label">Public accountability</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
                Make response performance easy to understand.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Explore transparent ward measures, complaint lifecycles and separately reported
                verified and unverified closures.
              </p>
              <Button variant="outline" className="mt-6" asChild>
                <Link to="/ward">
                  View Ward 82 dashboard <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="app-panel grid grid-cols-2 divide-x divide-border rounded-lg bg-card">
              <div className="p-6">
                <p className="text-sm text-muted-foreground">Reports resolved</p>
                <p className="mt-2 text-4xl font-extrabold">126</p>
                <p className="mt-3 text-sm font-semibold text-success">+16 this month</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground">Verified closure</p>
                <p className="mt-2 text-4xl font-extrabold">82%</p>
                <p className="mt-3 text-sm font-semibold text-muted-foreground">
                  Demonstration data
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border bg-card">
        <div className="page-shell flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© NagarSeva · Civic Grievance Reporting & Community Safety</span>
          <span>Demonstration interface · Contact details to be added</span>
        </div>
      </footer>
    </div>
  );
}
function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="py-7 text-center">
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
function Feature({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof MapPinned;
  title: string;
  copy: string;
}) {
  return (
    <article className="app-panel rounded-lg p-6">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-civic-soft text-civic">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
    </article>
  );
}

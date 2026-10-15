import { createFileRoute } from "@tanstack/react-router";
import { Info, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/nagarseva-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const categoryData = [
  { name: "Drain", value: 34 },
  { name: "Lighting", value: 28 },
  { name: "Waste", value: 22 },
  { name: "Road", value: 18 },
  { name: "Other", value: 12 },
];
export const Route = createFileRoute("/ward")({
  head: () => ({
    meta: [
      { title: "Ward 82 accountability — NagarSeva" },
      {
        name: "description",
        content:
          "Review NagarSeva ward-level civic responsiveness metrics and complaint lifecycle data.",
      },
      { property: "og:title", content: "Ward 82 accountability — NagarSeva" },
      {
        property: "og:description",
        content: "Review civic responsiveness and complaint lifecycle data for Ward 82.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Ward,
});
function Ward() {
  return (
    <AppShell title="Ward accountability" eyebrow="Public performance overview">
      <div className="mt-6 flex flex-wrap gap-3">
        <Select defaultValue="82">
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="82">Ward 82</SelectItem>
            <SelectItem value="83">Ward 83</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="30">
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Info className="h-4 w-4 text-civic" />
          Clearly labelled demonstration data
        </span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric
          title="Median resolution time"
          value="4.2 days"
          movement="0.8 days faster"
          direction="up"
        />
        <Metric title="Escalation rate" value="12%" movement="2 points lower" direction="down" />
        <Metric title="Reopen rate" value="6%" movement="Stable this period" direction="down" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="app-panel rounded-lg p-5">
          <div>
            <p className="font-extrabold">Complaint volume by category</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reports received in the selected period.
            </p>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={index === 1 ? "var(--warning)" : "var(--civic)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="app-panel rounded-lg p-5">
          <p className="font-extrabold">Complaint lifecycle</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Closures are reported separately by verification status.
          </p>
          <div className="mt-6 space-y-5">
            {[
              ["Submitted", "18", "18%"],
              ["In progress", "31", "31%"],
              ["Verified closures", "42", "42%"],
              ["Unverified closures", "9", "9%"],
            ].map(([label, value, width]) => (
              <div key={label}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{label}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-civic" style={{ width }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-5 rounded-lg border border-border bg-muted/50 p-5 text-sm leading-6 text-muted-foreground">
        <strong className="text-foreground">Metric definitions.</strong> Median resolution time
        measures the middle time from accepted report to recorded resolution. Escalation rate is the
        proportion exceeding their initial service deadline. Reopen rate reflects reports reopened
        after a resolution update.
      </div>
    </AppShell>
  );
}
function Metric({
  title,
  value,
  movement,
  direction,
}: {
  title: string;
  value: string;
  movement: string;
  direction: "up" | "down";
}) {
  const Icon = direction === "up" ? TrendingUp : TrendingDown;
  return (
    <div className="app-panel rounded-lg p-5">
      <p className="text-sm font-semibold text-muted-foreground">{title}</p>
      <p className="mt-3 text-3xl font-extrabold">{value}</p>
      <p className="mt-3 flex items-center gap-1 text-sm font-bold text-success">
        <Icon className="h-4 w-4" />
        {movement}
      </p>
    </div>
  );
}

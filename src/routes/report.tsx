import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  Crosshair,
  ImageOff,
  MapPin,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/nagarseva-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { categories, complaints } from "@/lib/nagarseva-data";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an issue — NagarSeva" },
      {
        name: "description",
        content: "Submit a civic issue with evidence and location through NagarSeva.",
      },
      { property: "og:title", content: "Report an issue — NagarSeva" },
      { property: "og:description", content: "Submit a civic issue with evidence and location." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Report,
});
function Report() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const advance = () => {
    if (step === 2 && (!category || description.trim().length < 12)) {
      toast.error("Choose a category and add at least 12 characters.");
      return;
    }
    setStep((value) => value + 1);
  };
  if (step === 5)
    return (
      <AppShell title="Report submitted" eyebrow="NagarSeva receipt">
        <div className="app-panel mx-auto mt-8 max-w-xl rounded-lg p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success text-success-foreground">
            <CheckCircle2 />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold">Thanks for making this visible.</h2>
          <p className="mt-3 text-muted-foreground">
            Your issue has been received as <strong className="text-foreground">NS-24-01861</strong>{" "}
            and is awaiting review.
          </p>
          <div className="my-6 border-y border-border py-5 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Initial status
            </p>
            <p className="mt-2 font-bold">Submitted · Ward 82 routing</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => navigate({ to: "/complaint/$id", params: { id: "NS-24-01861" } })}
            >
              Track this report
            </Button>
            <Button variant="outline" asChild>
              <Link to="/citizen">Return to dashboard</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  return (
    <AppShell title="Report an issue" eyebrow="Guided submission">
      <div className="mt-7 max-w-3xl">
        <div className="mb-8 flex items-center gap-2">
          {["Evidence", "Details", "Check", "Review"].map((label, index) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold",
                  index + 1 <= step
                    ? "bg-civic text-civic-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <span className="hidden text-xs font-bold text-muted-foreground sm:inline">
                {label}
              </span>
              {index < 3 && <span className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>
        <div className="app-panel rounded-lg p-5 sm:p-7">
          {step === 1 && <Evidence />}
          {step === 2 && (
            <Details
              category={category}
              setCategory={setCategory}
              description={description}
              setDescription={setDescription}
            />
          )}
          {step === 3 && <Duplicate />}
          {step === 4 && <Review category={category} description={description} />}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ChevronLeft /> Back
              </Button>
            ) : (
              <Link to="/citizen" className="text-sm font-bold text-muted-foreground">
                Save for later
              </Link>
            )}
            <Button onClick={advance}>{step === 4 ? "Submit report" : "Continue"}</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
function Evidence() {
  return (
    <>
      <p className="section-label">Step 1 of 4</p>
      <h2 className="mt-2 text-2xl font-extrabold">Capture evidence</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Take a fresh photo of the issue. Gallery uploads are not available for this report type.
      </p>
      <div className="mt-6 grid min-h-56 place-items-center rounded-lg border border-dashed border-civic bg-civic-soft p-6 text-center">
        <Camera className="h-9 w-9 text-civic" />
        <div>
          <p className="mt-3 font-bold">Camera preview unavailable in this demonstration</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Evidence capture state is ready for a device camera connection.
          </p>
        </div>
        <Button variant="outline" className="mt-2">
          <UploadCloud /> Capture photo
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1">
          <Crosshair className="h-4 w-4 text-civic" />
          12.9719° N, 77.6412° E · accuracy ±12m
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-civic" />
          12th Cross, Indiranagar
        </span>
      </div>
    </>
  );
}
function Details({
  category,
  setCategory,
  description,
  setDescription,
}: {
  category: string;
  setCategory: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}) {
  return (
    <>
      <p className="section-label">Step 2 of 4</p>
      <h2 className="mt-2 text-2xl font-extrabold">Describe the problem</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose the closest category and add enough detail for the responsible team.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={cn(
              "rounded-md border p-4 text-left text-sm font-bold transition-colors",
              category === item
                ? "border-civic bg-civic-soft text-civic"
                : "border-border hover:bg-muted",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <label className="mt-6 block text-sm font-bold">
        What needs attention?
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="For example: water is flowing onto the footpath after rain…"
          className="mt-2 min-h-28"
        />
      </label>
    </>
  );
}
function Duplicate() {
  const match = complaints[0];
  if (!match) return null;
  return (
    <>
      <p className="section-label">Step 3 of 4</p>
      <h2 className="mt-2 text-2xl font-extrabold">A nearby report may match</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Review this open report before continuing. Combining reports helps teams see the scale
        without losing accountability.
      </p>
      <div className="mt-6 rounded-lg border border-warning/40 bg-warning/10 p-5">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-warning text-warning-foreground">
            <ImageOff className="h-5 w-5" />
          </span>
          <div>
            <p className="font-extrabold">{match.category}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {match.location} · 140m away · {match.status}
            </p>
            <p className="mt-3 text-sm leading-6">{match.description}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => toast.info("You’ll receive updates on the matching report.")}
          >
            It’s the same issue
          </Button>
          <Button variant="ghost">Report separately</Button>
        </div>
      </div>
    </>
  );
}
function Review({ category, description }: { category: string; description: string }) {
  return (
    <>
      <p className="section-label">Step 4 of 4</p>
      <h2 className="mt-2 text-2xl font-extrabold">Review before submitting</h2>
      <div className="mt-6 divide-y divide-border rounded-lg border border-border">
        <Row label="Evidence" value="Fresh camera evidence attached" />
        <Row label="Category" value={category} />
        <Row label="Location" value="12th Cross, Indiranagar · GPS accuracy ±12m" />
        <Row label="Description" value={description} />
      </div>
      <div className="mt-5 flex gap-2 rounded-md bg-muted p-4 text-sm text-muted-foreground">
        <ShieldCheck className="h-5 w-5 shrink-0 text-civic" />
        Your contact details are not displayed on the public ward dashboard. Location and evidence
        are used to route this report.
      </div>
    </>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 p-4 sm:grid-cols-[130px_1fr]">
      <span className="text-sm font-bold">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}

import { AlertTriangle, MapPin, ShieldAlert } from "lucide-react";
import { complaints } from "@/lib/nagarseva-data";
import { cn } from "@/lib/utils";
export function CivicMap({ large = false, selectedId }: { large?: boolean; selectedId?: string }) {
  return (
    <div
      className={cn(
        "map-grid relative overflow-hidden border border-border bg-civic-soft",
        large ? "h-[580px]" : "h-[390px]",
      )}
      aria-label="Demonstration civic map"
    >
      <div className="absolute left-[9%] top-[18%] h-40 w-2 rotate-45 bg-card/85" />
      <div className="absolute right-[15%] top-[4%] h-[110%] w-4 -rotate-12 bg-card/85" />
      <div className="absolute bottom-[32%] left-0 h-3 w-[110%] rotate-6 bg-card/85" />
      {complaints.map((item) => (
        <div
          key={item.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
        >
          <div
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full border-4 border-card shadow-md",
              item.safety
                ? "bg-risk text-risk-foreground"
                : item.id === selectedId
                  ? "bg-warning text-warning-foreground"
                  : "bg-civic text-civic-foreground",
            )}
          >
            <MapPin className="h-4 w-4" />
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 rounded-md border border-border bg-card p-2 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-civic" /> Civic reports
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-risk" /> Reported safety risk
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Selected
        </span>
      </div>
      <p className="absolute right-4 top-4 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
        Demonstration map · Indiranagar
      </p>
    </div>
  );
}

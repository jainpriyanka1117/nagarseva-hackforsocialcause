import { createServerFn } from "@tanstack/react-start";
import { ensureDbInitialized } from "../db/index";
import { fetchComplaints } from "./complaints";

export type WardMetrics = {
  ward: string;
  totalComplaints: number;
  resolvedCount: number;
  inProgressCount: number;
  pendingVerificationCount: number;
  verifiedCount: number;
  reopenedCount: number;
  verifiedClosureRate: string;
  reopenRate: string;
  escalationRate: string;
  medianResolutionTime: string;
  categoryBreakdown: { category: string; count: number }[];
};

export async function fetchWardStats(ward = "Ward 82"): Promise<WardMetrics> {
  await ensureDbInitialized();
  const all = await fetchComplaints({ ward });

  const totalComplaints = all.length;
  const inProgressCount = all.filter(
    (c) => c.status === "In Progress" || c.status === "Accepted",
  ).length;
  const pendingVerificationCount = all.filter(
    (c) => c.status === "Resolved — pending verification",
  ).length;
  const verifiedCount = all.filter((c) => c.status === "Closed: verified").length;
  const unverifiedCount = all.filter((c) => c.status === "Closed: unverified").length;
  const reopenedCount = all.filter((c) => c.status === "Reopened").length;
  const resolvedCount = verifiedCount + unverifiedCount;

  const verifiedClosureRate =
    resolvedCount > 0 ? `${Math.round((verifiedCount / resolvedCount) * 100)}%` : "0%";
  const reopenRate =
    totalComplaints > 0 ? `${Math.round((reopenedCount / totalComplaints) * 100)}%` : "0%";
  const escalationRate = "12%";
  const medianResolutionTime = "4.2 days";

  // Category counts
  const categoryMap = new Map<string, number>();
  for (const c of all) {
    categoryMap.set(c.category, (categoryMap.get(c.category) ?? 0) + 1);
  }
  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));

  return {
    ward,
    totalComplaints,
    resolvedCount,
    inProgressCount,
    pendingVerificationCount,
    verifiedCount,
    reopenedCount,
    verifiedClosureRate,
    reopenRate,
    escalationRate,
    medianResolutionTime,
    categoryBreakdown,
  };
}

export type SafetyMapItem = {
  id: string;
  category: string;
  location: string;
  ward: string;
  status: string;
  priority: string;
  x: number;
  y: number;
  safety: boolean;
  sla: string;
};

export async function fetchSafetyMapData(): Promise<SafetyMapItem[]> {
  await ensureDbInitialized();
  const all = await fetchComplaints();
  return all.map((c) => ({
    id: c.id,
    category: c.category,
    location: c.location,
    ward: c.ward,
    status: c.status,
    priority: c.priority,
    x: c.x,
    y: c.y,
    safety: !!c.safety,
    sla: c.slaRemaining ?? "Standard SLA",
  }));
}

export const getWardStatsServerFn = createServerFn({ method: "GET" })
  .validator((d: { ward?: string } | undefined) => d)
  .handler(async ({ data }) => {
    return fetchWardStats(data?.ward);
  });

export const getSafetyMapServerFn = createServerFn({ method: "GET" }).handler(async () => {
  return fetchSafetyMapData();
});

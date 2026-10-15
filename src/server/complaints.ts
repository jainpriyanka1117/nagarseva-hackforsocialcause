import { createServerFn } from "@tanstack/react-start";
import { eq, desc, and } from "drizzle-orm";
import { db, ensureDbInitialized } from "../db/index";
import { complaints, complaintTimeline, complaintEvidence, type DbComplaint } from "../db/schema";
import { type Status } from "../lib/nagarseva-data";

export function calculateSla(priority: "High" | "Medium" | "Low"): {
  deadline: string;
  remaining: string;
} {
  const now = new Date();
  const hoursToAdd = priority === "High" ? 12 : priority === "Medium" ? 48 : 72;
  const deadlineDate = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  const deadlineStr = deadlineDate.toISOString();
  return {
    deadline: deadlineStr,
    remaining: `${hoursToAdd}h 00m remaining`,
  };
}

export function formatRemaining(deadlineStr?: string | null): string {
  if (!deadlineStr) return "Standard SLA";
  const now = new Date().getTime();
  const deadline = new Date(deadlineStr).getTime();
  const diffMs = deadline - now;
  if (diffMs <= 0) {
    const overdueHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    return `Overdue by ${overdueHours}h`;
  }
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h remaining`;
  }
  return `${hours}h ${mins}m remaining`;
}

export type ComplaintFilter = {
  ward?: string | undefined;
  category?: string | undefined;
  status?: string | undefined;
  safetyOnly?: boolean | undefined;
  search?: string | undefined;
};

export async function fetchComplaints(filter?: ComplaintFilter): Promise<DbComplaint[]> {
  await ensureDbInitialized();
  const query = db.select().from(complaints).orderBy(desc(complaints.createdAt));
  const all = await query;

  return all.filter((item) => {
    if (filter?.ward && item.ward.toLowerCase() !== filter.ward.toLowerCase()) return false;
    if (filter?.category && item.category.toLowerCase() !== filter.category.toLowerCase())
      return false;
    if (filter?.status && item.status.toLowerCase() !== filter.status.toLowerCase()) return false;
    if (filter?.safetyOnly && !item.safety) return false;
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      const match =
        item.id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export async function fetchComplaintById(id: string) {
  await ensureDbInitialized();
  const list = await db.select().from(complaints).where(eq(complaints.id, id));
  if (list.length === 0) return null;

  const complaint = list[0]!;
  const timeline = await db
    .select()
    .from(complaintTimeline)
    .where(eq(complaintTimeline.complaintId, id))
    .orderBy(desc(complaintTimeline.createdAt));
  const evidence = await db
    .select()
    .from(complaintEvidence)
    .where(eq(complaintEvidence.complaintId, id))
    .orderBy(desc(complaintEvidence.createdAt));

  return {
    ...complaint,
    slaRemaining: formatRemaining(complaint.slaDeadline),
    timeline,
    evidence,
  };
}

export type CreateComplaintInput = {
  category: string;
  location: string;
  ward?: string;
  description: string;
  x?: number;
  y?: number;
  priority?: "High" | "Medium" | "Low";
  safety?: boolean;
  citizenName?: string;
  citizenPhone?: string;
  citizenId?: string;
  evidenceUrl?: string;
};

export async function createComplaint(input: CreateComplaintInput) {
  await ensureDbInitialized();
  const priority = input.priority ?? (input.category === "Blocked drain" ? "High" : "Medium");
  const { deadline, remaining } = calculateSla(priority);
  const now = new Date().toISOString();

  // Generate ID: NS-24-XXXXX
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const id = `NS-24-${randomSuffix}`;

  const newRecord = {
    id,
    category: input.category,
    location: input.location,
    ward: input.ward ?? "Ward 82",
    status: "Submitted" as Status,
    priority,
    description: input.description,
    x: input.x ?? 50,
    y: input.y ?? 50,
    safety: !!input.safety,
    slaDeadline: deadline,
    slaRemaining: remaining,
    citizenId: input.citizenId ?? "usr_anonymous",
    citizenName: input.citizenName ?? "Local Citizen",
    citizenPhone: input.citizenPhone ?? "",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(complaints).values(newRecord);

  await db.insert(complaintTimeline).values({
    id: `tl_${id}_0`,
    complaintId: id,
    actorName: input.citizenName ?? "Local Citizen",
    actorRole: "Citizen",
    action: "Submitted issue",
    message: `Issue reported with ${priority} priority. SLA target set to ${remaining}.`,
    createdAt: now,
  });

  if (input.evidenceUrl) {
    await db.insert(complaintEvidence).values({
      id: `ev_${id}_0`,
      complaintId: id,
      fileUrl: input.evidenceUrl,
      caption: "Submitted evidence photo",
      uploadedBy: input.citizenName ?? "Citizen",
      createdAt: now,
    });
  }

  return newRecord;
}

export type UpdateComplaintStatusInput = {
  id: string;
  status: Status;
  actorName: string;
  actorRole: string;
  message?: string;
  resolutionProof?: string;
  verificationFeedback?: string;
};

export async function updateComplaintStatus(input: UpdateComplaintStatusInput) {
  await ensureDbInitialized();
  const now = new Date().toISOString();
  const updateData: Partial<typeof complaints.$inferInsert> = {
    status: input.status,
    updatedAt: now,
  };

  if (input.status === "Resolved — pending verification") {
    updateData.resolvedAt = now;
    if (input.resolutionProof) updateData.resolutionProof = input.resolutionProof;
  } else if (input.status === "Closed: verified" || input.status === "Closed: unverified") {
    updateData.verifiedAt = now;
    if (input.verificationFeedback) updateData.verificationFeedback = input.verificationFeedback;
  }

  await db.update(complaints).set(updateData).where(eq(complaints.id, input.id));

  await db.insert(complaintTimeline).values({
    id: `tl_${input.id}_${Date.now()}`,
    complaintId: input.id,
    actorName: input.actorName,
    actorRole: input.actorRole,
    action: `Status changed to ${input.status}`,
    message:
      input.message ??
      (input.status === "Closed: verified"
        ? "Citizen confirmed issue is satisfactorily resolved on ground."
        : input.status === "Reopened"
          ? "Citizen flagged that problem persists; escalated back to operations."
          : `Grievance transitioned to ${input.status}.`),
    createdAt: now,
  });

  return fetchComplaintById(input.id);
}

// Server functions for TanStack Start
export const getComplaintsServerFn = createServerFn({ method: "GET" })
  .validator((d: ComplaintFilter | undefined) => d)
  .handler(async ({ data }) => {
    return fetchComplaints(data);
  });

export const getComplaintByIdServerFn = createServerFn({ method: "GET" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    return fetchComplaintById(data.id);
  });

export const createComplaintServerFn = createServerFn({ method: "POST" })
  .validator((d: CreateComplaintInput) => d)
  .handler(async ({ data }) => {
    return createComplaint(data);
  });

export const updateComplaintStatusServerFn = createServerFn({ method: "POST" })
  .validator((d: UpdateComplaintStatusInput) => d)
  .handler(async ({ data }) => {
    return updateComplaintStatus(data);
  });

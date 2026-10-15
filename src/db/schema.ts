import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["citizen", "officer", "admin"] })
    .notNull()
    .default("citizen"),
  ward: text("ward").default("Ward 82"),
  department: text("department"),
  phone: text("phone"),
  createdAt: text("created_at").notNull(),
});

export const complaints = sqliteTable("complaints", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  ward: text("ward").notNull().default("Ward 82"),
  status: text("status", {
    enum: [
      "Submitted",
      "Accepted",
      "In Progress",
      "Resolved — pending verification",
      "Closed: verified",
      "Closed: unverified",
      "Reopened",
    ],
  })
    .notNull()
    .default("Submitted"),
  priority: text("priority", { enum: ["High", "Medium", "Low"] })
    .notNull()
    .default("Medium"),
  description: text("description").notNull(),
  x: real("x").notNull(),
  y: real("y").notNull(),
  safety: integer("safety", { mode: "boolean" }).default(false),
  slaDeadline: text("sla_deadline"),
  slaRemaining: text("sla_remaining"),
  citizenId: text("citizen_id"),
  citizenName: text("citizen_name").default("Local Citizen"),
  citizenPhone: text("citizen_phone"),
  assignedOfficerId: text("assigned_officer_id"),
  assignedOfficerName: text("assigned_officer_name"),
  resolvedAt: text("resolved_at"),
  verifiedAt: text("verified_at"),
  resolutionProof: text("resolution_proof"),
  verificationFeedback: text("verification_feedback"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const complaintTimeline = sqliteTable("complaint_timeline", {
  id: text("id").primaryKey(),
  complaintId: text("complaint_id").notNull(),
  actorName: text("actor_name").notNull(),
  actorRole: text("actor_role").notNull(),
  action: text("action").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});

export const complaintEvidence = sqliteTable("complaint_evidence", {
  id: text("id").primaryKey(),
  complaintId: text("complaint_id").notNull(),
  fileUrl: text("file_url").notNull(),
  caption: text("caption"),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: text("created_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DbComplaint = typeof complaints.$inferSelect;
export type NewComplaint = typeof complaints.$inferInsert;
export type DbTimeline = typeof complaintTimeline.$inferSelect;
export type DbEvidence = typeof complaintEvidence.$inferSelect;

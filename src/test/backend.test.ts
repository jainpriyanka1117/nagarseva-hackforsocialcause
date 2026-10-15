import { describe, it, expect, beforeAll } from "vitest";
import { ensureDbInitialized, db } from "../db/index";
import { complaints, users, complaintTimeline } from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, createToken, verifyToken } from "../server/crypto";
import {
  fetchComplaints,
  fetchComplaintById,
  createComplaint,
  updateComplaintStatus,
  calculateSla,
  formatRemaining,
} from "../server/complaints";
import { fetchWardStats, fetchSafetyMapData } from "../server/stats";
import { loginUser, registerUser } from "../server/auth";
import { saveEvidenceFile } from "../server/upload";

describe("Backend Database, Auth and Services", () => {
  beforeAll(async () => {
    await ensureDbInitialized();
  });

  describe("Database & Seeding", () => {
    it("initializes tables and seeds default complaints", async () => {
      const list = await db.select().from(complaints);
      expect(list.length).toBeGreaterThanOrEqual(4);
      const first = list.find((c) => c.id === "NS-24-01847");
      expect(first).toBeDefined();
      expect(first?.category).toBe("Blocked drain");
    });

    it("seeds default users with hashed passwords", async () => {
      const officerList = await db.select().from(users).where(eq(users.role, "officer"));
      expect(officerList.length).toBeGreaterThan(0);
      const officer = officerList[0];
      expect(officer?.email).toBe("officer@nagarseva.org");
      const valid = await verifyPassword("Officer123!", officer!.passwordHash);
      expect(valid).toBe(true);
    });
  });

  describe("Authentication System", () => {
    it("authenticates existing user and returns JWT token", async () => {
      const res = await loginUser({
        email: "officer@nagarseva.org",
        password: "Officer123!",
      });
      expect(res.token).toBeDefined();
      expect(res.user.role).toBe("officer");
      expect(res.user.name).toBe("Ramesh Kumar (JE)");

      const payload = await verifyToken(res.token);
      expect(payload?.userId).toBe(res.user.id);
    });

    it("rejects invalid credentials", async () => {
      await expect(
        loginUser({
          email: "officer@nagarseva.org",
          password: "WrongPassword!",
        }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("registers new citizen and issues token", async () => {
      const randomEmail = `citizen_${Date.now()}@example.com`;
      const res = await registerUser({
        name: "Ananya Roy",
        email: randomEmail,
        password: "Password123!",
        ward: "Ward 82",
      });
      expect(res.user.name).toBe("Ananya Roy");
      expect(res.user.role).toBe("citizen");

      const loginRes = await loginUser({
        email: randomEmail,
        password: "Password123!",
      });
      expect(loginRes.user.email).toBe(randomEmail);
    });

    it("rejects duplicate email registration", async () => {
      await expect(
        registerUser({
          name: "Duplicate User",
          email: "officer@nagarseva.org",
          password: "Password123!",
        }),
      ).rejects.toThrow("A user with this email already exists");
    });

    it("handles invalid or expired tokens gracefully", async () => {
      const invalid = await verifyToken("not.a.valid.jwt.token");
      expect(invalid).toBeNull();

      const empty = await verifyToken("");
      expect(empty).toBeNull();
    });
  });

  describe("Grievance Lifecycle & CRUD", () => {
    let createdComplaintId = "";

    it("creates a new complaint with SLA and timeline", async () => {
      const created = await createComplaint({
        category: "Blocked drain",
        location: "5th Main, 100 Feet Road",
        ward: "Ward 82",
        description: "Severe water logging after unexpected downpour.",
        priority: "High",
        safety: true,
        citizenName: "Ananya Roy",
      });

      expect(created.id).toMatch(/^NS-24-\d{5}$/);
      expect(created.status).toBe("Submitted");
      expect(created.slaDeadline).toBeDefined();
      createdComplaintId = created.id;

      const fetched = await fetchComplaintById(created.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.category).toBe("Blocked drain");
      expect(fetched?.timeline.length).toBeGreaterThanOrEqual(1);
      expect(fetched?.timeline[0]?.action).toBe("Submitted issue");
    });

    it("allows officer to accept and resolve grievance", async () => {
      // Step 1: Officer accepts
      await updateComplaintStatus({
        id: createdComplaintId,
        status: "In Progress",
        actorName: "Ramesh Kumar (JE)",
        actorRole: "Officer",
        message: "Maintenance crew dispatched with pump vehicle.",
      });

      let updated = await fetchComplaintById(createdComplaintId);
      expect(updated?.status).toBe("In Progress");

      // Step 2: Officer marks resolved pending verification
      await updateComplaintStatus({
        id: createdComplaintId,
        status: "Resolved — pending verification",
        actorName: "Ramesh Kumar (JE)",
        actorRole: "Officer",
        resolutionProof: "Drain unclogged and desilted by team.",
      });

      updated = await fetchComplaintById(createdComplaintId);
      expect(updated?.status).toBe("Resolved — pending verification");
      expect(updated?.resolvedAt).toBeDefined();
      expect(updated?.timeline.length).toBeGreaterThanOrEqual(3);
    });

    it("allows citizen to verify closure", async () => {
      await updateComplaintStatus({
        id: createdComplaintId,
        status: "Closed: verified",
        actorName: "Ananya Roy",
        actorRole: "Citizen",
        verificationFeedback: "Verified water cleared completely.",
      });

      const updated = await fetchComplaintById(createdComplaintId);
      expect(updated?.status).toBe("Closed: verified");
      expect(updated?.verifiedAt).toBeDefined();
    });

    it("allows citizen to reopen issue if dissatisfied", async () => {
      // Create new complaint for reopening
      const complaintToReopen = await createComplaint({
        category: "Pothole hazard",
        location: "100 Feet Road Junction",
        ward: "Ward 82",
        description: "Large pothole re-emerging on left lane.",
        priority: "High",
      });

      // Officer marks resolved
      await updateComplaintStatus({
        id: complaintToReopen.id,
        status: "Resolved — pending verification",
        actorName: "Ramesh Kumar (JE)",
        actorRole: "Officer",
        resolutionProof: "Asphalt patch applied.",
      });

      // Citizen reopens with feedback
      await updateComplaintStatus({
        id: complaintToReopen.id,
        status: "Reopened",
        actorName: "Ananya Roy",
        actorRole: "Citizen",
        reopenReason: "Patch washed away after evening rain; pothole still deep.",
      });

      const reopened = await fetchComplaintById(complaintToReopen.id);
      expect(reopened?.status).toBe("Reopened");
      expect(reopened?.reopenReason).toBe(
        "Patch washed away after evening rain; pothole still deep.",
      );
      expect(reopened?.timeline.some((t) => t.action === "Reopened")).toBe(true);
    });

    it("calculates SLA deadlines accurately according to priority", () => {
      const high = calculateSla("High");
      expect(high.remaining).toBe("12h 00m remaining");

      const medium = calculateSla("Medium");
      expect(medium.remaining).toBe("48h 00m remaining");

      const low = calculateSla("Low");
      expect(low.remaining).toBe("72h 00m remaining");
    });

    it("formats remaining SLA deadlines and detects overdue issues", () => {
      expect(formatRemaining(null)).toBe("Standard SLA");
      expect(formatRemaining(undefined)).toBe("Standard SLA");

      const pastDate = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
      expect(formatRemaining(pastDate)).toContain("Overdue by");

      const futureDate = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
      expect(formatRemaining(futureDate)).toContain("remaining");
    });

    it("filters complaints by ward, category, and safety", async () => {
      const safetyOnly = await fetchComplaints({ safetyOnly: true });
      expect(safetyOnly.every((c) => c.safety)).toBe(true);

      const blockedDrains = await fetchComplaints({ category: "Blocked drain" });
      expect(blockedDrains.every((c) => c.category === "Blocked drain")).toBe(true);
    });
  });

  describe("Ward Analytics & Map APIs", () => {
    it("computes ward statistics and metrics", async () => {
      const stats = await fetchWardStats("Ward 82");
      expect(stats.ward).toBe("Ward 82");
      expect(stats.totalComplaints).toBeGreaterThan(0);
      expect(stats.categoryBreakdown.length).toBeGreaterThan(0);
      expect(stats.verifiedClosureRate).toMatch(/\d+%/);
    });

    it("returns safety map coordinates", async () => {
      const mapData = await fetchSafetyMapData();
      expect(mapData.length).toBeGreaterThan(0);
      expect(mapData[0]?.x).toBeTypeOf("number");
      expect(mapData[0]?.y).toBeTypeOf("number");
    });
  });

  describe("Evidence Upload", () => {
    it("saves evidence attachment and attaches to complaint", async () => {
      const dummyBase64 = Buffer.from("test image content").toString("base64");
      const result = await saveEvidenceFile({
        complaintId: "NS-24-01847",
        fileName: "pothole_evidence.png",
        base64Data: `data:image/png;base64,${dummyBase64}`,
        caption: "Site inspection photo",
        uploadedBy: "Ramesh Kumar (JE)",
      });

      expect(result.fileUrl).toContain("/uploads/");
      expect(result.caption).toBe("Site inspection photo");

      const complaint = await fetchComplaintById("NS-24-01847");
      expect(complaint?.evidence.some((e) => e.fileUrl === result.fileUrl)).toBe(true);
    });
  });
});

import { db } from "./index";
import { users, complaints, complaintTimeline } from "./schema";
import { hashPassword } from "../server/crypto";
import { complaints as initialComplaints } from "../lib/nagarseva-data";

export async function seedDatabase() {
  const citizenPass = await hashPassword("Citizen123!");
  const officerPass = await hashPassword("Officer123!");
  const adminPass = await hashPassword("Admin123!");
  const now = new Date().toISOString();

  await db.insert(users).values([
    {
      id: "usr_citizen_1",
      name: "Priya Sharma",
      email: "citizen@nagarseva.org",
      passwordHash: citizenPass,
      role: "citizen",
      ward: "Ward 82",
      phone: "+91 98765 43210",
      createdAt: now,
    },
    {
      id: "usr_officer_1",
      name: "Ramesh Kumar (JE)",
      email: "officer@nagarseva.org",
      passwordHash: officerPass,
      role: "officer",
      ward: "Ward 82",
      department: "Drainage & Roads Operations",
      phone: "+91 98450 11223",
      createdAt: now,
    },
    {
      id: "usr_admin_1",
      name: "Municipal Commissioner",
      email: "admin@nagarseva.org",
      passwordHash: adminPass,
      role: "admin",
      ward: "Ward 82",
      department: "Municipal Administration",
      phone: "+91 80 2297 5500",
      createdAt: now,
    },
  ]);

  for (const c of initialComplaints) {
    await db.insert(complaints).values({
      id: c.id,
      category: c.category,
      location: c.location,
      ward: c.ward,
      status: c.status,
      priority: c.priority,
      description: c.description,
      x: c.x,
      y: c.y,
      safety: !!c.safety,
      slaRemaining: c.sla,
      citizenId: "usr_citizen_1",
      citizenName: "Priya Sharma",
      assignedOfficerId: "usr_officer_1",
      assignedOfficerName: "Ramesh Kumar (JE)",
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(complaintTimeline).values({
      id: `tl_${c.id}_init`,
      complaintId: c.id,
      actorName: "Priya Sharma",
      actorRole: "Citizen",
      action: "Submitted issue",
      message: `Issue reported with initial priority "${c.priority}" in ${c.ward}.`,
      createdAt: now,
    });

    if (c.status !== "Submitted") {
      await db.insert(complaintTimeline).values({
        id: `tl_${c.id}_ack`,
        complaintId: c.id,
        actorName: "Ramesh Kumar (JE)",
        actorRole: "Junior Engineer",
        action: "Acknowledged and routed",
        message: `Field team inspected location at ${c.location}. Current status: ${c.status}.`,
        createdAt: now,
      });
    }
  }
}

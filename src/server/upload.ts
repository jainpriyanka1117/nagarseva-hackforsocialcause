import { createServerFn } from "@tanstack/react-start";
import { ensureDbInitialized, db } from "../db/index";
import { complaintEvidence } from "../db/schema";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export type UploadEvidenceInput = {
  complaintId: string;
  fileName: string;
  base64Data: string;
  caption?: string;
  uploadedBy?: string;
};

export async function saveEvidenceFile(input: UploadEvidenceInput) {
  await ensureDbInitialized();

  // Create public uploads directory if not exists
  const uploadsDir = path.resolve(process.cwd(), "public/uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(input.fileName) || ".jpg";
  const uniqueName = `evidence_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  // Extract base64 payload if it includes a data url prefix
  const cleanBase64 = input.base64Data.includes(",")
    ? input.base64Data.split(",")[1]!
    : input.base64Data;
  const buffer = Buffer.from(cleanBase64, "base64");
  await fs.writeFile(filePath, buffer);

  const fileUrl = `/uploads/${uniqueName}`;
  const now = new Date().toISOString();
  const id = `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  await db.insert(complaintEvidence).values({
    id,
    complaintId: input.complaintId,
    fileUrl,
    caption: input.caption ?? "Evidence attachment",
    uploadedBy: input.uploadedBy ?? "Citizen",
    createdAt: now,
  });

  return {
    id,
    fileUrl,
    caption: input.caption,
    uploadedBy: input.uploadedBy,
    createdAt: now,
  };
}

export const uploadEvidenceServerFn = createServerFn({ method: "POST" })
  .validator((d: UploadEvidenceInput) => d)
  .handler(async ({ data }) => {
    return saveEvidenceFile(data);
  });

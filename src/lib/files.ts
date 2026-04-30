import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), "uploads");

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function saveFile(file: File): Promise<{
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
}> {
  await ensureUploadDir();

  const ext = path.extname(file.name);
  const filename = `${randomUUID()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return {
    filename,
    originalName: file.name,
    mimeType: file.type || guessMimeType(ext),
    fileSize: file.size,
    filePath,
  };
}

export async function deleteFile(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    // File may already be gone
  }
}

export function guessMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".csv": "text/csv",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".txt": "text/plain",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

export function isPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf" ||
    mimeType === "text/csv" ||
    mimeType === "text/plain" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const evidence = await db.evidence.findUnique({ where: { id } });
  if (!evidence) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isCsv =
    evidence.mimeType === "text/csv" || evidence.originalName.endsWith(".csv");
  const isWord =
    evidence.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    evidence.originalName.endsWith(".docx");

  if (isCsv) {
    const content = await fs.readFile(evidence.filePath, "utf-8");
    const Papa = await import("papaparse");
    const result = Papa.default.parse<string[]>(content, { skipEmptyLines: true });
    return NextResponse.json({ rows: result.data });
  }

  if (isWord) {
    const mammoth = await import("mammoth");
    const buffer = await fs.readFile(evidence.filePath);
    const result = await mammoth.default.convertToHtml({ buffer });
    return NextResponse.json({ html: result.value });
  }

  return NextResponse.json({ error: "Preview not supported for this file type" }, { status: 400 });
}

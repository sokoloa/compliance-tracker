import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const download = req.nextUrl.searchParams.get("download") === "1";

  const evidence = await db.evidence.findUnique({ where: { id } });
  if (!evidence) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!fs.existsSync(evidence.filePath)) {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }

  const stream = fs.createReadStream(evidence.filePath);
  const headers: HeadersInit = {
    "Content-Type": evidence.mimeType,
    "Content-Length": String(fs.statSync(evidence.filePath).size),
  };

  if (download) {
    headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(evidence.originalName)}"`;
  } else {
    headers["Content-Disposition"] = `inline; filename="${encodeURIComponent(evidence.originalName)}"`;
  }

  // @ts-expect-error ReadStream to ReadableStream
  return new NextResponse(stream, { headers });
}

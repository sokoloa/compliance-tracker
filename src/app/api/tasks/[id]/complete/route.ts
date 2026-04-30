import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { saveFile } from "@/lib/files";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: instanceId } = await params;

  const instance = await db.taskInstance.findUnique({
    where: { id: instanceId },
    include: { completion: true, template: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (instance.completion) return NextResponse.json({ error: "Already completed" }, { status: 409 });

  const formData = await req.formData();
  const notes = (formData.get("notes") as string | null) ?? "";
  const approverName = (formData.get("approverName") as string | null) ?? "";
  const approverTitle = (formData.get("approverTitle") as string | null) ?? "";
  const approverTeam = (formData.get("approverTeam") as string | null) ?? "";
  const approvedAtStr = (formData.get("approvedAt") as string | null) ?? "";
  const rawFiles = formData.getAll("files") as File[];
  const uploadedFiles = rawFiles.filter((f) => f.size > 0);

  if (!notes.trim() && uploadedFiles.length === 0) {
    return NextResponse.json(
      { error: "Notes or at least one evidence file is required." },
      { status: 400 }
    );
  }

  // Save files first
  const savedFiles = await Promise.all(uploadedFiles.map(saveFile));

  const completion = await db.taskCompletion.create({
    data: {
      instanceId,
      userId: session.user.id,
      notes: notes.trim() || null,
      approverName: approverName.trim() || null,
      approverTitle: approverTitle.trim() || null,
      approverTeam: approverTeam.trim() || null,
      approvedAt: approvedAtStr ? new Date(approvedAtStr) : null,
      evidence: {
        create: savedFiles.map((f) => ({
          filename: f.filename,
          originalName: f.originalName,
          mimeType: f.mimeType,
          fileSize: f.fileSize,
          filePath: f.filePath,
        })),
      },
    },
  });

  await logAudit({
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    userName: session.user.name ?? undefined,
    action: "TASK_COMPLETED",
    entityType: "TaskInstance",
    entityId: instanceId,
    details: {
      taskTitle: instance.template.title,
      periodLabel: instance.periodLabel,
      filesUploaded: savedFiles.length,
      hasNotes: !!notes.trim(),
      approverName: approverName || null,
    },
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ success: true, completionId: completion.id });
}

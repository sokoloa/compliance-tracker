import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const template = await db.taskTemplate.update({
    where: { id },
    data: { isActive: body.isActive },
  });

  await logAudit({
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    userName: session.user.name ?? undefined,
    action: body.isActive ? "TASK_TEMPLATE_ACTIVATED" : "TASK_TEMPLATE_DEACTIVATED",
    entityType: "TaskTemplate",
    entityId: id,
    details: { title: template.title },
  });

  return NextResponse.json({ success: true });
}

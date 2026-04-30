import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const count = await db.user.count();
  return NextResponse.json({ setupRequired: count === 0 });
}

export async function POST(req: NextRequest) {
  // Only works if no users exist
  const count = await db.user.count();
  if (count > 0) {
    return NextResponse.json({ error: "Setup already complete" }, { status: 409 });
  }

  const body = await req.json();
  const { name, email, password } = body;

  if (!name || !email || !password || password.length < 8) {
    return NextResponse.json({ error: "Name, email, and a password of at least 8 characters are required." }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);
  const user = await db.user.create({ data: { name, email, passwordHash } });

  await logAudit({
    userId: user.id,
    userEmail: email,
    userName: name,
    action: "USER_CREATED",
    entityType: "User",
    entityId: user.id,
    details: { setupFlow: true },
  });

  return NextResponse.json({ success: true });
}

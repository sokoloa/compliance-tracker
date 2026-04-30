import { db } from "@/lib/db";

interface AuditEntry {
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit(entry: AuditEntry) {
  try {
    await db.auditLog.create({ data: entry });
  } catch (err) {
    // Don't let audit failures break the main flow
    console.error("Audit log failed:", err);
  }
}

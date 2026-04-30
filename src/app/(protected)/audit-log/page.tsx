import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import {
  CheckCircle2, User, ToggleRight, ToggleLeft,
  AlertTriangle, LogIn, UserPlus, FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const ACTION_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  TASK_COMPLETED: { label: "Task completed", color: "text-green-700 bg-green-50", Icon: CheckCircle2 },
  TASK_TEMPLATE_ACTIVATED: { label: "Task activated", color: "text-indigo-700 bg-indigo-50", Icon: ToggleRight },
  TASK_TEMPLATE_DEACTIVATED: { label: "Task deactivated", color: "text-gray-600 bg-gray-100", Icon: ToggleLeft },
  USER_CREATED: { label: "User created", color: "text-purple-700 bg-purple-50", Icon: UserPlus },
  USER_LOGIN: { label: "User signed in", color: "text-blue-700 bg-blue-50", Icon: LogIn },
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const action = params.action ?? "";

  const where = action ? { action } : {};
  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const actions = await db.auditLog.findMany({
    select: { action: true },
    distinct: ["action"],
    orderBy: { action: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">{total.toLocaleString()} events recorded</p>
        </div>
      </div>

      {/* Filter */}
      <form className="flex items-center gap-3">
        <label className="text-sm text-gray-600 font-medium">Filter by action:</label>
        <select
          name="action"
          defaultValue={action}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          onChange={(e) => {
            const url = new URL(window.location.href);
            url.searchParams.set("action", e.target.value);
            url.searchParams.set("page", "1");
            window.location.href = url.toString();
          }}
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a.action} value={a.action}>
              {ACTION_META[a.action]?.label ?? a.action}
            </option>
          ))}
        </select>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No audit events yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => {
              const meta = ACTION_META[log.action];
              const Icon = meta?.Icon ?? FileText;
              const details = log.details as Record<string, string | number | boolean | null | undefined> | null;

              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4">
                  <div className={`flex-shrink-0 p-1.5 rounded-md ${meta?.color ?? "text-gray-600 bg-gray-100"}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">
                        {meta?.label ?? log.action}
                      </span>
                      {details?.taskTitle && (
                        <span className="text-sm text-gray-600">
                          — {String(details.taskTitle)}
                          {details.periodLabel && ` (${details.periodLabel})`}
                        </span>
                      )}
                      {details?.title && !details.taskTitle && (
                        <span className="text-sm text-gray-600">— {String(details.title)}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {log.userName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.userName}
                          {log.userEmail && ` (${log.userEmail})`}
                        </span>
                      )}
                      <span>{formatDateTime(log.createdAt)}</span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>

                    {/* Extra details */}
                    {details && (
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {details.filesUploaded != null && Number(details.filesUploaded) > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {String(details.filesUploaded)} file(s) uploaded
                          </span>
                        )}
                        {details.hasNotes && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            Notes included
                          </span>
                        )}
                        {details.approverName && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            Approved by: {String(details.approverName)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`?page=${page - 1}${action ? `&action=${action}` : ""}`}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?page=${page + 1}${action ? `&action=${action}` : ""}`}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

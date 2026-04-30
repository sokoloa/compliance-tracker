import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { formatDate, formatDateTime, formatFrequency, formatFileSize, getDaysUntil } from "@/lib/utils";
import { FrameworkBadge } from "@/components/framework-badge";
import CompleteTaskForm from "@/components/tasks/complete-task-form";
import EvidencePreview from "@/components/evidence/evidence-preview";
import {
  Calendar, Clock, CheckCircle2, AlertTriangle,
  User, Users, FileText, Download, ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const instance = await db.taskInstance.findUnique({
    where: { id },
    include: {
      template: { include: { category: true } },
      completion: {
        include: {
          evidence: { orderBy: { uploadedAt: "asc" } },
          user: true,
        },
      },
    },
  });

  if (!instance) notFound();

  const now = new Date();
  const isCompleted = !!instance.completion;
  const isOverdue = !isCompleted && new Date(instance.dueDate) < now;
  const daysLeft = getDaysUntil(instance.dueDate);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/tasks"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Tasks
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {instance.template.category.code}
              </span>
              <FrameworkBadge
                isSOC2={instance.template.isSOC2}
                isHIPAA={instance.template.isHIPAA}
              />
              <span className="text-xs text-gray-400">{formatFrequency(instance.template.frequency)}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{instance.template.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{instance.template.category.name}</p>
            {instance.template.description && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                {instance.template.description}
              </p>
            )}
          </div>

          {/* Status pill */}
          <div className="flex-shrink-0">
            {isCompleted ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </span>
            ) : isOverdue ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-50 px-3 py-1.5 rounded-full">
                <AlertTriangle className="h-4 w-4" />
                {Math.abs(daysLeft)}d overdue
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                <Clock className="h-4 w-4" />
                {daysLeft}d left
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-5 mt-5 pt-5 border-t border-gray-100 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Period: <strong className="text-gray-700">{instance.periodLabel}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>Due: <strong className="text-gray-700">{formatDate(instance.dueDate)}</strong></span>
          </div>
          {instance.template.requiresApproval && (
            <div className="flex items-center gap-1.5 text-amber-600">
              <Users className="h-4 w-4" />
              <span className="font-medium">Requires approval tracking</span>
            </div>
          )}
        </div>
      </div>

      {/* Completion record (if done) */}
      {isCompleted && instance.completion && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completion Record
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-green-600 font-medium mb-0.5">Submitted By</p>
                <p className="text-green-900 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {instance.completion.user.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium mb-0.5">Submitted At</p>
                <p className="text-green-900">{formatDateTime(instance.completion.completedAt)}</p>
              </div>
              {instance.completion.approverName && (
                <>
                  <div>
                    <p className="text-xs text-green-600 font-medium mb-0.5">Approved By</p>
                    <p className="text-green-900">
                      {instance.completion.approverName}
                      {instance.completion.approverTitle && ` · ${instance.completion.approverTitle}`}
                    </p>
                  </div>
                  {instance.completion.approverTeam && (
                    <div>
                      <p className="text-xs text-green-600 font-medium mb-0.5">Team / Department</p>
                      <p className="text-green-900">{instance.completion.approverTeam}</p>
                    </div>
                  )}
                  {instance.completion.approvedAt && (
                    <div>
                      <p className="text-xs text-green-600 font-medium mb-0.5">Approval Date</p>
                      <p className="text-green-900">{formatDate(instance.completion.approvedAt)}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {instance.completion.notes && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-xs text-green-600 font-medium mb-1.5 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Notes
                </p>
                <p className="text-sm text-green-900 whitespace-pre-wrap">{instance.completion.notes}</p>
              </div>
            )}
          </div>

          {/* Evidence files */}
          {instance.completion.evidence.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Evidence ({instance.completion.evidence.length} file{instance.completion.evidence.length !== 1 ? "s" : ""})
              </h2>
              <div className="space-y-3">
                {instance.completion.evidence.map((ev) => (
                  <EvidencePreview key={ev.id} evidence={ev} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion form (if not done) */}
      {!isCompleted && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Mark as Complete</h2>
          <CompleteTaskForm
            instanceId={instance.id}
            requiresApproval={instance.template.requiresApproval}
            userId={session!.user.id}
            userName={session!.user.name ?? ""}
          />
        </div>
      )}
    </div>
  );
}

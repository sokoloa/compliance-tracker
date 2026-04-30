import { db } from "@/lib/db";
import { ensureTaskInstances } from "@/lib/tasks";
import { formatDate, getDaysUntil } from "@/lib/utils";
import Link from "next/link";
import {
  AlertTriangle, Clock, CheckCircle2, TrendingUp,
  ArrowRight, Calendar,
} from "lucide-react";
import { FrameworkBadge } from "@/components/framework-badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Ensure instances exist for current + next year
  await ensureTaskInstances();

  const now = new Date();

  const [overdueInstances, upcomingInstances, completedCount, totalActive] =
    await Promise.all([
      // Overdue: past due date, no completion
      db.taskInstance.findMany({
        where: { dueDate: { lt: now }, completion: null },
        include: {
          template: { include: { category: true } },
          completion: true,
        },
        orderBy: { dueDate: "asc" },
      }),

      // Upcoming: due in the future, not completed, within next 90 days
      db.taskInstance.findMany({
        where: {
          dueDate: { gte: now, lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) },
          completion: null,
        },
        include: {
          template: { include: { category: true } },
          completion: true,
        },
        orderBy: { dueDate: "asc" },
        take: 20,
      }),

      // Completed this year
      db.taskCompletion.count({
        where: {
          completedAt: { gte: new Date(now.getFullYear(), 0, 1) },
        },
      }),

      // Total active instances this year
      db.taskInstance.count({
        where: {
          dueDate: {
            gte: new Date(now.getFullYear(), 0, 1),
            lte: new Date(now.getFullYear(), 11, 31),
          },
        },
      }),
    ]);

  const stats = [
    {
      label: "Overdue",
      value: overdueInstances.length,
      icon: AlertTriangle,
      color: overdueInstances.length > 0 ? "text-red-600" : "text-gray-400",
      bg: overdueInstances.length > 0 ? "bg-red-50" : "bg-gray-50",
      iconBg: overdueInstances.length > 0 ? "bg-red-100" : "bg-gray-100",
    },
    {
      label: "Due in 90 days",
      value: upcomingInstances.length,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
    },
    {
      label: "Completed this year",
      value: completedCount,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
    },
    {
      label: "Total this year",
      value: totalActive,
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      iconBg: "bg-indigo-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, iconBg }) => (
          <div key={label} className={`${bg} rounded-xl p-5 border border-transparent`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
              <div className={`${iconBg} rounded-lg p-2`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Overdue */}
        <Section
          title="Overdue"
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          empty={overdueInstances.length === 0}
          emptyText="No overdue tasks"
          href="/tasks?status=overdue"
        >
          {overdueInstances.slice(0, 8).map((instance) => (
            <TaskRow
              key={instance.id}
              id={instance.id}
              title={instance.template.title}
              category={instance.template.category.name}
              dueDate={instance.dueDate}
              periodLabel={instance.periodLabel}
              isSOC2={instance.template.isSOC2}
              isHIPAA={instance.template.isHIPAA}
              status="overdue"
            />
          ))}
        </Section>

        {/* Upcoming */}
        <Section
          title="Upcoming (90 days)"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          empty={upcomingInstances.length === 0}
          emptyText="Nothing due in the next 90 days"
          href="/tasks?status=upcoming"
        >
          {upcomingInstances.slice(0, 8).map((instance) => (
            <TaskRow
              key={instance.id}
              id={instance.id}
              title={instance.template.title}
              category={instance.template.category.name}
              dueDate={instance.dueDate}
              periodLabel={instance.periodLabel}
              isSOC2={instance.template.isSOC2}
              isHIPAA={instance.template.isHIPAA}
              status="upcoming"
            />
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title, icon, children, empty, emptyText, href,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  empty: boolean;
  emptyText: string;
  href: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        </div>
        <Link
          href={href}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {empty ? (
        <div className="flex items-center justify-center py-12 text-sm text-gray-400">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {emptyText}
        </div>
      ) : (
        <div className="divide-y divide-gray-50">{children}</div>
      )}
    </div>
  );
}

function TaskRow({
  id, title, category, dueDate, periodLabel, isSOC2, isHIPAA, status,
}: {
  id: string;
  title: string;
  category: string;
  dueDate: Date;
  periodLabel: string;
  isSOC2: boolean;
  isHIPAA: boolean;
  status: "overdue" | "upcoming";
}) {
  const days = getDaysUntil(dueDate);

  return (
    <Link
      href={`/tasks/${id}`}
      className="flex items-start justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{category}</span>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {periodLabel}
          </span>
          <FrameworkBadge isSOC2={isSOC2} isHIPAA={isHIPAA} small />
        </div>
      </div>
      <div className="ml-3 flex-shrink-0 text-right">
        {status === "overdue" ? (
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            {Math.abs(days)}d overdue
          </span>
        ) : (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            days <= 14
              ? "text-amber-700 bg-amber-50"
              : "text-gray-600 bg-gray-100"
          }`}>
            {days}d left
          </span>
        )}
      </div>
    </Link>
  );
}

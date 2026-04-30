"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, Calendar, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { cn, formatDate, getDaysUntil, formatFrequency } from "@/lib/utils";
import { FrameworkBadge } from "@/components/framework-badge";

type Instance = {
  id: string;
  periodLabel: string;
  dueDate: string | Date;
  completion: {
    id: string;
    completedAt: string | Date;
    notes: string | null;
    approverName: string | null;
    user: { name: string };
    evidence: { id: string }[];
  } | null;
  template: {
    title: string;
    description: string | null;
    frequency: string;
    isSOC2: boolean;
    isHIPAA: boolean;
    category: { id: string; name: string; code: string };
  };
};

type Category = { id: string; code: string; name: string; framework: string };

interface TaskListProps {
  instances: Instance[];
  categories: Category[];
  now: string;
  initialStatus?: string;
  initialFramework?: string;
  initialFrequency?: string;
  initialCategory?: string;
  initialSearch?: string;
}

export default function TaskList({
  instances, categories, now,
  initialStatus, initialFramework, initialFrequency, initialCategory, initialSearch,
}: TaskListProps) {
  const [search, setSearch] = useState(initialSearch ?? "");
  const [status, setStatus] = useState(initialStatus ?? "all");
  const [framework, setFramework] = useState(initialFramework ?? "all");
  const [frequency, setFrequency] = useState(initialFrequency ?? "all");
  const [category, setCategory] = useState(initialCategory ?? "all");

  const nowDate = new Date(now);

  function getStatus(instance: Instance): "overdue" | "due_soon" | "upcoming" | "completed" {
    if (instance.completion) return "completed";
    const due = new Date(instance.dueDate);
    if (due < nowDate) return "overdue";
    const days = getDaysUntil(due);
    if (days <= 30) return "due_soon";
    return "upcoming";
  }

  const filtered = useMemo(() => {
    return instances.filter((inst) => {
      const s = getStatus(inst);
      if (status !== "all") {
        if (status === "overdue" && s !== "overdue") return false;
        if (status === "upcoming" && s !== "upcoming" && s !== "due_soon") return false;
        if (status === "completed" && s !== "completed") return false;
        if (status === "due_soon" && s !== "due_soon") return false;
      }
      if (framework === "soc2" && !inst.template.isSOC2) return false;
      if (framework === "hipaa" && !inst.template.isHIPAA) return false;
      if (frequency !== "all" && inst.template.frequency !== frequency) return false;
      if (category !== "all" && inst.template.category.id !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !inst.template.title.toLowerCase().includes(q) &&
          !inst.template.category.name.toLowerCase().includes(q) &&
          !inst.periodLabel.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [instances, status, framework, frequency, category, search]);

  const counts = useMemo(() => ({
    overdue: instances.filter((i) => getStatus(i) === "overdue").length,
    due_soon: instances.filter((i) => getStatus(i) === "due_soon").length,
    upcoming: instances.filter((i) => getStatus(i) === "upcoming").length,
    completed: instances.filter((i) => getStatus(i) === "completed").length,
  }), [instances]);

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: "all", label: "All" },
          { key: "overdue", label: `Overdue (${counts.overdue})` },
          { key: "due_soon", label: `Due Soon (${counts.due_soon})` },
          { key: "upcoming", label: `Upcoming (${counts.upcoming})` },
          { key: "completed", label: `Completed (${counts.completed})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              status === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 pr-3 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />

        <select
          value={framework}
          onChange={(e) => setFramework(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="all">All Frameworks</option>
          <option value="soc2">SOC 2</option>
          <option value="hipaa">HIPAA</option>
        </select>

        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="all">All Frequencies</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="SEMI_ANNUAL">Semi-Annual</option>
          <option value="ANNUAL">Annual</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      <p className="text-xs text-gray-500">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm">No tasks match your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((instance) => {
            const s = getStatus(instance);
            return (
              <Link
                key={instance.id}
                href={`/tasks/${instance.id}`}
                className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <StatusIcon status={s} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{instance.template.title}</p>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                        <span className="text-xs text-gray-500">
                          {instance.template.category.code} · {instance.template.category.name}
                        </span>
                        <FrameworkBadge
                          isSOC2={instance.template.isSOC2}
                          isHIPAA={instance.template.isHIPAA}
                          small
                        />
                        <span className="text-xs text-gray-400">{formatFrequency(instance.template.frequency)}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Calendar className="h-3 w-3" />
                        {instance.periodLabel}
                      </div>
                      <StatusBadge status={s} dueDate={new Date(instance.dueDate)} />
                    </div>
                  </div>

                  {instance.completion && (
                    <div className="mt-2 text-xs text-gray-400">
                      Completed by {instance.completion.user.name} on{" "}
                      {formatDate(instance.completion.completedAt)} ·{" "}
                      {instance.completion.evidence.length} file(s)
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />;
  if (status === "overdue") return <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />;
  if (status === "due_soon") return <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />;
  return <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />;
}

function StatusBadge({ status, dueDate }: { status: string; dueDate: Date }) {
  const days = getDaysUntil(dueDate);
  if (status === "completed") {
    return <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">Completed</span>;
  }
  if (status === "overdue") {
    return (
      <span className="text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-medium">
        {Math.abs(days)}d overdue
      </span>
    );
  }
  if (status === "due_soon") {
    return (
      <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
        {days}d left
      </span>
    );
  }
  return (
    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
      Due {formatDate(dueDate)}
    </span>
  );
}

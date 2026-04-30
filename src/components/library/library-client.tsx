"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Star, Search, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { cn, formatFrequency } from "@/lib/utils";
import { FrameworkBadge } from "@/components/framework-badge";

type Template = {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  isSOC2: boolean;
  isHIPAA: boolean;
  isCommon: boolean;
  isActive: boolean;
  requiresApproval: boolean;
  category: { id: string; code: string; name: string; framework: string };
};

type Category = { id: string; code: string; name: string; framework: string };

interface LibraryClientProps {
  templates: Template[];
  categories: Category[];
}

export default function LibraryClient({ templates, categories }: LibraryClientProps) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [localTemplates, setLocalTemplates] = useState(templates);

  const filtered = localTemplates.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.category.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Group by category
  const byCategory = categories.map((cat) => ({
    category: cat,
    tasks: filtered.filter((t) => t.category.id === cat.id),
  })).filter((g) => g.tasks.length > 0);

  function toggleCategory(id: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function shouldShowTask(task: Template) {
    if (showAll || search) return true;
    return task.isCommon;
  }

  async function toggleActive(template: Template) {
    setTogglingId(template.id);
    try {
      const res = await fetch(`/api/library/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !template.isActive }),
      });
      if (res.ok) {
        setLocalTemplates((prev) =>
          prev.map((t) =>
            t.id === template.id ? { ...t, isActive: !t.isActive } : t
          )
        );
      }
    } finally {
      setTogglingId(null);
    }
  }

  const commonCount = filtered.filter((t) => t.isCommon).length;
  const allCount = filtered.length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 pr-3 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={() => setShowAll((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          {showAll ? (
            <><ToggleRight className="h-5 w-5 text-indigo-600" /> Showing all {allCount} tasks</>
          ) : (
            <><ToggleLeft className="h-5 w-5 text-gray-400" /> Showing {commonCount} common tasks</>
          )}
        </button>
      </div>

      {!showAll && !search && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Showing most common tasks only. Toggle above to see all {allCount} tasks.
        </p>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {byCategory.map(({ category, tasks }) => {
          const visibleTasks = tasks.filter(shouldShowTask);
          const hiddenCount = tasks.filter((t) => !shouldShowTask(t)).length;
          if (visibleTasks.length === 0 && hiddenCount === 0) return null;

          const isExpanded = expandedCategories.has(category.id) || !!search;

          return (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {category.code}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                  <span className="text-xs text-gray-400">{category.framework}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {visibleTasks.length} task{visibleTasks.length !== 1 ? "s" : ""}
                  {hiddenCount > 0 && !showAll && ` (${hiddenCount} hidden)`}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {visibleTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-4 px-5 py-4">
                      {task.isCommon && (
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0 mt-1" />
                      )}
                      {!task.isCommon && <div className="w-3.5 flex-shrink-0" />}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "text-sm font-medium",
                            task.isActive ? "text-gray-900" : "text-gray-400 line-through"
                          )}>
                            {task.title}
                          </span>
                          <FrameworkBadge isSOC2={task.isSOC2} isHIPAA={task.isHIPAA} small />
                          <span className="text-xs text-gray-400">{formatFrequency(task.frequency)}</span>
                          {task.requiresApproval && (
                            <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                              Requires approval
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => toggleActive(task)}
                        disabled={togglingId === task.id}
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-colors flex-shrink-0",
                          task.isActive
                            ? "text-green-700 bg-green-50 hover:bg-green-100"
                            : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                        )}
                      >
                        {togglingId === task.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : task.isActive ? (
                          <><ToggleRight className="h-3.5 w-3.5" /> Active</>
                        ) : (
                          <><ToggleLeft className="h-3.5 w-3.5" /> Inactive</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

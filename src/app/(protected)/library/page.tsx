import { db } from "@/lib/db";
import LibraryClient from "@/components/library/library-client";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const [templates, categories] = await Promise.all([
    db.taskTemplate.findMany({
      include: { category: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { title: "asc" }],
    }),
    db.controlCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Task Library</h1>
        <p className="text-sm text-gray-500 mt-1">
          All {templates.length} compliance tasks across {categories.length} control categories.
          Common tasks are highlighted.
        </p>
      </div>
      <LibraryClient templates={templates} categories={categories} />
    </div>
  );
}

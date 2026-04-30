import { db } from "@/lib/db";
import { ensureTaskInstances } from "@/lib/tasks";
import TaskList from "@/components/tasks/task-list";

export const dynamic = "force-dynamic";

interface SearchParams {
  status?: string;
  framework?: string;
  frequency?: string;
  category?: string;
  q?: string;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await ensureTaskInstances();

  const params = await searchParams;
  const now = new Date();

  const instances = await db.taskInstance.findMany({
    include: {
      template: { include: { category: true } },
      completion: {
        include: { evidence: true, user: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const categories = await db.controlCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">
          All compliance tasks across SOC 2 and HIPAA frameworks
        </p>
      </div>
      <TaskList
        instances={instances}
        categories={categories}
        now={now.toISOString()}
        initialStatus={params.status}
        initialFramework={params.framework}
        initialFrequency={params.frequency}
        initialCategory={params.category}
        initialSearch={params.q}
      />
    </div>
  );
}

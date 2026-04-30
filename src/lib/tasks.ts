import { db } from "@/lib/db";
import { endOfYear } from "date-fns";

function getPeriods(frequency: string, year: number) {
  const periods: { label: string; dueDate: Date }[] = [];

  if (frequency === "ANNUAL") {
    periods.push({
      label: `${year}`,
      dueDate: endOfYear(new Date(year, 0, 1)),
    });
  } else if (frequency === "SEMI_ANNUAL") {
    periods.push(
      { label: `H1 ${year}`, dueDate: new Date(year, 5, 30) },
      { label: `H2 ${year}`, dueDate: new Date(year, 11, 31) }
    );
  } else if (frequency === "QUARTERLY") {
    for (let q = 0; q < 4; q++) {
      const quarter = q + 1;
      const monthEnd = q * 3 + 2; // Mar=2, Jun=5, Sep=8, Dec=11
      const lastDay = [31, 30, 30, 31][q];
      periods.push({
        label: `Q${quarter} ${year}`,
        dueDate: new Date(year, monthEnd, lastDay),
      });
    }
  }

  return periods;
}

export async function ensureTaskInstances() {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  const templates = await db.taskTemplate.findMany({
    where: { isActive: true },
    select: { id: true, frequency: true },
  });

  for (const template of templates) {
    for (const year of years) {
      const periods = getPeriods(template.frequency, year);
      for (const period of periods) {
        await db.taskInstance.upsert({
          where: {
            templateId_periodLabel: {
              templateId: template.id,
              periodLabel: period.label,
            },
          },
          update: {},
          create: {
            templateId: template.id,
            periodLabel: period.label,
            dueDate: period.dueDate,
          },
        });
      }
    }
  }
}

export type TaskInstanceStatus = "COMPLETED" | "OVERDUE" | "DUE_SOON" | "UPCOMING";

export function getInstanceStatus(
  dueDate: Date,
  completed: boolean
): TaskInstanceStatus {
  if (completed) return "COMPLETED";
  const now = new Date();
  if (dueDate < now) return "OVERDUE";
  const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 30) return "DUE_SOON";
  return "UPCOMING";
}

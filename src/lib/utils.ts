import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getDaysUntil(date: Date | string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: Date | string) {
  return getDaysUntil(dueDate) < 0;
}

export function formatFrequency(frequency: string) {
  switch (frequency) {
    case "QUARTERLY": return "Quarterly";
    case "SEMI_ANNUAL": return "Semi-Annual";
    case "ANNUAL": return "Annual";
    default: return frequency;
  }
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFrameworkBadges(isSOC2: boolean, isHIPAA: boolean) {
  const badges = [];
  if (isSOC2 && isHIPAA) return [{ label: "SOC 2 + HIPAA", color: "purple" }];
  if (isSOC2) badges.push({ label: "SOC 2", color: "indigo" });
  if (isHIPAA) badges.push({ label: "HIPAA", color: "teal" });
  return badges;
}

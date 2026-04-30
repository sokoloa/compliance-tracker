import { cn } from "@/lib/utils";

interface FrameworkBadgeProps {
  isSOC2: boolean;
  isHIPAA: boolean;
  small?: boolean;
}

export function FrameworkBadge({ isSOC2, isHIPAA, small }: FrameworkBadgeProps) {
  if (!isSOC2 && !isHIPAA) return null;

  const base = cn(
    "inline-flex items-center font-medium rounded-full",
    small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"
  );

  if (isSOC2 && isHIPAA) {
    return (
      <span className={cn(base, "bg-purple-100 text-purple-700")}>
        SOC 2 + HIPAA
      </span>
    );
  }
  if (isSOC2) {
    return <span className={cn(base, "bg-indigo-100 text-indigo-700")}>SOC 2</span>;
  }
  return <span className={cn(base, "bg-teal-100 text-teal-700")}>HIPAA</span>;
}

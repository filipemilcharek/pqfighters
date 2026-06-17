import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "green" | "warning" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-surface-tertiary text-content-secondary border border-border",
        variant === "success" && "bg-orange-50 text-orange-600 border border-orange-200",
        variant === "green" && "bg-emerald-50 text-emerald-600 border border-emerald-200",
        variant === "warning" && "bg-amber-50 text-amber-600 border border-amber-200",
        variant === "danger" && "bg-red-50 text-red-600 border border-red-200",
        className
      )}
    >
      {children}
    </span>
  );
}

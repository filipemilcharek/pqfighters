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
        variant === "default" && "bg-zinc-800 text-zinc-300 border border-zinc-700",
        variant === "success" && "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        variant === "green" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        variant === "warning" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        variant === "danger" && "bg-red-500/10 text-red-400 border border-red-500/20",
        className
      )}
    >
      {children}
    </span>
  );
}

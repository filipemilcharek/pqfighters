import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "primary" &&
            "bg-accent text-white hover:bg-accent-dark",
          variant === "secondary" &&
            "bg-surface-tertiary text-content-primary border border-border hover:bg-border",
          variant === "danger" &&
            "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20",
          variant === "ghost" &&
            "text-content-secondary hover:bg-surface-secondary hover:text-content-primary",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

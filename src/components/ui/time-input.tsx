"use client";

import { cn } from "@/lib/utils";

interface TimeInputProps {
  label?: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  required?: boolean;
  className?: string;
}

export function TimeInput({ label, value, onChange, required, className }: TimeInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/[^\d:]/g, "");
    if (v.length === 2 && !v.includes(":") && value.length < v.length) {
      v = v + ":";
    }
    if (v.length <= 5) {
      onChange({ target: { value: v } });
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-content-secondary mb-1.5">
          {label}
        </label>
      )}
      <input
        type="text"
        inputMode="numeric"
        placeholder="HH:mm"
        pattern="^([01]\d|2[0-3]):[0-5]\d$"
        maxLength={5}
        value={value}
        onChange={handleChange}
        required={required}
        className={cn(
          "w-full rounded-lg border border-border bg-surface-primary px-3 py-2.5 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all",
          className
        )}
      />
    </div>
  );
}

import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";

const COLS: Record<number, string> = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5" };

export interface ChoiceOption<T> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

/** Tap-to-pick chips. With `allowClear`, tapping the active chip unsets it ("Let AI choose"). */
export function ChoiceGroup<T extends string | boolean>({
  value,
  onChange,
  options,
  columns,
  allowClear = false,
}: {
  value: T | undefined;
  onChange: (v: T | undefined) => void;
  options: ChoiceOption<T>[];
  columns?: number;
  allowClear?: boolean;
}) {
  const cols = COLS[columns ?? Math.min(options.length, 4)] ?? COLS[4];
  return (
    <div role="radiogroup" className={`grid gap-2 grid-cols-2 ${cols}`}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={opt.disabled}
            onClick={() => onChange(active && allowClear ? undefined : opt.value)}
            className={`px-3 py-3 rounded-xl text-sm font-medium text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              active
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            <div className="font-semibold leading-tight">{opt.label}</div>
            {opt.hint && (
              <div className={`text-xs mt-0.5 font-normal ${active ? "text-primary-foreground/75" : "text-muted-foreground/70"}`}>
                {opt.hint}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Warnings({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-2" role="status">
      {items.map((w) => (
        <div
          key={w}
          className="flex gap-2 items-start rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
          <span>{w}</span>
        </div>
      ))}
    </div>
  );
}

export function Question({ children, optional }: { children: ReactNode; optional?: boolean }) {
  return (
    <FormLabel className="text-foreground font-medium">
      {children}
      {optional && <span className="text-muted-foreground font-normal"> (optional)</span>}
    </FormLabel>
  );
}

export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  unit,
  placeholder,
  required,
  min,
  max,
  optional,
  step,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  unit: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  optional?: boolean;
  step?: number;
}) {
  return (
    <FormField
      control={control}
      name={name}
      rules={{
        required: required ? `${label} is required` : false,
        min: min !== undefined ? { value: min, message: `Must be at least ${min} ${unit}` } : undefined,
        max: max !== undefined ? { value: max, message: `Must be at most ${max} ${unit}` } : undefined,
      }}
      render={({ field }) => (
        <FormItem>
          <Question optional={optional}>{label}</Question>
          <div className="relative">
            <FormControl>
              <Input
                type="number"
                inputMode="decimal"
                step={step}
                placeholder={placeholder}
                className="h-12 rounded-xl border-border bg-secondary/50 pr-12 text-heading"
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
              />
            </FormControl>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unit}</div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

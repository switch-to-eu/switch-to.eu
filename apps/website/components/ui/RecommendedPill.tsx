import { Check } from "lucide-react";

/**
 * Marks a service we recommend. A soft green pill in the content, never a
 * shape over a screenshot (DESIGN.md: no blob shapes on cards).
 */
export function RecommendedPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-green">
      <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
      {label}
    </span>
  );
}

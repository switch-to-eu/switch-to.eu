/** Two comparison facts on a pick card: a quiet label above a stronger value. */
export function CategoryFacts({
  facts,
  className = "",
}: {
  facts: { label: string; value: string }[];
  className?: string;
}) {
  if (facts.length === 0) return null;

  return (
    <dl className={`grid grid-cols-2 gap-x-5 gap-y-3 ${className}`}>
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className="text-sm text-[#1a1a1a]/70 mb-0.5">{fact.label}</dt>
          <dd className="font-semibold leading-snug">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

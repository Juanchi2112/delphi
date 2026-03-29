export default function PricingCard({
  name,
  price,
  priceNote,
  features,
  featured = false,
}: {
  name: string;
  price: string;
  priceNote?: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 space-y-4 ${
        featured
          ? "glass border-2 !border-emerald-500 ring-1 ring-emerald-500/20"
          : "glass"
      }`}
    >
      {featured && (
        <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Más popular
        </span>
      )}
      <h3 className="text-lg font-semibold text-stone-50">{name}</h3>
      <div>
        <span className="text-3xl font-bold text-stone-50 font-[family-name:var(--font-geist-mono)]">
          {price}
        </span>
        {priceNote && (
          <span className="text-sm text-stone-500 ml-1">{priceNote}</span>
        )}
      </div>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-stone-300">
            <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

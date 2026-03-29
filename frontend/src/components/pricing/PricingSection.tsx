import ScrollReveal from "@/components/ui/ScrollReveal";
import PricingCard from "./PricingCard";

const TIERS = [
  {
    name: "Explorador",
    price: "Gratis",
    features: [
      "Mapa general de riesgo por región",
      "3 consultas de localidad por mes",
      "Datos de temporada actual",
    ],
  },
  {
    name: "Productor",
    price: "USD 29",
    priceNote: "/mes",
    featured: true,
    features: [
      "Localidades ilimitadas",
      "Análisis SHAP de factores de riesgo",
      "Alertas por email y WhatsApp",
      "Comparación entre temporadas",
      "Recomendaciones personalizadas",
    ],
  },
  {
    name: "Asesor",
    price: "USD 99",
    priceNote: "/mes",
    features: [
      "Dashboard multi-cliente",
      "Acceso a API REST",
      "Reportes PDF descargables",
      "Hasta 50 lotes monitoreados",
      "Soporte prioritario",
    ],
  },
  {
    name: "Corporativo",
    price: "Custom",
    features: [
      "API ilimitada + white-label",
      "Modelos personalizados por zona",
      "Inteligencia de mercado regional",
      "SLA garantizado",
      "Integración con sistemas propios",
    ],
  },
];

export default function PricingSection() {
  return (
    <section id="planes" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-50 mb-2 text-center">
            Planes
          </h2>
          <p className="text-stone-400 text-center mb-10 max-w-lg mx-auto">
            Suscripción durante campaña (septiembre-marzo). Desde acceso básico
            hasta inteligencia corporativa.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((tier) => (
              <PricingCard key={tier.name} {...tier} />
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-10 text-center">
            <p className="text-stone-500 text-sm max-w-xl mx-auto">
              <span className="text-stone-300 font-medium">Visión de expansión:</span>{" "}
              Misma arquitectura para otras plagas (cogollero, roya, langosta)
              y otros países (Brasil, México, EEUU donde la chicharrita apareció en 2024).
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

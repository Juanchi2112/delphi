"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/shadcn-button";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface PlanFeature {
  label: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  recommended?: boolean;
}

const TIERS: PricingTier[] = [
  {
    name: "Explorador",
    price: "Gratis",
    description: "Para productores que quieren conocer el panorama general.",
    features: [
      { label: "Mapa general de riesgo por región", included: true },
      { label: "3 consultas de localidad por mes", included: true },
      { label: "Datos de temporada actual", included: true },
      { label: "Análisis SHAP de factores", included: false },
      { label: "Alertas por email y WhatsApp", included: false },
    ],
    cta: "Comenzar gratis",
  },
  {
    name: "Productor",
    price: "USD 29",
    priceNote: "/mes",
    description: "Para productores que necesitan monitoreo activo de sus lotes.",
    features: [
      { label: "Localidades ilimitadas", included: true },
      { label: "Análisis SHAP de factores de riesgo", included: true },
      { label: "Alertas por email y WhatsApp", included: true },
      { label: "Comparación entre temporadas", included: true },
      { label: "Recomendaciones personalizadas", included: true },
    ],
    cta: "Elegir Productor",
    recommended: true,
  },
  {
    name: "Asesor",
    price: "USD 99",
    priceNote: "/mes",
    description: "Para asesores agronómicos que gestionan múltiples clientes.",
    features: [
      { label: "Dashboard multi-cliente", included: true },
      { label: "Acceso a API REST", included: true },
      { label: "Reportes PDF descargables", included: true },
      { label: "Hasta 50 lotes monitoreados", included: true },
      { label: "Soporte prioritario", included: true },
    ],
    cta: "Elegir Asesor",
  },
];

export default function PricingModule() {
  return (
    <div className="max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-stone-50 mb-4 font-[family-name:var(--font-space-grotesk)]">
            Planes
          </h2>
          <p className="text-stone-400 text-lg max-w-lg mx-auto">
            Suscripción durante campaña (septiembre–marzo).
            <br />
            Desde acceso básico hasta inteligencia corporativa.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative flex flex-col glass border rounded-2xl transition-all hover:border-emerald-500/30",
                tier.recommended
                  ? "border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20 scale-[1.03]"
                  : "border-stone-800",
              )}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-fit bg-emerald-500 text-stone-950 text-xs font-semibold px-3 py-1 rounded-full">
                  Más popular
                </div>
              )}

              <CardHeader className="text-center pt-8 pb-4">
                <CardDescription className="text-stone-400 text-xs font-semibold uppercase tracking-wider">
                  {tier.name}
                </CardDescription>
                <CardTitle className="text-4xl font-bold text-emerald-400 font-[family-name:var(--font-geist-mono)] mt-3">
                  {tier.price}
                  {tier.priceNote && (
                    <span className="text-sm text-stone-500 font-normal ml-1">
                      {tier.priceNote}
                    </span>
                  )}
                </CardTitle>
                <p className="text-sm text-stone-400 mt-3">{tier.description}</p>
              </CardHeader>

              <CardContent className="flex-1 pt-2">
                <div className="border-t border-stone-800 mb-6" />

                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-3 text-sm">
                      <CircleCheck
                        className={cn(
                          "h-4 w-4 shrink-0",
                          f.included ? "text-emerald-500" : "text-stone-600",
                        )}
                      />
                      <span
                        className={cn(
                          f.included
                            ? "text-stone-300"
                            : "text-stone-600 line-through",
                        )}
                      >
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    size="lg"
                    className={cn(
                      "w-full text-base",
                      tier.recommended
                        ? "bg-emerald-500 text-stone-950 hover:bg-emerald-400"
                        : "border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-stone-100",
                    )}
                    variant={tier.recommended ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <div className="mt-12 text-center">
          <p className="text-stone-500 text-sm max-w-xl mx-auto">
            <span className="text-stone-300 font-medium">Visión de expansión:</span>{" "}
            Misma arquitectura para otras plagas (cogollero, roya, langosta)
            y otros países (Brasil, México, EEUU donde la chicharrita apareció en 2024).
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}

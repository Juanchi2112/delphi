"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BentoItem } from "@/components/ui/cybernetic-bento-grid";
import InfiniteGrid from "@/components/ui/the-infinite-grid";
import ShimmerButton from "@/components/ui/shimmer-button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function SaberMasPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        <InfiniteGrid>
          {/* ═══ HERO ═══ */}
          <div className="flex flex-col items-center px-4 pt-24 md:pt-32 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center max-w-3xl mx-auto"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Link>

              {/* Animated logo — ping radar */}
              <div className="flex justify-center mb-6">
                <svg
                  className="w-20 h-20 overflow-visible"
                  viewBox="0 0 56 56"
                >
                  <path
                    d="M28,6 A22,22 0 1,1 8,34"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1"
                    opacity=".15"
                  />
                  <path
                    d="M28,12 A16,16 0 1,1 14,32"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1"
                    opacity=".25"
                  />
                  <path
                    d="M28,18 A10,10 0 1,1 20,30"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.2"
                    opacity=".45"
                  />
                  <circle
                    className="hero-ping"
                    cx="28"
                    cy="28"
                    r="4"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <circle
                    className="hero-core"
                    cx="28"
                    cy="28"
                    r="4"
                    fill="#fff"
                  />
                </svg>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-stone-50 mb-4 font-[family-name:var(--font-space-grotesk)]">
                {"\u00bf"}Por qu{"\u00e9"} funciona?
              </h1>
              <p className="text-xl md:text-2xl text-emerald-400 font-medium mb-8">
                Ciencia detr{"\u00e1"}s de cada predicci{"\u00f3"}n.
              </p>
            </motion.div>
          </div>

          {/* ═══ INTRO ═══ */}
          <section className="px-4 pb-24">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal>
                <BentoItem>
                  <p className="text-stone-300 leading-relaxed">
                    No le pedimos a un LLM que adivine una plaga: modelamos se{"\u00f1"}ales biol{"\u00f3"}gicas reales que ya hoy anticipan el comportamiento de{" "}
                    <em className="text-stone-200">Dalbulus maidis</em>. El vector responde al clima, a la memoria poblacional de la zona, a la cercan{"\u00ed"}a con focos previos y al momento fenol{"\u00f3"}gico del cultivo. Nuestra propuesta junta esas se{"\u00f1"}ales en un score de riesgo interpretable, antes de que el da{"\u00f1"}o sea visible.
                  </p>
                </BentoItem>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══ Qué problema modelamos ═══ */}
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
                  Qu{"\u00e9"} problema modelamos
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <BentoItem>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    Hoy modelamos dos decisiones concretas. La primera es el riesgo estacional pre-campa{"\u00f1"}a: estimar si una localidad va a terminar una temporada con un brote relevante. La segunda es el riesgo quincenal: estimar si la pr{"\u00f3"}xima lectura de monitoreo puede transformarse en outbreak en los siguientes 14 d{"\u00ed"}as. Eso vuelve la herramienta {"\u00fa"}til tanto para decidir siembra, h{"\u00ed"}brido y protecci{"\u00f3"}n como para priorizar monitoreo durante la campa{"\u00f1"}a.
                  </p>
                </BentoItem>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══ Qué modelos usamos ═══ */}
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
                  Qu{"\u00e9"} modelos usamos
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <BentoItem>
                  <div className="space-y-4">
                    <p className="text-sm text-stone-400 leading-relaxed">
                      El modelo pre-campa{"\u00f1"}a trabaja con 28 variables y 913 combinaciones localidad-temporada v{"\u00e1"}lidas en seis regiones. El modelo quincenal trabaja con 44 variables y 14.347 lecturas v{"\u00e1"}lidas, resumidas en 521 localidades monitoreadas. El n{"\u00fa"}cleo validado usa XGBoost.
                    </p>
                    <p className="text-sm text-stone-400 leading-relaxed">
                      Tambi{"\u00e9"}n experimentamos con MLP tabular, XGBoost + estad{"\u00ed"}sticas NDVI y un h{"\u00ed"}brido CNN(NDVI)+tabular.
                    </p>
                    <p className="text-sm text-stone-400 leading-relaxed">
                      Contamos con una arquitectura multiagente que fusiona sat{"\u00e9"}lite, clima, visi{"\u00f3"}n artificial y epidemiolog{"\u00ed"}a con pesos fijos; al final entra un LLM para explicar y recomendar, no para calcular el riesgo.
                    </p>
                  </div>
                </BentoItem>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══ Modelos poblacionales ═══ */}
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
                  Modelos poblacionales
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <BentoItem>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    Contamos con proxies poblacionales estad{"\u00ed"}sticos: capturas actuales y acumuladas, tendencia de capturas, brotes vecinos a 50/100/200 km, presi{"\u00f3"}n de propagaci{"\u00f3"}n, distancia a la zona end{"\u00e9"}mica y memoria de la temporada anterior. En otras palabras: no simulamos cada insecto, sino que aprendemos de la din{"\u00e1"}mica real observada en la red de trampas.
                  </p>
                </BentoItem>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══ De dónde salen los datos ═══ */}
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
                  De d{"\u00f3"}nde salen los datos
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <BentoItem>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    La base principal sale de 38 reportes de la Red Nacional de Monitoreo de INTA. A eso se le suman clima hist{"\u00f3"}rico v{"\u00ed"}a Open-Meteo, el {"\u00ed"}ndice ENSO/ONI v{"\u00ed"}a NOAA, geocodificaci{"\u00f3"}n v{"\u00ed"}a Nominatim y una v{"\u00ed"}a adicional de scraping de Power BI del INTA para capturas por localidad. Como extensi{"\u00f3"}n satelital, tambi{"\u00e9"}n se utilizan parches NDVI de Sentinel-2/Copernicus. Cruzamos monitoreo real, clima regional, geograf{"\u00ed"}a y, en la versi{"\u00f3"}n extendida, sat{"\u00e9"}lite e im{"\u00e1"}genes de campo.
                  </p>
                </BentoItem>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══ Feature engineering ═══ */}
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
                  El feature engineering captura la biolog{"\u00ed"}a del problema
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <BentoItem>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    El modelo pre-campa{"\u00f1"}a construye variables que tienen sentido agron{"\u00f3"}mico: heladas, heladas severas, temperatura m{"\u00ed"}nima absoluta, d{"\u00ed"}as templados de invierno, grados-d{"\u00ed"}a, humedad, precipitaci{"\u00f3"}n, viento norte, distancia a la zona end{"\u00e9"}mica, cercan{"\u00ed"}a a brotes previos y capturas de la temporada anterior. El modelo quincenal agrega estado local y propagaci{"\u00f3"}n: capturas actuales, m{"\u00e1"}ximos acumulados, ratio de detecciones, presi{"\u00f3"}n vecinal, clima del per{"\u00ed"}odo y estacionalidad. La l{"\u00f3"}gica detr{"\u00e1"}s es simple: la chicharrita no aparece al azar; sobrevive mejor a inviernos benignos, se mueve regionalmente, se acelera con ciertas condiciones clim{"\u00e1"}ticas y pega distinto seg{"\u00fa"}n el estado del cultivo.
                  </p>
                </BentoItem>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══ Es interpretable ═══ */}
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
                  Es interpretable
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <BentoItem>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    Cada score servido por la app viene acompa{"\u00f1"}ado por SHAP. Eso permite mostrar no solo el n{"\u00fa"}mero final, sino qu{"\u00e9"} variables empujan el riesgo hacia arriba o hacia abajo. En el modelo estacional, la variable que m{"\u00e1"}s veces aparece como driver principal es la distancia a la zona end{"\u00e9"}mica, junto con precipitaci{"\u00f3"}n de primavera, latitud y variables de viento y temperatura. En el modelo quincenal, el factor dominante suele ser la captura actual, seguido por la presi{"\u00f3"}n vecinal. Esta interpretabilidad es una ventaja fuerte: el sistema puede justificar la alerta con evidencia legible para un agr{"\u00f3"}nomo o productor.
                  </p>
                </BentoItem>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══ Respaldo científico ═══ */}
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
                  Respaldo cient{"\u00ed"}fico
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <BentoItem>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    El paper de referencia de Istchuk et al. (2025) no valida todo nuestro producto, pero s{"\u00ed"} valida la direcci{"\u00f3"}n causal correcta: clima, calendario y contexto del cultivo ayudan a anticipar la din{"\u00e1"}mica de{" "}
                    <em className="text-stone-300">Dalbulus maidis</em> y la infecci{"\u00f3"}n por mollicutes. Ese trabajo entren{"\u00f3"} redes neuronales sobre cuatro {"\u00e1"}reas de Brasil entre 2019 y 2023 y report{"\u00f3"} R{"\u00b2"} de 0.71 para abundancia y acuerdos de clasificaci{"\u00f3"}n de 0.81 para infecci{"\u00f3"}n. Nuestro enfoque se apoya en la misma intuici{"\u00f3"}n biol{"\u00f3"}gica, pero la lleva a una herramienta m{"\u00e1"}s interpretable y operativa para Argentina, con mayor cobertura territorial y explicaciones por SHAP.
                  </p>
                </BentoItem>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══ Roadmap ═══ */}
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
                  Lo que viene
                </h2>
                <p className="text-stone-400 text-lg max-w-2xl mx-auto">
                  La chicharrita fue el punto de entrada. La visi{"\u00f3"}n es una plataforma de riesgo fitosanitario para toda Latinoam{"\u00e9"}rica.
                </p>
              </ScrollReveal>

              {/* Timeline */}
              <div className="space-y-6">
                {/* Q2 2026 */}
                <ScrollReveal delay={0.1}>
                  <BentoItem>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="shrink-0">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold font-[family-name:var(--font-geist-mono)]">
                          Q2 2026
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-stone-100 mb-2">
                          Consolidaci{"\u00f3"}n Argentina + nuevas plagas en ma{"\u00ed"}z
                        </h3>
                        <p className="text-sm text-stone-400 leading-relaxed">
                          Cobertura completa de las seis regiones maiceras con ambos modelos en producci{"\u00f3"}n. Incorporamos el segundo vector: cogollero (<em className="text-stone-300">Spodoptera frugiperda</em>), la otra gran amenaza del ma{"\u00ed"}z argentino. El pipeline ya est{"\u00e1"} dise{"\u00f1"}ado para recibir nuevas plagas sin reescribir la arquitectura {"\u2014"} mismo framework de features clim{"\u00e1"}ticas, poblacionales y satelitales, distinto target.
                        </p>
                      </div>
                    </div>
                  </BentoItem>
                </ScrollReveal>

                {/* Q3 2026 */}
                <ScrollReveal delay={0.15}>
                  <BentoItem>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="shrink-0">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold font-[family-name:var(--font-geist-mono)]">
                          Q3 2026
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-stone-100 mb-2">
                          Soja y trigo: roya, mancha en red, chicharrita de los cereales
                        </h3>
                        <p className="text-sm text-stone-400 leading-relaxed">
                          Expandimos a los otros dos cultivos que definen la campa{"\u00f1"}a pampeana. Roya asi{"\u00e1"}tica de la soja (<em className="text-stone-300">Phakopsora pachyrhizi</em>) y mancha en red de la cebada/trigo (<em className="text-stone-300">Drechslera teres</em>) ya tienen redes de monitoreo p{"\u00fa"}blicas con datos suficientes para entrenar. La chicharrita de los cereales (<em className="text-stone-300">Delphacodes kuscheli</em>) completa el set para protecci{"\u00f3"}n integrada de lotes mixtos.
                        </p>
                      </div>
                    </div>
                  </BentoItem>
                </ScrollReveal>

                {/* Q4 2026 */}
                <ScrollReveal delay={0.2}>
                  <BentoItem>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="shrink-0">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-stone-700/50 text-stone-300 text-xs font-semibold font-[family-name:var(--font-geist-mono)]">
                          Q4 2026
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-stone-100 mb-2">
                          Brasil: el mercado m{"\u00e1"}s grande del continente
                        </h3>
                        <p className="text-sm text-stone-400 leading-relaxed">
                          Brasil produce 130M de toneladas de ma{"\u00ed"}z al a{"\u00f1"}o y enfrenta el mismo vector con a{"\u00fa"}n m{"\u00e1"}s presi{"\u00f3"}n. El trabajo de Istchuk et al. en Paran{"\u00e1"}, Mato Grosso do Sul, S{"\u00e3"}o Paulo y Minas Gerais ya valid{"\u00f3"} que las mismas se{"\u00f1"}ales clim{"\u00e1"}ticas funcionan en su territorio. Adaptamos features a la estructura de datos de EMBRAPA y Conab, recalibramos umbrales, y desplegamos con soporte biling{"\u00fc"}e.
                        </p>
                      </div>
                    </div>
                  </BentoItem>
                </ScrollReveal>

                {/* 2027 H1 */}
                <ScrollReveal delay={0.25}>
                  <BentoItem>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="shrink-0">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-stone-700/50 text-stone-300 text-xs font-semibold font-[family-name:var(--font-geist-mono)]">
                          H1 2027
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-stone-100 mb-2">
                          Paraguay, Uruguay y Bolivia
                        </h3>
                        <p className="text-sm text-stone-400 leading-relaxed">
                          Los tres pa{"\u00ed"}ses comparten cintur{"\u00f3"}n productivo, clima y en muchos casos las mismas plagas con Argentina y Brasil. Paraguay ya es el sexto exportador mundial de soja. Uruguay tiene una agricultura de precisi{"\u00f3"}n cada vez m{"\u00e1"}s sofisticada. Bolivia expande su frontera agr{"\u00ed"}cola en Santa Cruz. El modelo regional no necesita reinventarse: necesita calibrarse con datos locales y sumar fuentes de monitoreo de cada pa{"\u00ed"}s.
                        </p>
                      </div>
                    </div>
                  </BentoItem>
                </ScrollReveal>

                {/* 2027 H2 */}
                <ScrollReveal delay={0.3}>
                  <BentoItem>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="shrink-0">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-stone-700/50 text-stone-300 text-xs font-semibold font-[family-name:var(--font-geist-mono)]">
                          H2 2027
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-stone-100 mb-2">
                          Plataforma multi-cultivo, multi-plaga, multi-pa{"\u00ed"}s
                        </h3>
                        <p className="text-sm text-stone-400 leading-relaxed">
                          El objetivo final es que cualquier combinaci{"\u00f3"}n cultivo-plaga-regi{"\u00f3"}n pueda integrarse al sistema con el mismo framework: features clim{"\u00e1"}ticos y poblacionales, modelos interpretables, SHAP para explicar, y un agente que traduzca el score en una recomendaci{"\u00f3"}n concreta. Caf{"\u00e9"} con roya en Colombia, ca{"\u00f1"}a con taladro en Tucum{"\u00e1"}n, vid con lobesia en Mendoza. La arquitectura ya est{"\u00e1"} pensada para escalar {"\u2014"} lo que cambia son los datos de entrada, no el motor.
                        </p>
                      </div>
                    </div>
                  </BentoItem>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* ═══ Por qué esto importa + CTA ═══ */}
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
                  Por qu{"\u00e9"} esto importa
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <BentoItem>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    La propuesta funciona porque traduce se{"\u00f1"}ales dispersas en una decisi{"\u00f3"}n concreta. No reemplaza al monitoreo humano: lo prioriza, lo acelera y lo hace m{"\u00e1"}s focalizado. En vez de llegar tarde a un PDF quincenal, el productor puede ver d{"\u00f3"}nde el riesgo ya se est{"\u00e1"} acumulando y por qu{"\u00e9"}.
                  </p>
                </BentoItem>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="text-center mt-12">
                  <div className="flex items-center justify-center gap-4">
                    <ShimmerButton
                      onClick={() => (window.location.href = "/")}
                      className="text-base"
                    >
                      Explorar el mapa {"\u2192"}
                    </ShimmerButton>
                    <Link
                      href="/login"
                      className="px-6 py-3 border border-stone-700 text-stone-300 font-medium rounded-xl hover:border-stone-600 hover:text-stone-200 transition-colors text-sm"
                    >
                      Crear cuenta
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </InfiniteGrid>
      </main>

      <Footer />
    </>
  );
}

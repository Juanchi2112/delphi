import { getScores, getMetadata, getMonitoringScores, getMonitoringAlerts } from "@/lib/api";
import type { MonitoringScoreItem, AlertsResponse } from "@/lib/types";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ImpactSection from "@/components/landing/ImpactSection";
import MapSection from "@/components/map/MapSection";
import StatsSection from "@/components/stats/StatsSection";
import PricingSection from "@/components/pricing/PricingSection";
import TeamSection from "@/components/landing/TeamSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function Home() {
  let items: Awaited<ReturnType<typeof getScores>>["items"] = [];
  let metadata: Awaited<ReturnType<typeof getMetadata>> | null = null;
  let monitoringItems: MonitoringScoreItem[] = [];
  let alerts: AlertsResponse | null = null;

  try {
    const [scoresRes, metaRes, monRes, alertsRes] = await Promise.all([
      getScores({ limit: 5000 }),
      getMetadata(),
      getMonitoringScores({ limit: 5000 }).catch(() => ({ items: [] as MonitoringScoreItem[], count: 0, filters: {} })),
      getMonitoringAlerts().catch(() => null),
    ]);
    items = scoresRes.items;
    metadata = metaRes;
    monitoringItems = monRes.items;
    alerts = alertsRes;
  } catch (e) {
    console.error("Failed to fetch data from API:", e);
  }

  const seasons = metadata?.seasons_available ?? ["2024-2025", "2025-2026"];
  const regionsCount = metadata?.regions_available?.length ?? 6;
  const recordsValid = metadata?.records_valid ?? items.length;

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <HeroSection>
          <ProblemSection />
          <ImpactSection />
          <FeaturesSection />
        </HeroSection>

        <MapSection items={items} monitoringItems={monitoringItems} alerts={alerts} seasons={seasons} />

        <StatsSection items={items} />

        <TeamSection />

        <PricingSection />
      </main>

      <Footer />
    </>
  );
}

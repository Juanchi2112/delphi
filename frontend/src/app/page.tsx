import { getScores, getMetadata } from "@/lib/api";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import MapSection from "@/components/map/MapSection";
import StatsSection from "@/components/stats/StatsSection";
import PricingSection from "@/components/pricing/PricingSection";
import TeamSection from "@/components/landing/TeamSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function Home() {
  let items: Awaited<ReturnType<typeof getScores>>["items"] = [];
  let metadata: Awaited<ReturnType<typeof getMetadata>> | null = null;

  try {
    const [scoresRes, metaRes] = await Promise.all([
      getScores({ limit: 5000 }),
      getMetadata(),
    ]);
    items = scoresRes.items;
    metadata = metaRes;
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
          <FeaturesSection />
        </HeroSection>

        <MapSection items={items} seasons={seasons} />

        <StatsSection items={items} />

        <TeamSection />

        <PricingSection />
      </main>

      <Footer />
    </>
  );
}

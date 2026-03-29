import { getScores, getMetadata } from "@/lib/api";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  let items: Awaited<ReturnType<typeof getScores>>["items"] = [];
  let seasons: string[] = ["2024-2025", "2025-2026"];

  try {
    const [scoresRes, metaRes] = await Promise.all([
      getScores({ limit: 5000 }),
      getMetadata(),
    ]);
    items = scoresRes.items;
    seasons = metaRes.seasons_available;
  } catch (e) {
    console.error("Failed to fetch data from API:", e);
  }

  return <DashboardClient items={items} seasons={seasons} />;
}

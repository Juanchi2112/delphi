import { getScores, getMetadata, getMonitoringScores, getMonitoringAlerts } from "@/lib/api";
import type { MonitoringScoreItem, AlertsResponse } from "@/lib/types";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  let items: Awaited<ReturnType<typeof getScores>>["items"] = [];
  let seasons: string[] = ["2024-2025", "2025-2026"];
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
    seasons = metaRes.seasons_available;
    monitoringItems = monRes.items;
    alerts = alertsRes;
  } catch (e) {
    console.error("Failed to fetch data from API:", e);
  }

  return (
    <DashboardClient
      items={items}
      seasons={seasons}
      monitoringItems={monitoringItems}
      alerts={alerts}
    />
  );
}

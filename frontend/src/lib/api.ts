import type {
  ScoresResponse,
  LocalidadDetail,
  MetadataResponse,
  ReportResponse,
  MonitoringScoresResponse,
  MonitoringLocalidadDetail,
  AlertsResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getScores(params?: {
  temporada?: string;
  region?: string;
  risk_level?: string;
  min_risk?: number;
  limit?: number;
}): Promise<ScoresResponse> {
  const searchParams = new URLSearchParams();
  if (params?.temporada) searchParams.set("temporada", params.temporada);
  if (params?.region) searchParams.set("region", params.region);
  if (params?.risk_level) searchParams.set("risk_level", params.risk_level);
  if (params?.min_risk != null)
    searchParams.set("min_risk", String(params.min_risk));
  searchParams.set("limit", String(params?.limit ?? 5000));

  const res = await fetch(`${API_BASE}/scores?${searchParams}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getLocalidad(id: string): Promise<LocalidadDetail> {
  const res = await fetch(`${API_BASE}/localidades/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function generateReport(
  localidadId: string,
  body?: { campo_nombre?: string; hectareas?: number }
): Promise<ReportResponse> {
  const res = await fetch(
    `${API_BASE}/informes/${encodeURIComponent(localidadId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : JSON.stringify({}),
    }
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Monitoring
// ---------------------------------------------------------------------------

export async function getMonitoringScores(params?: {
  temporada?: string;
  region?: string;
  risk_level?: string;
  alert_category?: string;
  min_risk?: number;
  limit?: number;
}): Promise<MonitoringScoresResponse> {
  const searchParams = new URLSearchParams();
  if (params?.temporada) searchParams.set("temporada", params.temporada);
  if (params?.region) searchParams.set("region", params.region);
  if (params?.risk_level) searchParams.set("risk_level", params.risk_level);
  if (params?.alert_category) searchParams.set("alert_category", params.alert_category);
  if (params?.min_risk != null) searchParams.set("min_risk", String(params.min_risk));
  searchParams.set("limit", String(params?.limit ?? 5000));

  const res = await fetch(`${API_BASE}/monitoring/scores?${searchParams}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getMonitoringLocalidad(
  localidadKey: string
): Promise<MonitoringLocalidadDetail> {
  const res = await fetch(
    `${API_BASE}/monitoring/localidades/${encodeURIComponent(localidadKey)}`
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getMonitoringAlerts(
  temporada?: string
): Promise<AlertsResponse> {
  const searchParams = new URLSearchParams();
  if (temporada) searchParams.set("temporada", temporada);
  const res = await fetch(`${API_BASE}/monitoring/alerts?${searchParams}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function getMetadata(): Promise<MetadataResponse> {
  const res = await fetch(`${API_BASE}/metadata`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

import type {
  ScoresResponse,
  LocalidadDetail,
  MetadataResponse,
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

export async function getMetadata(): Promise<MetadataResponse> {
  const res = await fetch(`${API_BASE}/metadata`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

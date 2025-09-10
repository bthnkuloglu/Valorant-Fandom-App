// src/api/esports.ts
const VLR_BASE = "https://vlrggapi.vercel.app";

export type VlrNewsItem = {
  title: string; description: string; date: string; author: string; url_path: string;
};

export type VlrPlayerStats = {
  player: string; org: string; rating: string;
  average_combat_score: string; kill_deaths: string;
  kill_assists_survived_traded: string; average_damage_per_round: string;
  kills_per_round: string; assists_per_round: string;
  first_kills_per_round: string; first_deaths_per_round: string;
  headshot_percentage: string; clutch_success_percentage: string;
};

export type VlrRanking = {
  rank: string; team: string; country: string;
  last_played: string; last_played_team: string;
  last_played_team_logo: string; record: string; earnings: string; logo: string;
};

export type VlrMatch = {
  team1: string; team2: string; score1?: string; score2?: string;
  time_until_match?: string; time_completed?: string;
  match_series?: string; match_event?: string; round_info?: string;
  tournament_name?: string; tournament_icon?: string; match_page: string;
  unix_timestamp?: string; flag1?: string; flag2?: string;
  team1_logo?: string; team2_logo?: string;
};

export type VlrEvent = {
  title: string; status: string; prize: string; dates: string;
  region: string; thumb: string; url_path: string;
};

async function http<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

// News
export async function getVlrNews(): Promise<VlrNewsItem[]> {
  const data = await http<{ data: { segments: VlrNewsItem[] } }>(`${VLR_BASE}/news`);
  return data.data.segments ?? [];
}

// Player Stats (region: na, eu, ap, kr, br, latam, jp, cn; timespan: '30', 'all' ...)
export async function getVlrStats(region = "eu", timespan: string | number = 30): Promise<VlrPlayerStats[]> {
  const data = await http<{ data: { segments: VlrPlayerStats[] } }>(
    `${VLR_BASE}/stats?region=${encodeURIComponent(region)}&timespan=${encodeURIComponent(String(timespan))}`
  );
  return data.data.segments ?? [];
}

// Regional Rankings
export async function getVlrRankings(region = "eu"): Promise<VlrRanking[]> {
  const data = await http<{ status: number; data: VlrRanking[] }>(
    `${VLR_BASE}/rankings?region=${encodeURIComponent(region)}`
  );
  return data.data ?? [];
}

// Matches (q: 'upcoming' | 'live_score' | 'results')
export async function getVlrMatches(q: "upcoming" | "live_score" | "results" = "upcoming"): Promise<VlrMatch[]> {
  const data = await http<{ data: { segments: VlrMatch[] } }>(
    `${VLR_BASE}/match?q=${encodeURIComponent(q)}`
  );
  return data.data.segments ?? [];
}

// Events (q opsiyonel: 'upcoming' | 'completed'; completed pages support)
export async function getVlrEvents(params?: { q?: "upcoming" | "completed"; page?: number }): Promise<VlrEvent[]> {
  const qp = new URLSearchParams();
  if (params?.q) qp.set("q", params.q);
  if (params?.page) qp.set("page", String(params.page));
  const data = await http<{ data: { segments: VlrEvent[] } }>(
    `${VLR_BASE}/events${qp.toString() ? `?${qp.toString()}` : ""}`
  );
  return data.data.segments ?? [];
}

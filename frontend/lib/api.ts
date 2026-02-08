import type { Hotspot, UserProfile, CleanupEvent, TimelineEntry } from "./data"

const BASE_URL = "http://localhost:5292"

// ── Helpers ──────────────────────────────────────────────────────────────

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init)
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(body || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Hotspots ─────────────────────────────────────────────────────────────

export async function fetchHotspots(city?: string): Promise<Hotspot[]> {
  const query = city ? `?city=${encodeURIComponent(city)}` : ""
  return fetchJSON<Hotspot[]>(`/api/hotspots${query}`)
}

export async function fetchHotspot(id: number): Promise<Hotspot> {
  return fetchJSON<Hotspot>(`/api/hotspots/${id}`)
}

export async function createHotspot(data: FormData): Promise<Hotspot> {
  const res = await fetch(`${BASE_URL}/api/hotspots`, {
    method: "POST",
    body: data, // multipart/form-data — browser sets Content-Type + boundary
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(body || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function resolveHotspot(
  id: number,
  data: FormData
): Promise<{ message: string; ecoCredits: number }> {
  const res = await fetch(`${BASE_URL}/api/hotspots/resolve/${id}`, {
    method: "POST",
    body: data,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(body || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Leaderboard ──────────────────────────────────────────────────────────

export async function fetchLeaderboardUsers(
  timeFilter?: string
): Promise<UserProfile[]> {
  const query = timeFilter ? `?timeFilter=${timeFilter}` : ""
  return fetchJSON<UserProfile[]>(`/api/leaderboard/users${query}`)
}

export interface CityScore {
  city: string
  score: number
  trend: string
  totalSpots: number
  resolved: number
}

export async function fetchLeaderboardCities(): Promise<CityScore[]> {
  return fetchJSON<CityScore[]>("/api/leaderboard/cities")
}

export async function fetchLeaderboardNearby(
  lat: number,
  lng: number
): Promise<UserProfile[]> {
  return fetchJSON<UserProfile[]>(
    `/api/leaderboard/nearby?lat=${lat}&lng=${lng}`
  )
}

// ── Events ───────────────────────────────────────────────────────────────

export async function fetchEvents(): Promise<CleanupEvent[]> {
  return fetchJSON<CleanupEvent[]>("/api/events")
}

export async function fetchEvent(id: number): Promise<CleanupEvent> {
  return fetchJSON<CleanupEvent>(`/api/events/${id}`)
}

export async function joinEvent(
  eventId: number,
  userId: number
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/events/${eventId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(body || `HTTP ${res.status}`)
  }
}

// ── Profile ──────────────────────────────────────────────────────────────

export async function fetchProfile(userId: number): Promise<UserProfile> {
  return fetchJSON<UserProfile>(`/api/profile/${userId}`)
}

export async function fetchTimeline(userId: number): Promise<TimelineEntry[]> {
  return fetchJSON<TimelineEntry[]>(`/api/profile/${userId}/timeline`)
}

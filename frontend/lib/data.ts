export interface Hotspot {
  id: number
  lat: number
  lng: number
  severity: number // 0-100
  resolved: boolean
  reportedBy: string
  reportedAt: string
  description: string
  city: string
  ecoCredits: number
  claimedBy?: string
  imageBeforeUrl?: string | null
  imageAfterUrl?: string | null
}

export interface UserProfile {
  id: number
  name: string
  avatar: string
  ecoCredits: number
  wasteRemoved: number
  rank: number
  city: string
  joinedAt: string
}

export interface CleanupEvent {
  id: number
  title: string
  date: string
  time: string
  location: string
  city: string
  lat: number
  lng: number
  expectedImpact: string
  attendees: number
  maxAttendees: number
  description: string
}

export interface TimelineEntry {
  id: number
  type: 'report' | 'cleanup' | 'event' | 'badge'
  title: string
  description: string
  date: string
  ecoCredits: number
}

// Purity score utility (used by MapView)
export function calculatePurityScore(hotspots: Hotspot[]): number {
  if (hotspots.length === 0) return 100
  const resolved = hotspots.filter(h => h.resolved).length
  return Math.round((resolved / hotspots.length) * 100)
}

// Default user ID for the prototype (maps to seed-user "You" / id=1)
export const CURRENT_USER_ID = 1


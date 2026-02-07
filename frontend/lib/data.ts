export interface Hotspot {
  id: string
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
}

export interface UserProfile {
  id: string
  name: string
  avatar: string
  ecoCredits: number
  wasteRemoved: number
  rank: number
  city: string
  joinedAt: string
}

export interface CleanupEvent {
  id: string
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
  id: string
  type: 'report' | 'cleanup' | 'event' | 'badge'
  title: string
  description: string
  date: string
  ecoCredits: number
}

// Initial mock hotspots across South Africa
export const INITIAL_HOTSPOTS: Hotspot[] = [
  // Johannesburg area
  { id: 'h1', lat: -26.2041, lng: 28.0473, severity: 78, resolved: false, reportedBy: 'Thabo M.', reportedAt: '2026-01-28', description: 'Illegal dump site near Braamfontein', city: 'Johannesburg', ecoCredits: 45 },
  { id: 'h2', lat: -26.1929, lng: 28.0305, severity: 65, resolved: true, reportedBy: 'Naledi K.', reportedAt: '2026-01-15', description: 'Plastic waste along Jukskei River', city: 'Johannesburg', ecoCredits: 38 },
  { id: 'h3', lat: -26.2309, lng: 28.0583, severity: 89, resolved: false, reportedBy: 'Sipho N.', reportedAt: '2026-02-01', description: 'Construction debris on vacant lot', city: 'Johannesburg', ecoCredits: 52 },
  { id: 'h4', lat: -26.1496, lng: 28.0080, severity: 42, resolved: true, reportedBy: 'Zanele D.', reportedAt: '2026-01-20', description: 'Overflowing bins at Randburg market', city: 'Johannesburg', ecoCredits: 25 },
  { id: 'h5', lat: -26.2615, lng: 28.0195, severity: 71, resolved: false, reportedBy: 'Bongani S.', reportedAt: '2026-02-03', description: 'Tyre dumping near Soweto', city: 'Johannesburg', ecoCredits: 42 },
  { id: 'h6', lat: -26.1076, lng: 28.0567, severity: 55, resolved: true, reportedBy: 'Lerato P.', reportedAt: '2026-01-10', description: 'Littering along Sandton streets', city: 'Johannesburg', ecoCredits: 30 },
  { id: 'h7', lat: -26.1825, lng: 28.0127, severity: 83, resolved: false, reportedBy: 'Mandla Z.', reportedAt: '2026-02-04', description: 'Hazardous waste near Auckland Park', city: 'Johannesburg', ecoCredits: 50 },

  // Cape Town area
  { id: 'h8', lat: -33.9249, lng: 18.4241, severity: 35, resolved: true, reportedBy: 'Ayanda M.', reportedAt: '2026-01-25', description: 'Beach litter at Sea Point', city: 'Cape Town', ecoCredits: 20 },
  { id: 'h9', lat: -33.9608, lng: 18.4745, severity: 62, resolved: false, reportedBy: 'Pieter V.', reportedAt: '2026-01-30', description: 'Waste overflow near Woodstock', city: 'Cape Town', ecoCredits: 36 },
  { id: 'h10', lat: -33.8900, lng: 18.5108, severity: 48, resolved: true, reportedBy: 'Fatima A.', reportedAt: '2026-01-18', description: 'Dumping near Table Bay', city: 'Cape Town', ecoCredits: 28 },
  { id: 'h11', lat: -33.9400, lng: 18.3800, severity: 72, resolved: false, reportedBy: 'Johan B.', reportedAt: '2026-02-02', description: 'Plastic pollution at Camps Bay', city: 'Cape Town', ecoCredits: 43 },
  { id: 'h12', lat: -34.0000, lng: 18.4600, severity: 30, resolved: true, reportedBy: 'Nomsa T.', reportedAt: '2026-01-08', description: 'Street litter near Observatory', city: 'Cape Town', ecoCredits: 18 },
  { id: 'h13', lat: -33.9550, lng: 18.5300, severity: 57, resolved: true, reportedBy: 'David L.', reportedAt: '2026-01-22', description: 'Industrial waste near Salt River', city: 'Cape Town', ecoCredits: 33 },

  // Durban area
  { id: 'h14', lat: -29.8587, lng: 31.0218, severity: 91, resolved: false, reportedBy: 'Themba G.', reportedAt: '2026-02-01', description: 'Severe pollution at Umgeni River', city: 'Durban', ecoCredits: 55 },
  { id: 'h15', lat: -29.8833, lng: 31.0500, severity: 67, resolved: false, reportedBy: 'Priya N.', reportedAt: '2026-01-29', description: 'Beach waste at North Beach', city: 'Durban', ecoCredits: 39 },
  { id: 'h16', lat: -29.8200, lng: 31.0050, severity: 45, resolved: true, reportedBy: 'Siyanda W.', reportedAt: '2026-01-12', description: 'Littering near Umhlanga', city: 'Durban', ecoCredits: 26 },
  { id: 'h17', lat: -29.9000, lng: 30.9800, severity: 78, resolved: false, reportedBy: 'Ahmed R.', reportedAt: '2026-02-03', description: 'Toxic dump near Pinetown', city: 'Durban', ecoCredits: 47 },
  { id: 'h18', lat: -29.8700, lng: 31.0400, severity: 53, resolved: true, reportedBy: 'Grace M.', reportedAt: '2026-01-16', description: 'Harbour area waste accumulation', city: 'Durban', ecoCredits: 31 },

  // Pretoria area
  { id: 'h19', lat: -25.7479, lng: 28.2293, severity: 60, resolved: false, reportedBy: 'Kofi A.', reportedAt: '2026-01-31', description: 'Street waste in Hatfield', city: 'Pretoria', ecoCredits: 35 },
  { id: 'h20', lat: -25.7300, lng: 28.2100, severity: 40, resolved: true, reportedBy: 'Linda F.', reportedAt: '2026-01-14', description: 'Park littering at Pretoria Botanical Gardens', city: 'Pretoria', ecoCredits: 24 },
  { id: 'h21', lat: -25.7700, lng: 28.2500, severity: 74, resolved: false, reportedBy: 'Tshepo M.', reportedAt: '2026-02-02', description: 'Construction waste in Mamelodi', city: 'Pretoria', ecoCredits: 44 },

  // Port Elizabeth area
  { id: 'h22', lat: -33.9180, lng: 25.5701, severity: 56, resolved: false, reportedBy: 'Anele K.', reportedAt: '2026-01-27', description: 'Beach pollution near Summerstrand', city: 'Port Elizabeth', ecoCredits: 33 },
  { id: 'h23', lat: -33.9600, lng: 25.6000, severity: 38, resolved: true, reportedBy: 'Megan S.', reportedAt: '2026-01-11', description: 'Littering at Central area', city: 'Port Elizabeth', ecoCredits: 22 },

  // Bloemfontein
  { id: 'h24', lat: -29.0852, lng: 26.1596, severity: 49, resolved: false, reportedBy: 'Kagiso B.', reportedAt: '2026-01-26', description: 'Illegal dump off N1 highway', city: 'Bloemfontein', ecoCredits: 29 },
  { id: 'h25', lat: -29.1000, lng: 26.1800, severity: 33, resolved: true, reportedBy: 'Refilwe N.', reportedAt: '2026-01-09', description: 'Park waste in Naval Hill area', city: 'Bloemfontein', ecoCredits: 20 },

  // East London
  { id: 'h26', lat: -33.0153, lng: 27.9116, severity: 64, resolved: false, reportedBy: 'Vusi M.', reportedAt: '2026-02-01', description: 'River pollution near Buffalo River', city: 'East London', ecoCredits: 37 },

  // Polokwane
  { id: 'h27', lat: -23.9045, lng: 29.4689, severity: 51, resolved: false, reportedBy: 'Mpho L.', reportedAt: '2026-01-28', description: 'Market waste overflow', city: 'Polokwane', ecoCredits: 30 },

  // Nelspruit
  { id: 'h28', lat: -25.4753, lng: 30.9694, severity: 47, resolved: true, reportedBy: 'Thandeka S.', reportedAt: '2026-01-17', description: 'Riverside dumping near Crocodile River', city: 'Nelspruit', ecoCredits: 27 },
]

export const MOCK_USERS: UserProfile[] = [
  { id: 'u1', name: 'Thabo Molefe', avatar: 'TM', ecoCredits: 2450, wasteRemoved: 156, rank: 1, city: 'Johannesburg', joinedAt: '2025-06-15' },
  { id: 'u2', name: 'Ayanda Mthembu', avatar: 'AM', ecoCredits: 2180, wasteRemoved: 134, rank: 2, city: 'Cape Town', joinedAt: '2025-07-22' },
  { id: 'u3', name: 'Sipho Nkosi', avatar: 'SN', ecoCredits: 1920, wasteRemoved: 118, rank: 3, city: 'Durban', joinedAt: '2025-08-10' },
  { id: 'u4', name: 'Naledi Khumalo', avatar: 'NK', ecoCredits: 1750, wasteRemoved: 105, rank: 4, city: 'Johannesburg', joinedAt: '2025-09-01' },
  { id: 'u5', name: 'Pieter van Wyk', avatar: 'PV', ecoCredits: 1680, wasteRemoved: 98, rank: 5, city: 'Cape Town', joinedAt: '2025-07-30' },
  { id: 'u6', name: 'Fatima Adams', avatar: 'FA', ecoCredits: 1520, wasteRemoved: 89, rank: 6, city: 'Cape Town', joinedAt: '2025-08-15' },
  { id: 'u7', name: 'Bongani Sithole', avatar: 'BS', ecoCredits: 1410, wasteRemoved: 82, rank: 7, city: 'Johannesburg', joinedAt: '2025-10-05' },
  { id: 'u8', name: 'Priya Naidoo', avatar: 'PN', ecoCredits: 1350, wasteRemoved: 76, rank: 8, city: 'Durban', joinedAt: '2025-09-20' },
  { id: 'u9', name: 'Themba Gumede', avatar: 'TG', ecoCredits: 1280, wasteRemoved: 71, rank: 9, city: 'Durban', joinedAt: '2025-11-01' },
  { id: 'u10', name: 'Zanele Dlamini', avatar: 'ZD', ecoCredits: 1200, wasteRemoved: 65, rank: 10, city: 'Pretoria', joinedAt: '2025-08-25' },
  { id: 'u11', name: 'Johan Botha', avatar: 'JB', ecoCredits: 1150, wasteRemoved: 60, rank: 11, city: 'Cape Town', joinedAt: '2025-10-15' },
  { id: 'u12', name: 'Lerato Phiri', avatar: 'LP', ecoCredits: 1080, wasteRemoved: 55, rank: 12, city: 'Johannesburg', joinedAt: '2025-11-20' },
  { id: 'u13', name: 'Ahmed Rashid', avatar: 'AR', ecoCredits: 1020, wasteRemoved: 50, rank: 13, city: 'Durban', joinedAt: '2025-12-01' },
  { id: 'u14', name: 'Nomsa Tshabalala', avatar: 'NT', ecoCredits: 960, wasteRemoved: 46, rank: 14, city: 'Cape Town', joinedAt: '2025-09-10' },
  { id: 'u15', name: 'Kofi Asante', avatar: 'KA', ecoCredits: 890, wasteRemoved: 41, rank: 15, city: 'Pretoria', joinedAt: '2025-12-15' },
]

export const CLEANUP_EVENTS: CleanupEvent[] = [
  {
    id: 'e1', title: 'Jukskei River Cleanup', date: '2026-02-15', time: '08:00',
    location: 'Jukskei River Bridge, Braamfontein', city: 'Johannesburg',
    lat: -26.1929, lng: 28.0305, expectedImpact: '~200kg waste removal',
    attendees: 34, maxAttendees: 50, description: 'Join us for a major river cleanup along the Jukskei. Gloves and bags provided.'
  },
  {
    id: 'e2', title: 'Sea Point Beach Day', date: '2026-02-22', time: '07:00',
    location: 'Sea Point Promenade', city: 'Cape Town',
    lat: -33.9249, lng: 18.4241, expectedImpact: '~150kg plastic removed',
    attendees: 48, maxAttendees: 60, description: 'Morning beach cleanup followed by a community breakfast. All ages welcome!'
  },
  {
    id: 'e3', title: 'Umgeni River Rescue', date: '2026-03-01', time: '09:00',
    location: 'Umgeni River Mouth, Durban North', city: 'Durban',
    lat: -29.8087, lng: 31.0418, expectedImpact: '~350kg waste removal',
    attendees: 22, maxAttendees: 40, description: 'Critical cleanup of one of Durban\'s most polluted waterways. Safety gear provided.'
  },
  {
    id: 'e4', title: 'Soweto Green Initiative', date: '2026-03-08', time: '08:30',
    location: 'Walter Sisulu Square, Kliptown', city: 'Johannesburg',
    lat: -26.2715, lng: 27.9995, expectedImpact: '~180kg waste + 50 trees planted',
    attendees: 56, maxAttendees: 80, description: 'Combined cleanup and tree planting event. Refreshments and eco-credits for all participants.'
  },
  {
    id: 'e5', title: 'Table Mountain Trail Clean', date: '2026-03-15', time: '06:30',
    location: 'Kirstenbosch Entrance', city: 'Cape Town',
    lat: -33.9875, lng: 18.4325, expectedImpact: '~100kg trail waste removed',
    attendees: 18, maxAttendees: 30, description: 'Hike and clean! We\'ll tackle litter along popular hiking trails. Bring sturdy shoes.'
  },
  {
    id: 'e6', title: 'Mamelodi Community Clean', date: '2026-03-22', time: '09:00',
    location: 'Mamelodi Community Centre', city: 'Pretoria',
    lat: -25.7200, lng: 28.3600, expectedImpact: '~250kg waste removal',
    attendees: 41, maxAttendees: 60, description: 'Neighborhood cleanup with music, food stalls, and prizes for top collectors.'
  },
]

export const USER_TIMELINE: TimelineEntry[] = [
  { id: 't1', type: 'report', title: 'Reported Hotspot', description: 'Illegal dump near Braamfontein identified', date: '2026-02-04', ecoCredits: 45 },
  { id: 't2', type: 'cleanup', title: 'Cleanup Completed', description: 'Cleared plastic waste at Sandton park', date: '2026-02-02', ecoCredits: 120 },
  { id: 't3', type: 'event', title: 'Joined Cleanup Event', description: 'Participated in Jukskei River cleanup', date: '2026-01-28', ecoCredits: 85 },
  { id: 't4', type: 'badge', title: 'Badge Earned: First Reporter', description: 'Submitted your first pollution report', date: '2026-01-25', ecoCredits: 50 },
  { id: 't5', type: 'cleanup', title: 'Cleanup Completed', description: 'Removed tyre dump near Soweto', date: '2026-01-20', ecoCredits: 95 },
  { id: 't6', type: 'report', title: 'Reported Hotspot', description: 'Construction debris on vacant lot flagged', date: '2026-01-18', ecoCredits: 52 },
  { id: 't7', type: 'event', title: 'Joined Cleanup Event', description: 'Sea Point Beach community event', date: '2026-01-15', ecoCredits: 70 },
  { id: 't8', type: 'badge', title: 'Badge Earned: Eco Warrior', description: 'Reached 500 eco-credits milestone', date: '2026-01-10', ecoCredits: 100 },
]

// City purity scores (pre-computed for leaderboard)
export const CITY_SCORES = [
  { city: 'Cape Town', score: 82, trend: '+2.4%', totalSpots: 6, resolved: 4 },
  { city: 'Pretoria', score: 67, trend: '+1.8%', totalSpots: 3, resolved: 1 },
  { city: 'Port Elizabeth', score: 62, trend: '+0.5%', totalSpots: 2, resolved: 1 },
  { city: 'Bloemfontein', score: 58, trend: '-0.3%', totalSpots: 2, resolved: 1 },
  { city: 'Johannesburg', score: 43, trend: '+3.1%', totalSpots: 7, resolved: 3 },
  { city: 'Durban', score: 40, trend: '-1.2%', totalSpots: 5, resolved: 2 },
  { city: 'East London', score: 35, trend: '+0.8%', totalSpots: 1, resolved: 0 },
  { city: 'Polokwane', score: 30, trend: '-0.5%', totalSpots: 1, resolved: 0 },
  { city: 'Nelspruit', score: 100, trend: '+5.0%', totalSpots: 1, resolved: 1 },
]

// Storage helper functions
const HOTSPOTS_KEY = 'vukamap_hotspots'
const JOINED_EVENTS_KEY = 'vukamap_joined_events'
const USER_CREDITS_KEY = 'vukamap_user_credits'

export function getHotspots(): Hotspot[] {
  if (typeof window === 'undefined') return INITIAL_HOTSPOTS
  const stored = localStorage.getItem(HOTSPOTS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return INITIAL_HOTSPOTS
    }
  }
  localStorage.setItem(HOTSPOTS_KEY, JSON.stringify(INITIAL_HOTSPOTS))
  return INITIAL_HOTSPOTS
}

export function saveHotspots(hotspots: Hotspot[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(HOTSPOTS_KEY, JSON.stringify(hotspots))
}

export function addHotspot(hotspot: Hotspot) {
  const hotspots = getHotspots()
  hotspots.push(hotspot)
  saveHotspots(hotspots)
  return hotspots
}

export function getJoinedEvents(): string[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(JOINED_EVENTS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

export function joinEvent(eventId: string) {
  const joined = getJoinedEvents()
  if (!joined.includes(eventId)) {
    joined.push(eventId)
    if (typeof window !== 'undefined') {
      localStorage.setItem(JOINED_EVENTS_KEY, JSON.stringify(joined))
    }
  }
  return joined
}

export function getUserCredits(): number {
  if (typeof window === 'undefined') return 847
  const stored = localStorage.getItem(USER_CREDITS_KEY)
  if (stored) return parseInt(stored, 10)
  return 847
}

export function addUserCredits(amount: number) {
  const current = getUserCredits()
  const newTotal = current + amount
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_CREDITS_KEY, newTotal.toString())
  }
  return newTotal
}

export function calculatePurityScore(hotspots: Hotspot[]): number {
  if (hotspots.length === 0) return 100
  const resolved = hotspots.filter(h => h.resolved).length
  return Math.round((resolved / hotspots.length) * 100)
}

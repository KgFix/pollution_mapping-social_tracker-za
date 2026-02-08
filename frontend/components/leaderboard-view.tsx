"use client"

import { useState, useEffect } from "react"
import { Trophy, MapPin, Users, Navigation, Loader2 } from "lucide-react"
import { type UserProfile } from "@/lib/data"
import {
  fetchLeaderboardUsers,
  fetchLeaderboardCities,
  fetchLeaderboardNearby,
  type CityScore,
} from "@/lib/api"

type Tab = "cities" | "members" | "near"
type TimeFilter = "24h" | "weekly" | "all"

export function LeaderboardView() {
  const [activeTab, setActiveTab] = useState<Tab>("cities")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")

  const [users, setUsers] = useState<UserProfile[]>([])
  const [cities, setCities] = useState<CityScore[]>([])
  const [nearbyUsers, setNearbyUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch cities on mount
  useEffect(() => {
    setLoading(true)
    fetchLeaderboardCities()
      .then((data) => {
        setCities(data.sort((a, b) => b.score - a.score))
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Fetch users when time filter changes
  useEffect(() => {
    fetchLeaderboardUsers(timeFilter)
      .then(setUsers)
      .catch((err) => setError(err.message))
  }, [timeFilter])

  // Fetch nearby users (use geolocation with JHB fallback)
  useEffect(() => {
    if (activeTab !== "near") return
    const load = (lat: number, lng: number) => {
      fetchLeaderboardNearby(lat, lng)
        .then(setNearbyUsers)
        .catch((err) => setError(err.message))
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude),
        () => load(-26.2041, 28.0473),
        { timeout: 5000 }
      )
    } else {
      load(-26.2041, 28.0473)
    }
  }, [activeTab])

  const tabs: { id: Tab; label: string; icon: typeof Trophy }[] = [
    { id: "cities", label: "Cities", icon: MapPin },
    { id: "members", label: "Members", icon: Users },
    { id: "near", label: "Near Me", icon: Navigation },
  ]

  const timeFilters: { id: TimeFilter; label: string }[] = [
    { id: "24h", label: "Last 24h" },
    { id: "weekly", label: "Weekly" },
    { id: "all", label: "All Time" },
  ]

  return (
    <div className="flex h-full flex-col bg-background animate-fade-in">
      {/* Header */}
      <div className="px-5 pb-3 pt-[env(safe-area-inset-top)]">
        <div className="pt-4">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Leaderboard
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            See who is making the biggest impact
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Time Filters */}
      <div className="flex gap-2 px-5 py-3">
        {timeFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setTimeFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
              timeFilter === f.id
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-center text-xs font-medium text-destructive">
            {error}
          </div>
        ) : (
          <>
        {activeTab === "cities" && (
          <div className="flex flex-col gap-2">
            {cities.map((city, index) => (
              <div
                key={city.city}
                className="flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-sm transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${
                    index === 0
                      ? "bg-[#FFD700]/10 text-[#B8860B]"
                      : index === 1
                        ? "bg-secondary text-muted-foreground"
                        : index === 2
                          ? "bg-[#CD7F32]/10 text-[#CD7F32]"
                          : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-card-foreground">
                      {city.city}
                    </span>
                    <span
                      className={`text-lg font-black ${
                        city.score >= 70
                          ? "text-primary"
                          : city.score >= 40
                            ? "text-warning"
                            : "text-destructive"
                      }`}
                    >
                      {city.score}%
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          city.score >= 70
                            ? "bg-primary"
                            : city.score >= 40
                              ? "bg-warning"
                              : "bg-destructive"
                        }`}
                        style={{ width: `${city.score}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        city.trend.startsWith("+")
                          ? "text-primary"
                          : "text-destructive"
                      }`}
                    >
                      {city.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "members" && (
          <div className="flex flex-col gap-2">
            {users.map((user, index) => (
              <UserRow
                key={user.id}
                user={user}
                rank={user.rank || index + 1}
                credits={user.ecoCredits}
              />
            ))}
          </div>
        )}

        {activeTab === "near" && (
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2">
              <Navigation className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-medium text-accent-foreground">
                Showing users within 10km of your location
              </span>
            </div>
            {nearbyUsers.map((user, index) => (
              <UserRow
                key={user.id}
                user={user}
                rank={user.rank || index + 1}
                credits={user.ecoCredits}
                showDistance
              />
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}

function UserRow({
  user,
  rank,
  credits,
  showDistance,
}: {
  user: UserProfile
  rank: number
  credits: number
  showDistance?: boolean
}) {
  // Simulate random distance for nearby
  const distance = showDistance
    ? `${(Math.random() * 9 + 0.5).toFixed(1)}km`
    : undefined

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${
          rank === 1
            ? "bg-[#FFD700]/10 text-[#B8860B]"
            : rank === 2
              ? "bg-secondary text-muted-foreground"
              : rank === 3
                ? "bg-[#CD7F32]/10 text-[#CD7F32]"
                : "bg-secondary text-muted-foreground"
        }`}
      >
        {rank}
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {user.avatar}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-card-foreground">{user.name}</div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{user.city}</span>
          {distance && (
            <>
              <span>-</span>
              <span>{distance} away</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-black text-primary">{credits.toLocaleString()}</div>
        <div className="text-[9px] font-medium text-muted-foreground">ECO-CREDITS</div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import {
  Leaf,
  Weight,
  Award,
  Hash,
  MapPin,
  CheckCircle,
  CalendarDays,
  Star,
  Flag,
  Loader2,
} from "lucide-react"
import { CURRENT_USER_ID, type TimelineEntry } from "@/lib/data"
import { fetchProfile, fetchTimeline } from "@/lib/api"
import type { UserProfile } from "@/lib/data"

export function ProfileView() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchProfile(CURRENT_USER_ID),
      fetchTimeline(CURRENT_USER_ID),
    ])
      .then(([prof, tl]) => {
        setProfile(prof)
        setTimeline(tl)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex h-full items-center justify-center bg-background px-5">
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-center text-xs font-medium text-destructive">
          {error || "Profile not found"}
        </div>
      </div>
    )
  }

  const credits = profile.ecoCredits
  const wasteRemoved = profile.wasteRemoved
  const nationalRank = profile.rank

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-primary px-5 pb-8 pt-[env(safe-area-inset-top)]">
        <div className="pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20 text-lg font-black text-primary-foreground">
              YO
            </div>
            <div>
              <h1 className="text-xl font-black text-primary-foreground">
                Your Profile
              </h1>
              <p className="text-sm text-primary-foreground/70">
                Eco Warrior since Jan 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="-mt-4 grid grid-cols-3 gap-2 px-5">
        <StatCard
          icon={Weight}
          label="Waste Removed"
          value={`${wasteRemoved}kg`}
        />
        <StatCard
          icon={Leaf}
          label="Credits Earned"
          value={credits.toLocaleString()}
          highlight
        />
        <StatCard
          icon={Hash}
          label="National Rank"
          value={`#${nationalRank}`}
        />
      </div>

      {/* Badges section */}
      <div className="mt-5 px-5">
        <h2 className="text-sm font-bold text-foreground">Badges</h2>
        <div className="mt-2 flex gap-2 overflow-x-auto hide-scrollbar">
          {[
            { name: "First Reporter", icon: Flag, color: "bg-primary/10 text-primary" },
            { name: "Eco Warrior", icon: Star, color: "bg-warning/10 text-warning" },
            { name: "Team Player", icon: Award, color: "bg-[#3B82F6]/10 text-[#3B82F6]" },
          ].map((badge) => (
            <div
              key={badge.name}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 ${badge.color}`}
            >
              <badge.icon className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-5 flex-1 px-5 pb-4">
        <h2 className="text-sm font-bold text-foreground">Activity Timeline</h2>
        <div className="relative mt-3">
          {/* Timeline line */}
          <div className="absolute bottom-0 left-4 top-0 w-px bg-border" />

          {timeline.map((entry, index) => (
            <TimelineItem key={entry.id} entry={entry} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Leaf
  label: string
  value: string
  highlight?: boolean
}) {
  const [animatedValue, setAnimatedValue] = useState("0")
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    // Parse numeric portion for animation
    const numericStr = value.replace(/[^0-9.]/g, "")
    const numericVal = parseFloat(numericStr)
    const prefix = value.match(/^[^0-9]*/)?.[0] || ""
    const suffix = value.replace(/.*?(\d[\d,.]*\d|\d)/, "").replace(numericStr, "")

    if (Number.isNaN(numericVal)) {
      setAnimatedValue(value)
      return
    }

    const duration = 800
    const start = performance.now()

    const animate = (time: number) => {
      const elapsed = time - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(numericVal * eased)

      if (numericVal >= 100) {
        setAnimatedValue(`${prefix}${current.toLocaleString()}${suffix}`)
      } else {
        setAnimatedValue(`${prefix}${current}${suffix}`)
      }

      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])

  return (
    <div
      className={`rounded-2xl p-3 shadow-sm ${
        highlight ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
      }`}
    >
      <Icon className={`h-4 w-4 ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`} />
      <div className="mt-2 text-lg font-black leading-tight">{animatedValue}</div>
      <div className={`mt-0.5 text-[9px] font-medium uppercase tracking-wider ${highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
        {label}
      </div>
    </div>
  )
}

function TimelineItem({
  entry,
  index,
}: {
  entry: TimelineEntry
  index: number
}) {
  const iconMap = {
    report: MapPin,
    cleanup: CheckCircle,
    event: CalendarDays,
    badge: Star,
  }
  const colorMap = {
    report: "bg-destructive/10 text-destructive",
    cleanup: "bg-primary/10 text-primary",
    event: "bg-[#3B82F6]/10 text-[#3B82F6]",
    badge: "bg-warning/10 text-warning",
  }

  const Icon = iconMap[entry.type]
  const color = colorMap[entry.type]

  return (
    <div
      className="relative flex gap-3 pb-4 pl-0"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Dot */}
      <div className={`z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 rounded-xl bg-card p-3 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold text-card-foreground">{entry.title}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {entry.description}
            </div>
          </div>
          <span className="flex-shrink-0 rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            +{entry.ecoCredits}
          </span>
        </div>
        <div className="mt-1.5 text-[10px] text-muted-foreground">{entry.date}</div>
      </div>
    </div>
  )
}

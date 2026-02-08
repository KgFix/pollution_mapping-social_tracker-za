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
  LogIn,
  LogOut,
  Pencil,
  X,
  Check,
} from "lucide-react"
import { CURRENT_USER_ID, type TimelineEntry } from "@/lib/data"
import { fetchProfile, fetchTimeline } from "@/lib/api"
import type { UserProfile } from "@/lib/data"

// ── localStorage helpers for simulated auth ──
function getStoredName(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("vukamap_user_name")
}
function setStoredName(name: string) {
  localStorage.setItem("vukamap_user_name", name)
}
function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("vukamap_logged_in") === "true"
}
function setLoggedIn(v: boolean) {
  localStorage.setItem("vukamap_logged_in", v ? "true" : "false")
}

export function ProfileView() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Simulated auth state
  const [loggedIn, setLoggedInState] = useState(false)
  const [displayName, setDisplayName] = useState("You")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState("")

  // Load auth state from localStorage
  useEffect(() => {
    setLoggedInState(isLoggedIn())
    const stored = getStoredName()
    if (stored) setDisplayName(stored)
  }, [])

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

  const handleLogin = (name: string) => {
    const trimmed = name.trim() || "You"
    setDisplayName(trimmed)
    setStoredName(trimmed)
    setLoggedIn(true)
    setLoggedInState(true)
    setShowLoginModal(false)
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setLoggedInState(false)
    setDisplayName("You")
    setStoredName("You")
  }

  const handleSaveName = () => {
    const trimmed = nameInput.trim() || displayName
    setDisplayName(trimmed)
    setStoredName(trimmed)
    setEditingName(false)
  }

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

  const credits = loggedIn ? profile.ecoCredits : 0
  const wasteRemoved = loggedIn ? profile.wasteRemoved : 0
  const nationalRank = loggedIn ? profile.rank : 0
  const initials = loggedIn ? displayName.slice(0, 2).toUpperCase() : "?"

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background animate-fade-in">
      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Header */}
      <div className="bg-primary px-5 pb-8 pt-[env(safe-area-inset-top)]">
        <div className="pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20 text-lg font-black text-primary-foreground">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {editingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      className="w-32 rounded-lg bg-primary-foreground/20 px-2 py-1 text-sm font-bold text-primary-foreground placeholder:text-primary-foreground/50 outline-none"
                      placeholder="Your name"
                      autoFocus
                    />
                    <button type="button" onClick={handleSaveName} className="rounded-full p-1 hover:bg-primary-foreground/10" aria-label="Save">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </button>
                    <button type="button" onClick={() => setEditingName(false)} className="rounded-full p-1 hover:bg-primary-foreground/10" aria-label="Cancel">
                      <X className="h-4 w-4 text-primary-foreground" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-black text-primary-foreground">
                      {loggedIn ? displayName : "Not Logged In"}
                    </h1>
                    {loggedIn && (
                      <button
                        type="button"
                        onClick={() => { setNameInput(displayName); setEditingName(true) }}
                        className="rounded-full p-1 hover:bg-primary-foreground/10"
                        aria-label="Edit name"
                      >
                        <Pencil className="h-3.5 w-3.5 text-primary-foreground/70" />
                      </button>
                    )}
                  </>
                )}
              </div>
              <p className="text-sm text-primary-foreground/70">
                {loggedIn ? "Eco Warrior since Jan 2026" : "Log in to track your impact"}
              </p>
            </div>
            {/* Login / Logout button */}
            <button
              type="button"
              onClick={loggedIn ? handleLogout : () => setShowLoginModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary-foreground/20 px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/30"
            >
              {loggedIn ? (
                <>
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5" />
                  Login
                </>
              )}
            </button>
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
          value={loggedIn ? `#${nationalRank}` : "-"}
        />
      </div>

      {/* Badges section */}
      {loggedIn && (
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
      )}

      {/* Timeline */}
      {loggedIn ? (
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
      ) : (
      <div className="mt-8 flex flex-1 flex-col items-center justify-center px-5 pb-4 text-center">
        <LogIn className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-semibold text-muted-foreground">Log in to see your activity</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Your reports, cleanups and badges will appear here</p>
      </div>
      )}
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
  const prevValueRef = useRef(value)

  useEffect(() => {
    prevValueRef.current = value

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

function LoginModal({
  onLogin,
  onClose,
}: {
  onLogin: (name: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState("")

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/40 animate-fade-in">
      <div className="mx-5 w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-card-foreground">Welcome to VukaMap</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-secondary" aria-label="Close">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Enter your name to get started</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin(name)}
          placeholder="Your display name"
          className="mt-4 w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
        <button
          type="button"
          onClick={() => onLogin(name)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </button>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import {
  CalendarDays,
  MapPin,
  Users,
  Zap,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { type CleanupEvent } from "@/lib/data"
import { CURRENT_USER_ID } from "@/lib/data"
import { fetchEvents, joinEvent } from "@/lib/api"

export function EventsView() {
  const [events, setEvents] = useState<CleanupEvent[]>([])
  const [joinedEvents, setJoinedEvents] = useState<Set<number>>(new Set())
  const [celebratingId, setCelebratingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleJoin = useCallback(
    async (eventId: number) => {
      if (joinedEvents.has(eventId)) return

      try {
        await joinEvent(eventId, CURRENT_USER_ID)

        setJoinedEvents((prev) => new Set(prev).add(eventId))
        // Update local attendees count
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e
          )
        )
        setCelebratingId(eventId)

        // Launch confetti
        try {
          const confetti = (await import("canvas-confetti")).default
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: ["#22C55E", "#10B981", "#059669", "#34D399"],
          })
        } catch {
          // Confetti optional
        }

        setTimeout(() => setCelebratingId(null), 2000)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to join"
        // If already registered, just mark it locally
        if (msg.includes("already registered")) {
          setJoinedEvents((prev) => new Set(prev).add(eventId))
        } else {
          setError(msg)
        }
      }
    },
    [joinedEvents]
  )

  return (
    <div className="flex h-full flex-col bg-background animate-fade-in">
      {/* Header */}
      <div className="px-5 pb-3 pt-[env(safe-area-inset-top)]">
        <div className="pt-4">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Events
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Join community cleanups near you
          </p>
        </div>
      </div>

      {/* Events List */}
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
        <div className="flex flex-col gap-3">
          {events.map((event, index) => {
            const isJoined = joinedEvents.has(event.id)
            const isCelebrating = celebratingId === event.id
            const eventDate = new Date(event.date)
            const day = eventDate.getDate()
            const month = eventDate.toLocaleString("en-ZA", { month: "short" })

            return (
              <div
                key={event.id}
                className="overflow-hidden rounded-2xl bg-card shadow-sm transition-all"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex gap-3 p-4">
                  {/* Date badge */}
                  <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10">
                    <span className="text-lg font-black text-primary leading-none">
                      {day}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-primary/70">
                      {month}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-card-foreground">
                      {event.title}
                    </h3>
                    <div className="mt-1 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {event.location}, {event.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>
                            {event.attendees}/{event.maxAttendees}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details & Action */}
                <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-warning" />
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {event.expectedImpact}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJoin(event.id)}
                    disabled={isJoined}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      isJoined
                        ? "bg-primary/10 text-primary"
                        : "bg-primary text-primary-foreground shadow-md active:scale-[0.97]"
                    } ${isCelebrating ? "scale-105" : ""}`}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        Signed Up!
                      </>
                    ) : (
                      <>
                        <CalendarDays className="h-3.5 w-3.5" />
                        Join Squad
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        )}
      </div>
    </div>
  )
}

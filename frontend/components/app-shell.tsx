"use client"

import { useState, useCallback } from "react"
import { Map, Trophy, Camera, User, CalendarDays } from "lucide-react"
import { MapView } from "./map-view"
import { LeaderboardView } from "./leaderboard-view"
import { ReportView } from "./report-view"
import { ProfileView } from "./profile-view"
import { EventsView } from "./events-view"
import { CleanupVerifyView } from "./cleanup-verify-view"
import type { Hotspot } from "@/lib/data"

type ViewId = "map" | "leaderboard" | "report" | "profile" | "events"

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof Map }[] = [
  { id: "map", label: "Map", icon: Map },
  { id: "leaderboard", label: "Board", icon: Trophy },
  { id: "report", label: "Report", icon: Camera },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "profile", label: "Me", icon: User },
]

export function AppShell() {
  const [activeView, setActiveView] = useState<ViewId>("map")
  const [refreshKey, setRefreshKey] = useState(0)
  // Cleanup verify overlay state — triggered from map "Claim" or report "Upload cleaned version"
  const [cleanupHotspot, setCleanupHotspot] = useState<Hotspot | null>(null)

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const openCleanupFlow = useCallback((hotspot: Hotspot) => {
    setCleanupHotspot(hotspot)
  }, [])

  const closeCleanupFlow = useCallback(() => {
    setCleanupHotspot(null)
    triggerRefresh()
  }, [triggerRefresh])

  // If cleanup verify flow is active, show it as a full-screen overlay
  if (cleanupHotspot) {
    return (
      <div className="relative mx-auto flex h-[100dvh] max-w-[450px] flex-col overflow-hidden bg-background">
        <CleanupVerifyView
          hotspot={cleanupHotspot}
          onComplete={triggerRefresh}
          onBack={closeCleanupFlow}
        />
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-[450px] flex-col overflow-hidden bg-background">
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {activeView === "map" && <MapView key={`map-${refreshKey}`} onClaimHotspot={openCleanupFlow} />}
        {activeView === "leaderboard" && <LeaderboardView />}
        {activeView === "report" && (
          <ReportView
            onReported={() => {
              triggerRefresh()
            }}
            onCleanupUpload={openCleanupFlow}
          />
        )}
        {activeView === "events" && <EventsView />}
        {activeView === "profile" && <ProfileView />}
      </div>

      {/* Bottom Navigation */}
      <nav className="glass relative z-[2000] flex items-center justify-around border-t border-border/50 pb-[env(safe-area-inset-bottom)] pt-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id
          const isReport = item.id === "report"
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 transition-all ${
                isReport
                  ? "relative -mt-5"
                  : ""
              } ${
                isActive && !isReport
                  ? "text-primary"
                  : !isReport
                    ? "text-muted-foreground"
                    : ""
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isReport ? (
                <span className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform ${isActive ? "scale-110 bg-primary" : "bg-primary"}`}>
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </span>
              ) : (
                <item.icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              )}
              <span className={`text-[10px] font-medium ${isReport ? "mt-0.5" : ""}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

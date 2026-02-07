"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Shield, TrendingUp, X, CheckCircle2, MapPin, AlertTriangle } from "lucide-react"
import { getHotspots, calculatePurityScore, type Hotspot } from "@/lib/data"

// South Africa bounds
const SA_CENTER: [number, number] = [-29.0, 25.0]
const SA_BOUNDS: [[number, number], [number, number]] = [
  [-35.0, 16.0],
  [-22.0, 33.0],
]

// Dynamic import for Leaflet (SSR-safe)
let L: typeof import("leaflet") | null = null

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null)
  const markersLayerRef = useRef<import("leaflet").LayerGroup | null>(null)
  const heatLayerRef = useRef<import("leaflet").Layer | null>(null)

  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [purityScore, setPurityScore] = useState(0)
  const [visibleHotspots, setVisibleHotspots] = useState<Hotspot[]>([])
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [sheetClosing, setSheetClosing] = useState(false)
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [isHighZoom, setIsHighZoom] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  // Load hotspots
  useEffect(() => {
    const spots = getHotspots()
    setHotspots(spots)
  }, [])

  // Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude])
        },
        () => {
          // Default to Johannesburg if denied
          setUserPosition([-26.2041, 28.0473])
        },
        { enableHighAccuracy: false, timeout: 5000 }
      )
    }
  }, [])

  // Calculate purity score from visible hotspots
  const updatePurityScore = useCallback(() => {
    if (!mapInstanceRef.current) return
    const bounds = mapInstanceRef.current.getBounds()
    const visible = hotspots.filter((h) =>
      bounds.contains([h.lat, h.lng])
    )
    setVisibleHotspots(visible)
    setPurityScore(calculatePurityScore(visible))
  }, [hotspots])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || hotspots.length === 0 || mapReady) return

    const initMap = async () => {
      L = await import("leaflet")
      await import("leaflet/dist/leaflet.css")

      // Avoid double init
      if (mapInstanceRef.current) return

      const map = L.map(mapRef.current!, {
        center: SA_CENTER,
        zoom: 6,
        minZoom: 5,
        maxZoom: 18,
        maxBounds: SA_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: false,
        attributionControl: false,
      })

      // CartoDB Positron tiles (clean light style)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 19 }
      ).addTo(map)

      // Zoom control bottom-left
      L.control.zoom({ position: "bottomleft" }).addTo(map)

      mapInstanceRef.current = map
      markersLayerRef.current = L.layerGroup().addTo(map)

      // Listen for zoom/move
      map.on("zoomend moveend", () => {
        const zoom = map.getZoom()
        setIsHighZoom(zoom >= 10)
        updatePurityScore()
      })

      // Initialize layers
      updateMapLayers(map, hotspots, false)
      updatePurityScore()
      setMapReady(true)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersLayerRef.current = null
        heatLayerRef.current = null
        setMapReady(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspots])

  // Update layers when zoom changes
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return
    updateMapLayers(mapInstanceRef.current, hotspots, isHighZoom)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHighZoom, hotspots])

  // Update user position marker
  useEffect(() => {
    if (!mapInstanceRef.current || !L || !userPosition) return
    const userIcon = L.divIcon({
      className: "",
      html: `<div style="width:16px;height:16px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.5);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })
    L.marker(userPosition, { icon: userIcon, zIndexOffset: 1000 }).addTo(
      mapInstanceRef.current
    )
  }, [userPosition, mapReady])

  function updateMapLayers(
    map: import("leaflet").Map,
    spots: Hotspot[],
    highZoom: boolean
  ) {
    if (!L || !markersLayerRef.current) return

    // Clear existing markers
    markersLayerRef.current.clearLayers()

    // Remove heatmap layer if it exists
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current)
      heatLayerRef.current = null
    }

    if (highZoom) {
      // Individual markers at high zoom
      spots.forEach((spot) => {
        const color = spot.resolved ? "#22C55E" : "#EF4444"
        const pulseClass = spot.resolved ? "" : "pulse-marker"
        const size = spot.resolved ? 12 : Math.max(12, spot.severity / 5)

        const icon = L!.divIcon({
          className: "",
          html: `<div class="${pulseClass}" style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 0 6px ${color}40;cursor:pointer;"></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

        const marker = L!.marker([spot.lat, spot.lng], { icon })
        marker.on("click", () => {
          setSelectedHotspot(spot)
          setSheetClosing(false)
        })
        markersLayerRef.current!.addLayer(marker)
      })
    } else {
      // Heatmap-like circles at low zoom
      const unresolvedSpots = spots.filter((s) => !s.resolved)
      unresolvedSpots.forEach((spot) => {
        const radius = Math.max(20000, spot.severity * 500)
        const circle = L!.circle([spot.lat, spot.lng], {
          radius,
          color: "transparent",
          fillColor: "#EF4444",
          fillOpacity: 0.15 + (spot.severity / 100) * 0.25,
          interactive: false,
        })
        markersLayerRef.current!.addLayer(circle)
      })

      // Add green circles for resolved spots
      const resolvedSpots = spots.filter((s) => s.resolved)
      resolvedSpots.forEach((spot) => {
        const radius = Math.max(15000, spot.severity * 300)
        const circle = L!.circle([spot.lat, spot.lng], {
          radius,
          color: "transparent",
          fillColor: "#22C55E",
          fillOpacity: 0.1 + (spot.severity / 100) * 0.15,
          interactive: false,
        })
        markersLayerRef.current!.addLayer(circle)
      })
    }
  }

  const closeSheet = () => {
    setSheetClosing(true)
    setTimeout(() => {
      setSelectedHotspot(null)
      setSheetClosing(false)
    }, 300)
  }

  const trendPositive = true
  const trendValue = "+2.4%"

  return (
    <div className="relative h-full w-full">
      {/* Map container */}
      <div ref={mapRef} className="h-full w-full" />

      {/* Zone Health Overlay */}
      <div className="absolute right-3 top-3 z-[1000]">
        <div className="glass rounded-2xl p-3 shadow-lg" style={{ minWidth: 140 }}>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Shield className="h-3 w-3" />
            Zone Health
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <AnimatedScore value={purityScore} />
            <span className="text-sm font-medium text-muted-foreground">%</span>
          </div>
          <div
            className={`mt-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              trendPositive
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            <TrendingUp className="h-2.5 w-2.5" />
            {trendValue} health
          </div>
          <div className="mt-1.5 text-[9px] text-muted-foreground">
            {visibleHotspots.length} spots in view
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute left-3 top-3 z-[1000]">
        <div className="glass rounded-xl px-2.5 py-2 shadow-md">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <span className="text-[10px] font-medium text-foreground">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-[10px] font-medium text-foreground">Resolved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
              <span className="text-[10px] font-medium text-foreground">You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      {selectedHotspot && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-[1001] bg-foreground/20"
            onClick={closeSheet}
            onKeyDown={(e) => e.key === "Escape" && closeSheet()}
            role="button"
            tabIndex={0}
            aria-label="Close details"
          />

          {/* Sheet */}
          <div
            className={`absolute inset-x-0 bottom-0 z-[1002] rounded-t-3xl bg-card p-5 shadow-2xl ${
              sheetClosing ? "animate-slide-down" : "animate-slide-up"
            }`}
          >
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-destructive" />
                  <h3 className="text-base font-bold text-card-foreground">
                    {selectedHotspot.city}
                  </h3>
                  {selectedHotspot.resolved && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Resolved
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {selectedHotspot.description}
                </p>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="rounded-full p-1 transition-colors hover:bg-secondary"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Severity Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-semibold text-card-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  Dirtiness Rating
                </span>
                <span
                  className={`font-bold ${
                    selectedHotspot.severity > 70
                      ? "text-destructive"
                      : selectedHotspot.severity > 40
                        ? "text-warning"
                        : "text-primary"
                  }`}
                >
                  {selectedHotspot.severity}%
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    selectedHotspot.severity > 70
                      ? "bg-destructive"
                      : selectedHotspot.severity > 40
                        ? "bg-warning"
                        : "bg-primary"
                  }`}
                  style={{ width: `${selectedHotspot.severity}%` }}
                />
              </div>
            </div>

            {/* Visual History Thumbnails */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-card-foreground">Visual History</p>
              <div className="mt-2 flex gap-2 overflow-x-auto hide-scrollbar">
                {[
                  { label: "Before", color: "bg-destructive/10", borderColor: "border-destructive/30" },
                  { label: "Day 3", color: "bg-warning/10", borderColor: "border-warning/30" },
                  { label: "After", color: "bg-primary/10", borderColor: "border-primary/30" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex h-16 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl border ${item.borderColor} ${item.color}`}
                  >
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Reported by {selectedHotspot.reportedBy}</span>
              <span>{selectedHotspot.reportedAt}</span>
            </div>

            {/* Claim Button */}
            {!selectedHotspot.resolved && (
              <button
                type="button"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
                onClick={closeSheet}
              >
                <CheckCircle2 className="h-4 w-4" />
                Claim Mission (+{selectedHotspot.ecoCredits} credits)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Animated purity score counter
function AnimatedScore({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const start = prevRef.current
    const end = value
    const duration = 600
    const startTime = performance.now()

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        prevRef.current = end
      }
    }
    requestAnimationFrame(animate)
  }, [value])

  return (
    <span className="text-3xl font-black tracking-tight text-foreground animate-count-up">
      {display}
    </span>
  )
}

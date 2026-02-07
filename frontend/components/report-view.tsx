"use client"

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Camera, Upload, CheckCircle, Zap, MapPin, X } from "lucide-react"
import { addHotspot, addUserCredits, type Hotspot } from "@/lib/data"

type ReportStep = "upload" | "scanning" | "result" | "success"

export function ReportView({ onReported }: { onReported?: () => void }) {
  const [step, setStep] = useState<ReportStep>("upload")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [severity, setSeverity] = useState(0)
  const [ecoCredits, setEcoCredits] = useState(0)
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => setUserPosition([-26.2041, 28.0473]),
        { enableHighAccuracy: false, timeout: 5000 }
      )
    } else {
      setUserPosition([-26.2041, 28.0473])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const startScanning = useCallback(() => {
    setStep("scanning")
    setScanProgress(0)

    // Generate random severity and credits
    const sev = Math.round(Math.random() * 60 + 30) // 30-90
    const credits = Math.round(sev * 0.6 + Math.random() * 15)
    setSeverity(sev)
    setEcoCredits(credits)

    // Animate scan
    let progress = 0
    const interval = setInterval(() => {
      progress += 2
      setScanProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => setStep("result"), 300)
      }
    }, 60)
  }, [])

  const confirmReport = useCallback(() => {
    if (!userPosition) return

    const newHotspot: Hotspot = {
      id: `user-${Date.now()}`,
      lat: userPosition[0] + (Math.random() - 0.5) * 0.01,
      lng: userPosition[1] + (Math.random() - 0.5) * 0.01,
      severity,
      resolved: false,
      reportedBy: "You",
      reportedAt: new Date().toISOString().split("T")[0],
      description: "User-reported pollution spot",
      city: "Your Area",
      ecoCredits,
    }

    addHotspot(newHotspot)
    addUserCredits(ecoCredits)
    setStep("success")
    onReported?.()
  }, [userPosition, severity, ecoCredits, onReported])

  const resetReport = useCallback(() => {
    setStep("upload")
    setImagePreview(null)
    setSeverity(0)
    setEcoCredits(0)
    setScanProgress(0)
  }, [])

  return (
    <div className="flex h-full flex-col bg-background animate-fade-in">
      {step === "upload" && (
        <UploadStep
          imagePreview={imagePreview}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          onStartScan={startScanning}
        />
      )}
      {step === "scanning" && (
        <ScanningStep progress={scanProgress} canvasRef={canvasRef} />
      )}
      {step === "result" && (
        <ResultStep
          severity={severity}
          ecoCredits={ecoCredits}
          imagePreview={imagePreview}
          onConfirm={confirmReport}
          onCancel={resetReport}
        />
      )}
      {step === "success" && <SuccessStep onDone={resetReport} />}
    </div>
  )
}

function UploadStep({
  imagePreview,
  fileInputRef,
  onFileSelect,
  onStartScan,
}: {
  imagePreview: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onStartScan: () => void
}) {
  return (
    <div className="flex flex-1 flex-col px-5 pt-[env(safe-area-inset-top)]">
      <div className="pt-4">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Report a Spot
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Upload a photo and our AI will analyze it
        </p>
      </div>

      {/* Upload area */}
      <div className="mt-6 flex flex-1 flex-col items-center justify-center">
        {imagePreview ? (
          <div className="relative w-full">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border-2 border-primary/20 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Captured pollution"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-3 rounded-full bg-foreground/60 p-2 text-background backdrop-blur-sm"
                aria-label="Change photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={onStartScan}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
            >
              <Zap className="h-5 w-5" />
              Analyze with AI
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border bg-muted/50 px-6 py-16 transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-foreground">
                Take or Upload a Photo
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Capture pollution to earn eco-credits
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Upload className="h-4 w-4" />
              Choose Image
            </div>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileSelect}
      />

      <div className="flex items-center justify-center gap-2 pb-4 pt-3">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs text-muted-foreground">
          Location will be auto-detected
        </span>
      </div>
    </div>
  )
}

function ScanningStep({
  progress,
  canvasRef,
}: {
  progress: number
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}) {
  // Neural network scanning animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    let animFrame: number
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight

    // Grid nodes
    const cols = 8
    const rows = 12
    const nodes: { x: number; y: number; active: boolean }[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({
          x: (c / (cols - 1)) * w,
          y: (r / (rows - 1)) * h,
          active: false,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Draw grid lines
      ctx.strokeStyle = "rgba(34, 197, 94, 0.08)"
      ctx.lineWidth = 0.5
      for (let r = 0; r < rows; r++) {
        ctx.beginPath()
        ctx.moveTo(0, (r / (rows - 1)) * h)
        ctx.lineTo(w, (r / (rows - 1)) * h)
        ctx.stroke()
      }
      for (let c = 0; c < cols; c++) {
        ctx.beginPath()
        ctx.moveTo((c / (cols - 1)) * w, 0)
        ctx.lineTo((c / (cols - 1)) * w, h)
        ctx.stroke()
      }

      // Activate random nodes
      const activeCount = Math.floor((progress / 100) * nodes.length)
      nodes.forEach((node, i) => {
        node.active = i < activeCount
      })

      // Draw connections between active nodes
      ctx.strokeStyle = "rgba(34, 197, 94, 0.15)"
      ctx.lineWidth = 1
      nodes.forEach((a, i) => {
        if (!a.active) return
        nodes.forEach((b, j) => {
          if (j <= i || !b.active) return
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < w / 3) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        })
      })

      // Draw nodes
      nodes.forEach((node) => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.active ? 3 : 1.5, 0, Math.PI * 2)
        ctx.fillStyle = node.active
          ? "rgba(34, 197, 94, 0.8)"
          : "rgba(34, 197, 94, 0.15)"
        ctx.fill()
      })

      // Scanning line
      const scanY = (progress / 100) * h
      const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 2)
      gradient.addColorStop(0, "rgba(34, 197, 94, 0)")
      gradient.addColorStop(1, "rgba(34, 197, 94, 0.4)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, scanY - 20, w, 22)

      ctx.strokeStyle = "rgba(34, 197, 94, 0.7)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, scanY)
      ctx.lineTo(w, scanY)
      ctx.stroke()

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animFrame)
  }, [progress, canvasRef])

  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-foreground">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 backdrop-blur-sm">
          <Zap className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-background">
            AI Analyzing...
          </h2>
          <p className="mt-1 text-sm text-background/60">
            Scanning pollution severity
          </p>
        </div>
        <div className="w-48">
          <div className="h-2 overflow-hidden rounded-full bg-background/10">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs font-mono text-background/50">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  )
}

function ResultStep({
  severity,
  ecoCredits,
  imagePreview,
  onConfirm,
  onCancel,
}: {
  severity: number
  ecoCredits: number
  imagePreview: string | null
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex flex-1 flex-col px-5 pt-[env(safe-area-inset-top)] animate-fade-in">
      <div className="pt-4">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Analysis Complete
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          AI has assessed the pollution severity
        </p>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-4">
        {/* Preview */}
        {imagePreview && (
          <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Analyzed pollution"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Severity */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-card-foreground">
              Severity Level
            </span>
            <span
              className={`text-2xl font-black ${
                severity > 70
                  ? "text-destructive"
                  : severity > 40
                    ? "text-warning"
                    : "text-primary"
              }`}
            >
              {severity}%
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                severity > 70
                  ? "bg-destructive"
                  : severity > 40
                    ? "bg-warning"
                    : "bg-primary"
              }`}
              style={{ width: `${severity}%` }}
            />
          </div>
        </div>

        {/* Credits reward */}
        <div className="rounded-2xl bg-accent p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-accent-foreground">
              Eco-Credit Reward
            </span>
            <span className="text-2xl font-black text-primary">
              +{ecoCredits}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Credits will be added to your profile upon confirmation
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex flex-1 items-center justify-center rounded-2xl border border-border py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
        >
          <CheckCircle className="h-4 w-4" />
          Confirm Report
        </button>
      </div>
    </div>
  )
}

function SuccessStep({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const launchConfetti = async () => {
      try {
        const confetti = (await import("canvas-confetti")).default
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22C55E", "#10B981", "#059669", "#34D399"],
        })
      } catch {
        // Confetti optional
      }
    }
    launchConfetti()
  }, [])

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 animate-fade-in">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle className="h-14 w-14 text-primary" />
      </div>
      <h2 className="mt-6 text-2xl font-black text-foreground">
        Spot Reported!
      </h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Your report has been added to the map. A new red hotspot is now visible
        at your location.
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
      >
        Report Another
      </button>
    </div>
  )
}

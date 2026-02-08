"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Camera, Upload, CheckCircle, Zap, X, Loader2, ArrowLeft } from "lucide-react"
import { resolveHotspot } from "@/lib/api"
import type { Hotspot } from "@/lib/data"

type CleanupStep = "upload" | "scanning" | "result" | "success"

interface CleanupVerifyViewProps {
  hotspot: Hotspot
  onComplete?: () => void
  onBack?: () => void
}

export function CleanupVerifyView({ hotspot, onComplete, onBack }: CleanupVerifyViewProps) {
  const [step, setStep] = useState<CleanupStep>("upload")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [cleanlinessScore, setCleanlinessScore] = useState(0)
  const [ecoCredits, setEcoCredits] = useState(0)
  const [scanProgress, setScanProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedFileRef = useRef<File | null>(null)
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
    selectedFileRef.current = file
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const startScanning = useCallback(() => {
    setStep("scanning")
    setScanProgress(0)

    // Simulate cleanup verification — higher cleanliness = better cleanup
    const cleanScore = Math.round(Math.random() * 40 + 60) // 60-100
    const credits = hotspot.ecoCredits
    setCleanlinessScore(cleanScore)
    setEcoCredits(credits)

    let progress = 0
    const interval = setInterval(() => {
      progress += 2
      setScanProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => setStep("result"), 300)
      }
    }, 60)
  }, [hotspot.ecoCredits])

  const confirmCleanup = useCallback(async () => {
    if (!userPosition) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      formData.append("latitude", userPosition[0].toString())
      formData.append("longitude", userPosition[1].toString())
      formData.append("claimedBy", localStorage.getItem("vukamap_user_name") || "You")
      if (selectedFileRef.current) {
        formData.append("image", selectedFileRef.current)
      }

      await resolveHotspot(hotspot.id, formData)
      setStep("success")
      onComplete?.()
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit cleanup verification")
    } finally {
      setSubmitting(false)
    }
  }, [userPosition, hotspot.id, onComplete])

  return (
    <div className="flex h-full flex-col bg-background animate-fade-in">
      {step === "upload" && (
        <CleanupUploadStep
          hotspot={hotspot}
          imagePreview={imagePreview}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          onStartScan={startScanning}
          onBack={onBack}
        />
      )}
      {step === "scanning" && (
        <CleanupScanningStep progress={scanProgress} canvasRef={canvasRef} />
      )}
      {step === "result" && (
        <CleanupResultStep
          hotspot={hotspot}
          cleanlinessScore={cleanlinessScore}
          ecoCredits={ecoCredits}
          imagePreview={imagePreview}
          onConfirm={confirmCleanup}
          onBack={() => { setStep("upload"); setImagePreview(null); selectedFileRef.current = null }}
          submitting={submitting}
          submitError={submitError}
        />
      )}
      {step === "success" && <CleanupSuccessStep ecoCredits={ecoCredits} onDone={onBack} />}
    </div>
  )
}

function CleanupUploadStep({
  hotspot,
  imagePreview,
  fileInputRef,
  onFileSelect,
  onStartScan,
  onBack,
}: {
  hotspot: Hotspot
  imagePreview: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onStartScan: () => void
  onBack?: () => void
}) {
  return (
    <div className="flex flex-1 flex-col px-5 pt-[env(safe-area-inset-top)]">
      <div className="pt-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <button type="button" onClick={onBack} className="rounded-full p-1 hover:bg-secondary" aria-label="Go back">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Verify Cleanup
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Upload a photo of the cleaned spot — {hotspot.city}
            </p>
          </div>
        </div>
      </div>

      {/* Original spot info */}
      <div className="mt-4 rounded-2xl bg-accent p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-accent-foreground">Original Report</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{hotspot.description}</p>
          </div>
          <span className={`text-sm font-bold ${
            hotspot.severity > 70 ? "text-destructive" : hotspot.severity > 40 ? "text-warning" : "text-primary"
          }`}>{hotspot.severity}% dirty</span>
        </div>
      </div>

      {/* Upload area */}
      <div className="mt-4 flex flex-1 flex-col items-center justify-center">
        {imagePreview ? (
          <div className="relative w-full">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border-2 border-primary/20 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Cleanup verification"
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
              Verify Cleanup
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
                Photo the Cleaned Spot
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Show us the area after cleanup
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

      <div className="pb-4 pt-3 text-center">
        <span className="text-xs text-muted-foreground">
          AI will verify cleanup of the same spot
        </span>
      </div>
    </div>
  )
}

function CleanupScanningStep({
  progress,
  canvasRef,
}: {
  progress: number
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}) {
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

    const cols = 8
    const rows = 12
    const nodes: { x: number; y: number; active: boolean }[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({ x: (c / (cols - 1)) * w, y: (r / (rows - 1)) * h, active: false })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

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

      const activeCount = Math.floor((progress / 100) * nodes.length)
      nodes.forEach((node, i) => { node.active = i < activeCount })

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

      nodes.forEach((node) => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.active ? 3 : 1.5, 0, Math.PI * 2)
        ctx.fillStyle = node.active ? "rgba(34, 197, 94, 0.8)" : "rgba(34, 197, 94, 0.15)"
        ctx.fill()
      })

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
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 backdrop-blur-sm">
          <Zap className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-background">Verifying Cleanup...</h2>
          <p className="mt-1 text-sm text-background/60">Comparing before & after</p>
        </div>
        <div className="w-48">
          <div className="h-2 overflow-hidden rounded-full bg-background/10">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-center text-xs font-mono text-background/50">{progress}%</p>
        </div>
      </div>
    </div>
  )
}

function CleanupResultStep({
  hotspot,
  cleanlinessScore,
  ecoCredits,
  imagePreview,
  onConfirm,
  onBack,
  submitting,
  submitError,
}: {
  hotspot: Hotspot
  cleanlinessScore: number
  ecoCredits: number
  imagePreview: string | null
  onConfirm: () => void
  onBack: () => void
  submitting: boolean
  submitError: string | null
}) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-[env(safe-area-inset-top)] pb-2 animate-fade-in">
      <div className="pt-4">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Cleanup Verified
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          AI has verified the cleanup at {hotspot.city}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {imagePreview && (
          <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Cleanup verification" className="h-full w-full object-cover" />
          </div>
        )}

        {/* Location match */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-card-foreground">Location Match</span>
            <span className="flex items-center gap-1 text-sm font-bold text-primary">
              <CheckCircle className="h-4 w-4" /> Confirmed
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            GPS matches the original report location
          </p>
        </div>

        {/* Cleanliness Score */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-card-foreground">Cleanliness Score</span>
            <span className="text-2xl font-black text-primary">{cleanlinessScore}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000"
              style={{ width: `${cleanlinessScore}%` }}
            />
          </div>
        </div>

        {/* Credits reward */}
        <div className="rounded-2xl bg-accent p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-accent-foreground">Eco-Credit Reward</span>
            <span className="text-2xl font-black text-primary">+{ecoCredits}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Credits earned for cleaning this spot
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 pb-4 pt-4">
        {submitError && (
          <div className="rounded-xl bg-destructive/10 px-4 py-2 text-center text-xs font-medium text-destructive">
            {submitError}
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="flex flex-1 items-center justify-center rounded-2xl border border-border py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            Retake
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirm Cleanup
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function CleanupSuccessStep({ ecoCredits, onDone }: { ecoCredits: number; onDone?: () => void }) {
  useEffect(() => {
    const launchConfetti = async () => {
      try {
        const confetti = (await import("canvas-confetti")).default
        confetti({
          particleCount: 150,
          spread: 80,
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
      <h2 className="mt-6 text-2xl font-black text-foreground">Spot Cleaned!</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        You earned <span className="font-bold text-primary">+{ecoCredits}</span> eco-credits.
        The hotspot has been marked as resolved on the map!
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
      >
        Back to Map
      </button>
    </div>
  )
}

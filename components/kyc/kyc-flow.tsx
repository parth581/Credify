"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Props = {
  role: "lender" | "borrower"
  onDone: (faceDataUrl: string, aadhaarFile?: File | null) => void
}

export function KycFlow({ role, onDone }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [aadhaar, setAadhaar] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
      }
    } catch (e) {
      setError("Camera access denied. Please allow camera permissions.")
    }
  }

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop())
    setStream(null)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL("image/png")
    setCaptured(dataUrl)
    stopCamera()
  }

  return (
    <Card className="bg-[var(--color-card-background)]">
      <CardContent className="space-y-4 p-4">
        <div className="text-sm font-medium">KYC Verification ({role})</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="rounded-md border bg-background p-2">
              <video ref={videoRef} className="h-56 w-full rounded-md bg-black object-cover" />
            </div>
            <div className="flex gap-2">
              <Button onClick={startCamera} className="bg-primary text-primary-foreground">
                Start Camera
              </Button>
              <Button variant="outline" onClick={capturePhoto}>
                Capture
              </Button>
            </div>
            {error && <div className="text-xs text-destructive">{error}</div>}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Upload Aadhaar (image)</div>
            <Input type="file" accept="image/*" onChange={(e) => setAadhaar(e.target.files?.[0] ?? null)} />
            <div className="rounded-md border bg-muted p-2 text-xs">
              For demo: we accept any live photo and image upload as valid KYC.
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              // Accept both and mark KYC done
              const face = captured ?? ""
              localStorage.setItem(`kyc:${role}`, "true")
              if (face) localStorage.setItem(`kyc:face:${role}`, face)
              onDone(face, aadhaar)
            }}
            className="bg-primary text-primary-foreground"
          >
            Verify & Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

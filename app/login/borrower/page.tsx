"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KycFlow } from "@/components/kyc/kyc-flow"

export default function BorrowerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showKyc, setShowKyc] = useState(false)
  const [hasKyc, setHasKyc] = useState(false)
  const role = "borrower" as const

  useEffect(() => {
    setHasKyc(localStorage.getItem(`kyc:${role}`) === "true")
  }, [])

  const signIn = () => {
    if (!hasKyc) {
      setShowKyc(true)
      return
    }
    router.push("/borrower")
  }

  const photoLogin = () => {
    if (localStorage.getItem(`kyc:${role}`) === "true") {
      router.push("/borrower")
    } else {
      setShowKyc(true)
    }
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/><path d="M21 12H9"/></svg>
          Back
        </Button>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Borrower Login</h1>
        <p className="text-sm text-muted-foreground">Use email & password or login with your photo after KYC.</p>
      </div>

      <Card className="bg-[var(--color-card-background)]">
        <CardContent className="space-y-4 p-6">
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={signIn} className="bg-primary text-primary-foreground">
              Sign In
            </Button>
            <Button variant="outline" onClick={() => setShowKyc(true)}>
              Start KYC
            </Button>
            <Button variant="outline" onClick={photoLogin}>
              Login with Photo
            </Button>
          </div>
          {!hasKyc && (
            <div className="text-xs text-muted-foreground">
              KYC is required once. After completion, you can login using your photo.
            </div>
          )}
        </CardContent>
      </Card>

      {showKyc && (
        <div className="space-y-4">
          <KycFlow
            role={role}
            onDone={() => {
              setHasKyc(true)
              setShowKyc(false)
              router.push("/borrower")
            }}
          />
        </div>
      )}
    </main>
  )
}

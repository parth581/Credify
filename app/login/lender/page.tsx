"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KycFlow } from "@/components/kyc/kyc-flow"

export default function LenderLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showKyc, setShowKyc] = useState(false)
  const [hasKyc, setHasKyc] = useState(false)
  const role = "lender" as const

  useEffect(() => {
    setHasKyc(localStorage.getItem(`kyc:${role}`) === "true")
  }, [])

  const signIn = () => {
    if (!hasKyc) {
      setShowKyc(true)
      return
    }
    // Mock email/password acceptance
    router.push("/lender")
  }

  const photoLogin = () => {
    // Mock photo verification: if kyc exists, allow
    if (localStorage.getItem(`kyc:${role}`) === "true") {
      router.push("/lender")
    } else {
      setShowKyc(true)
    }
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Lender Login</h1>
        <p className="text-sm text-muted-foreground">Use email & password or login with your photo after KYC.</p>
      </div>

      <Card>
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
              // Redirect post-KYC
              router.push("/lender")
            }}
          />
        </div>
      )}
    </main>
  )
}

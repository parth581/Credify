"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Mail, Lock, Shield } from "lucide-react"
import { KycFlow } from "@/components/kyc/kyc-flow"
import { authService } from "@/lib/auth-service"
import { lenderService } from "@/lib/database-service"

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

  const signIn = async () => {
    const emailValid = /^(?:[a-zA-Z0-9_'^&\+`{}~!-]+(?:\.[a-zA-Z0-9_'^&\+`{}~!-]+)*|\"(?:[^\"\\]|\\.)+\")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(
      email.trim(),
    )
    const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)

    if (!emailValid) {
      alert("Please enter a valid email address.")
      return
    }
    if (!passwordValid) {
      alert(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      )
      return
    }

    try {
      // Try to sign in with Firebase
      const result = await authService.signIn(email, password)
      
      if (result.success) {
        // Check if lender profile exists
        const profileResult = await lenderService.getLenderProfile(result.user!.uid)
        
        if (profileResult.success) {
          // Existing user - check KYC status
          const userData = profileResult.data
          if (userData.kycCompleted) {
            alert(`✅ Login successful! Welcome back, Parth!`)
            router.push("/lender")
          } else {
            alert("✅ Login successful! Please complete KYC verification.")
            setShowKyc(true)
          }
        } else {
          // New user - create profile and require KYC
          await lenderService.createLenderProfile({
            uid: result.user!.uid,
            email: email,
            displayName: result.user!.displayName || "Parth",
            kycCompleted: false
          })
          
          alert("✅ Registration successful! Please complete KYC verification.")
          setShowKyc(true)
        }
      } else {
        // If sign in fails, try to register
        const registerResult = await authService.register(email, password, "lender", "Parth")
        
        if (registerResult.success) {
          // Create lender profile with KYC pending
          await lenderService.createLenderProfile({
            uid: registerResult.user!.uid,
            email: email,
            displayName: "Parth",
            kycCompleted: false
          })
          
          alert("✅ Registration successful! Please complete KYC verification.")
          setShowKyc(true)
        } else {
          alert(`❌ ${registerResult.message}: ${registerResult.error}`)
        }
      }
    } catch (error) {
      console.error("Authentication error:", error)
      alert("❌ Authentication failed. Please try again.")
    }
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
    <main className="relative mx-auto max-w-xl space-y-6 px-4 py-12">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]">
        {/* Unified diagonal pair (same color, size, radius) */}
        <div className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-primary/45 to-violet-500 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-primary/45 to-violet-500 blur-3xl" />
      </div>
      <div className="flex items-center justify-between">
        <BackButton />
        <div />
      </div>
      <div className="text-center animate-in fade-in-0 slide-in-from-top-2 duration-500">
        <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Shield className="h-3.5 w-3.5 text-primary" />
          Institutional-grade security
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Lender Login</h1>
        <p className="text-sm text-muted-foreground">Use email & password or login with your photo after KYC.</p>
      </div>

      <Card className="transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-primary/30">
        <CardContent className="space-y-4 p-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="max-w-xs text-xs">
                Enter a valid email like name@example.com
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="max-w-xs text-xs">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex flex-wrap gap-3">
            <Button onClick={signIn} className="bg-primary text-primary-foreground transition-transform duration-200 hover:scale-[1.01]">
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
            onDone={async () => {
              setHasKyc(true)
              setShowKyc(false)
              
              // Update KYC status in Firebase database
              try {
                const currentUser = authService.getCurrentUser()
                if (currentUser) {
                  await lenderService.updateLenderProfile(currentUser.uid, {
                    kycCompleted: true
                  })
                }
              } catch (error) {
                console.error("Failed to update KYC status in database:", error)
              }
              
              // Redirect post-KYC
              router.push("/lender")
            }}
          />
        </div>
      )}
    </main>
  )
}

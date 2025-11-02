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
import { otpService } from "@/lib/otp-service"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export default function LenderLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showKyc, setShowKyc] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [hasKyc, setHasKyc] = useState(false)
  const role = "lender" as const
  const [otpStep, setOtpStep] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otp, setOtp] = useState("")
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

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
      // Try to sign in with Firebase first
      const result = await authService.signIn(email, password)
      
      if (result.success) {
        // Start OTP step for lender login
        setIsSendingOtp(true)
        const sendRes = await otpService.sendLoginOtp(email)
        setIsSendingOtp(false)
        if (sendRes.success) {
          setOtpStep(true)
          alert("An OTP has been sent to your email. Please enter it to continue.")
        } else {
          alert(`❌ Failed to send OTP: ${sendRes.message}`)
        }
      } else {
        // Sign in failed - try to register a new account
        if (result.error?.includes('user-not-found') || result.error?.includes('invalid-credential')) {
          try {
            const registerResult = await authService.register(email, password, "lender", "Parth")
            
            if (registerResult.success) {
              // Check if profile already exists with this email
              const existingProfileResult = await lenderService.getLenderProfileByEmail(email)
              
              if (existingProfileResult.success) {
                // Profile exists - update UID and redirect
                await lenderService.updateLenderProfile(existingProfileResult.data!.uid, {
                  uid: registerResult.user!.uid,
                  email: email,
                  displayName: "Parth"
                })
                
                if (existingProfileResult.data!.kycCompleted) {
                  alert(`✅ Registration successful! Welcome back, Parth!`)
                  router.push("/lender")
                } else {
                  alert("✅ Profile linked! Please complete KYC verification.")
                  setShowKyc(true)
                }
              } else {
                // No existing profile - create new one
                await lenderService.createLenderProfile({
                  uid: registerResult.user!.uid,
                  email: email,
                  displayName: "Parth",
                  kycCompleted: false
                })
                
                alert("✅ Registration successful! Please complete KYC verification.")
                setShowKyc(true)
              }
            } else {
              // Handle specific registration errors
              if (registerResult.error?.includes('email-already-in-use')) {
                alert("❌ This email is already registered. Please use a different email address or try logging in.")
              } else {
                alert(`❌ Registration failed: ${registerResult.error}`)
              }
            }
          } catch (registerError) {
            console.error("Registration error:", registerError)
            alert("❌ Registration failed. Please try again.")
          }
        } else {
          // Other sign in errors
          if (result.error?.includes('wrong-password')) {
            alert("❌ Incorrect password. Please try again.")
          } else if (result.error?.includes('invalid-email')) {
            alert("❌ Invalid email format. Please check your email.")
          } else {
            alert(`❌ Login failed: ${result.error}`)
          }
        }
      }
    } catch (error) {
      console.error("Authentication error:", error)
      alert("❌ Authentication failed. Please try again.")
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      alert("Please enter the 6-digit OTP.")
      return
    }
    setIsVerifyingOtp(true)
    const res = await otpService.verifyLoginOtp(email, otp)
    setIsVerifyingOtp(false)
    if (!res.success) {
      alert(`❌ ${res.message}`)
      return
    }
    // Proceed with prior post-sign-in flow now that OTP is verified
    try {
      const currentUser = authService.getCurrentUser()
      if (!currentUser) {
        alert("Session expired. Please sign in again.")
        setOtpStep(false)
        return
      }

      const profileResult = await lenderService.getLenderProfile(currentUser.uid)
      if (profileResult.success) {
        const userData = profileResult.data
        if (userData && userData.kycCompleted) {
          alert(`✅ Login successful! Welcome back, Parth!`)
          router.push("/lender")
        } else {
          const hasKycInStorage = localStorage.getItem(`kyc:${role}:${email}`) === "true"
          if (hasKycInStorage) {
            try {
              await lenderService.updateLenderProfile(currentUser.uid, { kycCompleted: true })
              alert(`✅ Login successful! Welcome back, Parth!`)
              router.push("/lender")
            } catch (error) {
              console.error("Failed to update KYC status:", error)
              alert("✅ Login successful! Please complete KYC verification.")
              setShowKyc(true)
            }
          } else {
            alert("✅ Login successful! Please complete KYC verification.")
            setShowKyc(true)
          }
        }
      } else {
        const existingProfileResult = await lenderService.getLenderProfileByEmail(email)
        if (existingProfileResult.success) {
          await lenderService.updateLenderProfile(existingProfileResult.data!.uid, {
            uid: currentUser.uid,
            email: email,
            displayName: currentUser.displayName || "Parth"
          })
          if (existingProfileResult.data!.kycCompleted) {
            alert(`✅ Login successful! Welcome back, Parth!`)
            router.push("/lender")
          } else {
            alert("✅ Profile linked! Please complete KYC verification.")
            setShowKyc(true)
          }
        } else {
          await lenderService.createLenderProfile({
            uid: currentUser.uid,
            email: email,
            displayName: currentUser.displayName || "Parth",
            kycCompleted: false
          })
          alert("✅ Profile created! Please complete KYC verification.")
          setShowKyc(true)
        }
      }
      setOtpStep(false)
      setOtp("")
    } catch (e) {
      console.error(e)
      alert("Something went wrong after OTP verification. Please try again.")
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

  // ✅ Forgot Password Function
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      alert("Please enter your email address.")
      return
    }

    const emailValid = /^(?:[a-zA-Z0-9_'^&\+`{}~!-]+(?:\.[a-zA-Z0-9_'^&\+`{}~!-]+)*|\"(?:[^\"\\]|\\.)+\")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(
      forgotPasswordEmail.trim(),
    )

    if (!emailValid) {
      alert("Please enter a valid email address.")
      return
    }

    setIsSendingReset(true)
    try {
      const result = await authService.sendPasswordReset(forgotPasswordEmail)
      
      if (result.success) {
        alert(`✅ Password reset email sent to ${forgotPasswordEmail}\nPlease check your inbox and follow the instructions to reset your password.`)
        setShowForgotPassword(false)
        setForgotPasswordEmail("")
      } else {
        if (result.error?.includes('user-not-found')) {
          alert("❌ No account found with this email address.")
        } else {
          alert(`❌ ${result.message}: ${result.error}`)
        }
      }
    } catch (error) {
      console.error("Password reset error:", error)
      alert("❌ Failed to send password reset email. Please try again.")
    } finally {
      setIsSendingReset(false)
    }
  };

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
            <Button onClick={signIn} disabled={isSendingOtp} className="bg-primary text-primary-foreground transition-transform duration-200 hover:scale-[1.01]">
              {isSendingOtp ? 'Sending OTP...' : 'Sign In'}
            </Button>
            <Button variant="outline" onClick={() => setShowKyc(true)}>
              Start KYC
            </Button>
            <Button variant="outline" onClick={photoLogin}>
              Login with Photo
            </Button>
          </div>

          <div className="text-center">
            <button 
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Forgot Password?
            </button>
          </div>
          {!hasKyc && (
            <div className="text-xs text-muted-foreground">
              KYC is required once. After completion, you can login using your photo.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Forgot Password Modal */}
      {showForgotPassword && (
        <Card className="transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-primary/30">
          <CardContent className="space-y-4 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Reset Password</h3>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a password reset link.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter your email address"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleForgotPassword}
                  disabled={isSendingReset}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  {isSendingReset ? "Sending..." : "Send Reset Email"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotPasswordEmail("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ OTP Step */}
      {otpStep && (
        <Card className="transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-primary/30">
          <CardContent className="space-y-4 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Enter OTP</h3>
              <p className="text-sm text-muted-foreground">We sent a 6-digit code to {email}.</p>
            </div>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleVerifyOtp} disabled={isVerifyingOtp || otp.length !== 6} className="flex-1 bg-primary text-primary-foreground">
                {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  setIsSendingOtp(true)
                  const resend = await otpService.sendLoginOtp(email)
                  setIsSendingOtp(false)
                  if (resend.success) alert('OTP resent. Please check your email.')
                  else alert(`Failed to resend OTP: ${resend.message}`)
                }}
              >
                Resend
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                  console.log("Updating KYC status for user:", currentUser.uid)
                  const updateResult = await lenderService.updateLenderProfile(currentUser.uid, {
                    kycCompleted: true
                  })
                  
                  if (updateResult.success) {
                    console.log("✅ KYC status updated in Firebase database")
                  } else {
                    console.error("❌ Failed to update KYC status:", updateResult.message)
                    alert("⚠️ KYC verified but database update failed. Please contact support.")
                  }
                } else {
                  console.error("❌ No current user found for KYC update")
                  alert("⚠️ KYC verified but user session not found. Please try logging in again.")
                }
              } catch (error) {
                console.error("❌ Failed to update KYC status in database:", error)
                alert("⚠️ KYC verified but database update failed. Please contact support.")
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

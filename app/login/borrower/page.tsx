"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Mail, Lock, ShieldCheck } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { authService } from "@/lib/auth-service"
import { borrowerService } from "@/lib/database-service"

export default function BorrowerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [hasKyc, setHasKyc] = useState(false)
  const [kycInProgress, setKycInProgress] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [aadhaarImage, setAadhaarImage] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [isSendingReset, setIsSendingReset] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const role = "borrower" as const

  // ✅ Check email-specific KYC status
  useEffect(() => {
    if (email) {
      setHasKyc(localStorage.getItem(`kyc:${role}:${email}`) === "true")
    }
  }, [email, role])

  // ✅ Sign In Logic with Firebase and KYC
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
        // Check if borrower profile exists
        const profileResult = await borrowerService.getBorrowerProfile(result.user!.uid)
        
        if (profileResult.success) {
          // Existing user - check KYC status
          const userData = profileResult.data
          if (userData && userData.kycCompleted) {
            alert(`✅ Login successful! Welcome back, Parth!`)
            router.push("/borrower")
          } else {
            // Check if user has completed KYC in localStorage (for existing users)
            const hasKycInStorage = localStorage.getItem(`kyc:${role}:${email}`) === "true"
            if (hasKycInStorage) {
              // Update Firebase profile to reflect KYC completion
              try {
                await borrowerService.updateBorrowerProfile(result.user!.uid, {
                  kycCompleted: true
                })
                alert(`✅ Login successful! Welcome back, Parth!`)
                router.push("/borrower")
              } catch (error) {
                console.error("Failed to update KYC status:", error)
                alert("✅ Login successful! Please complete KYC verification.")
                setKycInProgress(true)
              }
            } else {
              alert("✅ Login successful! Please complete KYC verification.")
              setKycInProgress(true)
            }
          }
        } else {
          // User exists in Firebase Auth but no profile - check if profile exists with same email
          const existingProfileResult = await borrowerService.getBorrowerProfileByEmail(email)
          
          if (existingProfileResult.success) {
            // Profile exists with same email - update UID and redirect
            await borrowerService.updateBorrowerProfile(existingProfileResult.data!.uid, {
              uid: result.user!.uid,
              email: email,
              displayName: result.user!.displayName || "Parth"
            })
            
            // Check KYC status from existing profile
            if (existingProfileResult.data!.kycCompleted) {
              alert(`✅ Login successful! Welcome back, Parth!`)
              router.push("/borrower")
            } else {
              alert("✅ Profile linked! Please complete KYC verification.")
              setKycInProgress(true)
            }
          } else {
            // No existing profile - create new one
            await borrowerService.createBorrowerProfile({
              uid: result.user!.uid,
              email: email,
              displayName: result.user!.displayName || "Parth",
              kycCompleted: false
            })
            
            alert("✅ Profile created! Please complete KYC verification.")
            setKycInProgress(true)
          }
        }
      } else {
        // Sign in failed - try to register a new account
        if (result.error?.includes('user-not-found') || result.error?.includes('invalid-credential')) {
          try {
            const registerResult = await authService.register(email, password, "borrower", "Parth")
            
            if (registerResult.success) {
              // Check if profile already exists with this email
              const existingProfileResult = await borrowerService.getBorrowerProfileByEmail(email)
              
              if (existingProfileResult.success) {
                // Profile exists - update UID and redirect
                await borrowerService.updateBorrowerProfile(existingProfileResult.data!.uid, {
                  uid: registerResult.user!.uid,
                  email: email,
                  displayName: "Parth"
                })
                
                if (existingProfileResult.data!.kycCompleted) {
                  alert(`✅ Registration successful! Welcome back, Parth!`)
                  router.push("/borrower")
                } else {
                  alert("✅ Profile linked! Please complete KYC verification.")
                  setKycInProgress(true)
                }
              } else {
                // No existing profile - create new one
                await borrowerService.createBorrowerProfile({
                  uid: registerResult.user!.uid,
                  email: email,
                  displayName: "Parth",
                  kycCompleted: false
                })
                
                alert("✅ Registration successful! Please complete KYC verification.")
                setKycInProgress(true)
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

  // ✅ Camera Access
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setCameraStream(stream)
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (err) {
      console.error("Camera access denied:", err)
      alert("Please allow camera access for KYC.")
    }
  }

  // ✅ Capture Face Image
  const captureImage = () => {
    const canvas = document.createElement("canvas")
    const video = videoRef.current
    if (!video) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const image = canvas.toDataURL("image/png")
    setCapturedImage(image)
    cameraStream?.getTracks().forEach((t) => t.stop())
  }

  // ✅ Gemini Verification Logic
  const verifyWithGemini = async () => {
  if (!aadhaarImage || !capturedImage) {
    alert("Please upload Aadhaar photo and capture your live image.");
    return;
  }

  setIsVerifying(true);
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyBg4av8LfENaabWgid2JuSX8B_fDx1RVuk");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert biometric verification assistant.
You must behave as a professional AI face verification system that avoids hallucination.
Your job is to extract and compare faces from two provided images.

### Instructions:
1. Extract the *face region only* from the Aadhaar image. Ignore text, logos, and background.
2. Extract the *face region* from the live captured image.
3. Compare the faces using visual geometry, landmarks, and texture patterns.
4. Return your output strictly in the following JSON format:

{
  "similarity": <number between 0 and 100>,
  "decision": "MATCH" | "NO MATCH",
  "reason": "<brief reason>"
}

### Decision criteria:
- If the faces match with ≥ 90% similarity, return "MATCH".
- Otherwise, return "NO MATCH".
`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: "image/jpeg", data: aadhaarImage.split(",")[1] } },
      { inlineData: { mimeType: "image/jpeg", data: capturedImage.split(",")[1] } },
    ]);

    const responseText = (await result.response.text()).trim();
    console.log("Gemini raw output:", responseText);

    // Try to safely extract JSON content
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (parsed && parsed.similarity >= 90 && parsed.decision === "MATCH") {
      alert(`✅ KYC Verified! Similarity: ${parsed.similarity.toFixed(1)}%`)
      localStorage.setItem(`kyc:${role}:${email}`, "true")
      setHasKyc(true)
      setKycInProgress(false)
      
      // Update KYC status in Firebase database
      try {
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          console.log("Updating KYC status for user:", currentUser.uid)
          const updateResult = await borrowerService.updateBorrowerProfile(currentUser.uid, {
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
      
      router.push("/borrower")
    } else {
      alert(
        `❌ Face mismatch. Similarity: ${
          parsed?.similarity ?? "unknown"
        }%. Try again.`
      )
    }
  } catch (error) {
    console.error("Gemini Verification Error:", error);
    alert("Verification failed. Please try again later.");
  } finally {
    setIsVerifying(false);
  }
  };

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

  // ✅ UI Section
  return (
    <main className="relative mx-auto max-w-xl space-y-6 px-4 py-12">
      {/* Decorative finance gradient background across the entire viewport */}
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
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Secure access • RBI-compliant practices
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Borrower Login</h1>
        <p className="text-sm text-muted-foreground">Login using your registered email and password</p>
      </div>

      <Card className="transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-primary/30">
        <CardContent className="space-y-4 p-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
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

          <Button
            onClick={signIn}
            className="w-full bg-primary text-primary-foreground transition-transform duration-200 hover:scale-[1.01]"
          >
            Sign In
          </Button>

          <div className="text-center">
            <button 
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Forgot Password?
            </button>
          </div>

          {!hasKyc && (
            <div className="text-xs text-muted-foreground text-center">
              KYC verification is required once after your first login.
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

      {/* ✅ KYC Flow */}
      {kycInProgress && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-medium text-lg">Start KYC Verification</h2>

              {/* Aadhaar Upload */}
              <div>
                <p className="text-sm mb-2">Upload your Aadhaar photo:</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (r) => setAadhaarImage(r.target?.result as string)
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                {aadhaarImage && (
                  <img
                    src={aadhaarImage}
                    alt="Aadhaar"
                    className="mt-3 mx-auto w-48 h-48 object-cover rounded-lg border"
                  />
                )}
              </div>

              
              {/* Camera Capture */}
              <Button onClick={startCamera}>Access Camera</Button>
              <div className="flex justify-center">
              { !capturedImage && (
    <video
      ref={videoRef}
      autoPlay
      className="rounded-lg shadow-md w-full max-w-sm"
    />
  )}
</div>
<Button onClick={captureImage} disabled={!cameraStream}>
  Capture Image
</Button>

              {capturedImage && (
                <div className="text-center">
                  <p className="text-sm font-medium mt-2 mb-1">Captured Image:</p>
                  <img
                    src={capturedImage}
                    alt="Captured Face"
                    className="mx-auto w-48 h-48 object-cover rounded-full border"
                  />
                </div>
              )}

              <Button
                onClick={verifyWithGemini}
                disabled={isVerifying || !capturedImage || !aadhaarImage}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isVerifying ? "Verifying..." : "Verify & Complete KYC"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}
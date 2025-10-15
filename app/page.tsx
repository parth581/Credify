import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"

export default function LandingPage() {
  return (
    <main>
      <SiteNavbar />
      <Hero />
      <HowItWorks />
      <section id="community" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          Join a growing community of borrowers and lenders building better finance together.
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

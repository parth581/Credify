import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pb-20 pt-32 text-center">
      <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
        Community-Powered Lending. Fairer for Everyone.
      </h1>
      <p className="text-pretty text-base text-muted-foreground md:text-lg">
        Connect directly with lenders or fund promising applications. A transparent, secure, and community-driven loan
        marketplace.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/login/borrower">
          <Button className="bg-primary text-primary-foreground hover:opacity-90">Apply for a Loan</Button>
        </Link>
        <Link href="/login/lender">
          <Button variant="outline">Start Lending</Button>
        </Link>
      </div>

      <div
        className="absolute inset-0 -z-10 bg-[url('/subtle-financial-network-background.jpg')] bg-cover bg-center opacity-10"
        aria-hidden="true"
      />
    </section>
  )
}

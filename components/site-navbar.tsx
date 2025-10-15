import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-balance">Credify</span>
        </Link>

        <ul className="hidden gap-6 md:flex">
          <li>
            <Link href="#how" className="text-sm text-foreground/80 hover:text-foreground">
              How It Works
            </Link>
          </li>
          <li>
            <Link href="#features" className="text-sm text-foreground/80 hover:text-foreground">
              Features
            </Link>
          </li>
          <li>
            <Link href="#community" className="text-sm text-foreground/80 hover:text-foreground">
              Community
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          <Link href="/login/lender">
            <Button variant="ghost" className="hidden md:inline-flex">
              Lender Login
            </Button>
          </Link>
          <Link href="/login/borrower">
            <Button className="bg-primary text-primary-foreground hover:opacity-90">Borrower Login</Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}

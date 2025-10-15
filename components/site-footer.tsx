export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="font-semibold">Credify</div>
          <p className="mt-2 text-sm text-muted-foreground">Community-Powered Lending. Fairer for Everyone.</p>
        </div>
        <div className="flex gap-6">
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
            </li>
          </ul>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:underline">
                Twitter
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                LinkedIn
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                GitHub
              </a>
            </li>
          </ul>
        </div>
        <div className="md:text-right">
          <p className="text-sm text-muted-foreground">© {year} Credify</p>
        </div>
      </div>
    </footer>
  )
}

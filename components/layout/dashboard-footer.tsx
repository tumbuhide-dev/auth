export function DashboardFooter() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "SecureAuth"
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden md:block border-t bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} {appName}. Semua hak dilindungi.
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Dibuat dengan ❤️ menggunakan Next.js & Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

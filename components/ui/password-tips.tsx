"use client"
import { Button } from "@/components/ui/button"

interface PasswordTipsProps {
  password: string
  isVisible: boolean
  onToggle: () => void
}

export function PasswordTips({ password, isVisible, onToggle }: PasswordTipsProps) {
  const requirements = [
    {
      label: "Minimal 8 karakter",
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      label: "Mengandung huruf besar",
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      label: "Mengandung huruf kecil",
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    {
      label: "Mengandung angka",
      test: (pwd: string) => /\d/.test(pwd),
    },
  ]

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
      >
        {isVisible ? "Sembunyikan" : "Lihat"} persyaratan password
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-3 h-3 ml-1 transition-transform ${isVisible ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </Button>

      {isVisible && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-medium text-muted-foreground">Persyaratan password:</p>
          <div className="space-y-1">
            {requirements.map((req, index) => {
              const isValid = req.test(password)
              return (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center ${
                      isValid
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isValid ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-2 h-2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <div className="w-1 h-1 bg-current rounded-full" />
                    )}
                  </div>
                  <span className={isValid ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                    {req.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

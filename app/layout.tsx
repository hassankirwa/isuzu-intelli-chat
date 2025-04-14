import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "ISUZU IntelliChat",
  description: "AI-powered chat assistant for ISUZU East Africa",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'
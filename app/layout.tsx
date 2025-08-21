import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono as GeistMono } from "next/font/google"
import { RealTimeProvider } from "@/components/real-time-provider"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geistMono = GeistMono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tactical Operations Dashboard",
  description: "Tactical command and control system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistMono.className} antialiased`}>
        <ThemeProvider defaultTheme="light">
          <RealTimeProvider>
            {children}
          </RealTimeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

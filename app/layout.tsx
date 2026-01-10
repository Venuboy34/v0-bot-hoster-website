import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BotHoster - Telegram Bot Hosting Platform",
  description:
    "Host and manage your Telegram bots with ease. Create, deploy, and scale your bots on our secure platform.",
  icons: {
    icon: "https://i.ibb.co/SX1t2PxW/img-8312532076.jpg",
    apple: "https://i.ibb.co/SX1t2PxW/img-8312532076.jpg",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

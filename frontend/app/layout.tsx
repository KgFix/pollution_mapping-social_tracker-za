import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'VukaMap - Community Waste Management',
  description: 'Community-driven waste management for South Africa. Report, track, and clean up pollution hotspots together.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#22C55E',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased demo-presentation`}>
        <div className="demo-background" />
        <div className="demo-phone-container">
          <div className="demo-phone-frame" />
          <div className="demo-app-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}

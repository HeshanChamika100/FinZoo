import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { PetsProvider } from '@/lib/pets-context'
import { AuthProvider } from '@/lib/auth-context'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'FinZoo - Premium Pets & Companions',
  description: 'Find your perfect pet companion at FinZoo. We offer a wide selection of healthy, well-cared-for pets with exceptional customer service.',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <PetsProvider>
            {children}
          </PetsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

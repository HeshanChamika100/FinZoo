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
  metadataBase: new URL('https://fin-zoo.vercel.app'),
  title: {
    default: 'FinZoo - Premium Pets & Companions | Pet Shop Sri Lanka',
    template: '%s | FinZoo',
  },
  description:
    'FinZoo is your trusted pet shop in Sri Lanka. Discover Guppies, ornamental Chickens, Rabbits and more. Healthy, well-cared-for pets with safe delivery island-wide.',
  keywords: [
    'finzoo',
    'fin zoo',
    'FinZoo',
    'pet shop Sri Lanka',
    'buy pets online Sri Lanka',
    'guppy fish Sri Lanka',
    'ornamental fish',
    'rabbits for sale',
    'chickens for sale',
    'premium pets',
    'pet delivery Sri Lanka',
    'Padukka pet shop',
  ],
  generator: 'Next.js',
  applicationName: 'FinZoo',
  authors: [{ name: 'FinZoo' }],
  creator: 'FinZoo',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  alternates: {
    canonical: 'https://fin-zoo.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fin-zoo.vercel.app',
    siteName: 'FinZoo',
    title: 'FinZoo - Premium Pets & Companions',
    description:
      'Discover Guppies, Chickens, Rabbits and more at FinZoo. Healthy pets with safe delivery across Sri Lanka.',
    images: [
      {
        url: '/logo with name.png',
        width: 1200,
        height: 630,
        alt: 'FinZoo - Premium Pets & Companions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinZoo - Premium Pets & Companions',
    description:
      'Discover Guppies, Chickens, Rabbits and more at FinZoo. Healthy pets with safe delivery across Sri Lanka.',
    images: ['/logo with name.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'PetStore',
  name: 'FinZoo',
  url: 'https://fin-zoo.vercel.app',
  logo: 'https://fin-zoo.vercel.app/logo.png',
  image: 'https://fin-zoo.vercel.app/logo with name.png',
  description:
    'Premium pet shop in Sri Lanka offering Guppies, ornamental Chickens, Rabbits and more with island-wide delivery.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '508/B/3, Pahala Padukka',
    addressLocality: 'Padukka',
    addressCountry: 'LK',
  },
  telephone: '+94701964941',
  email: 'contact.finzoo@gmail.com',
  sameAs: [],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    opens: '00:00',
    closes: '23:59',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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

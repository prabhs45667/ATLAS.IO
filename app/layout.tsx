import type { Metadata, Viewport } from 'next'
import { Brygada_1918, Hanken_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const brygada = Brygada_1918({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-brygada',
  display: 'swap',
})

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hanken',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://atlas-io.vercel.app'),
  title: 'Atlas.io — GeoGuessr but for Different Time Periods',
  description:
    'Atlas.io is a free GeoGuessr-style history game. Explore 360° panoramas of iconic moments in history, guess the location and time period, and compete with friends in multiplayer. Like GeoGuessr but for different eras — from Ancient Rome to the modern day.',
  keywords: [
    'GeoGuessr but for time periods',
    'GeoGuessr history',
    'GeoGuessr but for different time periods',
    'historical geography game',
    'guess the time period game',
    'history guessing game',
    'time travel game',
    'Atlas.io game',
    'GeoGuessr alternative',
    'GeoGuessr with time',
    'historical panorama game',
  ],
  openGraph: {
    title: 'Atlas.io — GeoGuessr but for Different Time Periods',
    description:
      'Explore 360° panoramas of iconic moments in history. Guess the location and time period. Play solo, lightning, or multiplayer.',
    type: 'website',
    siteName: 'Atlas.io',
    url: 'https://atlas-io.vercel.app',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Atlas.io — GeoGuessr but for different time periods' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atlas.io — GeoGuessr but for Different Time Periods',
    description:
      'Explore 360° panoramas of iconic moments in history. Guess the location and time period. Play solo, lightning, or multiplayer.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#1c1713',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${brygada.variable} ${hanken.variable} bg-background`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased min-h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

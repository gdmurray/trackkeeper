import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { QueryClientProvider } from '@/lib/query-client'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'TrackKeeper',
  description: 'Keep track of your removed songs from Spotify',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <QueryClientProvider>{children}</QueryClientProvider>
      </body>
    </html>
  )
}

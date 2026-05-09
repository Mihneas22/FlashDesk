import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import 'katex/dist/katex.min.css'
import { AuthGuard } from '@/components/auth-guard'
import { CookieBanner } from '@/components/cookie-banner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'LearnQHub — Engineering Flashcards',
  description: 'Spaced-repetition flashcard app for engineering students with LaTeX formula support.',
  icons:{
    icon: '/favicon.png'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthGuard>
          {children}
        </AuthGuard>

        <CookieBanner />
      </body>
    </html>
  )
}

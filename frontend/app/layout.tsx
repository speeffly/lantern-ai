import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lantern AI - Career Exploration for High School Students',
  description: 'AI-powered career guidance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

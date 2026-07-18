import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Szwego & Yupoo Search',
  description: 'Motor de busca para Szwego e Yupoo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}

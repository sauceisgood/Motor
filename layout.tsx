export const metadata = {
  title: 'Motor de Busca',
  description: 'Pesquisa em Szwego e Yupoo',
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

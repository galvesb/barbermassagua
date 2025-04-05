import './globals.css'

export const metadata = {
  title: 'Barbearia',
  description: 'Agendamento de serviços de barbearia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

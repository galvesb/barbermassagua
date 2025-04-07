import './globals.css'

export const metadata = {
  title: 'Barbearia',
  description: 'Agendamento de serviços de barbearia',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-screen">
        <div className="w-full h-full bg-[#1f1f29] text-white flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}

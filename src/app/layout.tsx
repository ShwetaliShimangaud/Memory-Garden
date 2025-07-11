import './globals.css'
import { Inter } from 'next/font/google'
import 'react-datepicker/dist/react-datepicker.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = { title: 'I Remember', description: 'Private memory garden' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

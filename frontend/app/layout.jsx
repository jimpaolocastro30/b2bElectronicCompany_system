import './globals.css'
import { AuthProvider } from './auth/AuthProvider'

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME || 'Energy B2B'} Portal`,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

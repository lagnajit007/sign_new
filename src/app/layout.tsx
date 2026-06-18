import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import ClientWrapper from '@/components/ClientWrapper'

// Initialize the Inter font (body)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

// Poppins for headings (friendly, rounded, modern)
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-heading',
})

// Define metadata
export const metadata: Metadata = {
  title: "Sanjog - Sign Language Learning Platform",
  description: "A platform for learning sign language",
  icons: [
    { rel: 'icon', url: '/S-logo.svg' }
  ]
}

// Define viewport
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
}

// This ensures the layout is properly typed
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  const clerkProps = {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? 'pk_test_dummy-key-for-build-only',
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
    afterSignInUrl: "/dashboard",
    afterSignUpUrl: "/dashboard",
    redirectUrl: "/dashboard"
  };

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-bg text-ink">
        <ClientWrapper clerkProps={clerkProps}>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}
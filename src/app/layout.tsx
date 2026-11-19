import "./globals.css"
import "@/components/arc/foundation.css"
import type { Metadata, Viewport } from "next"
import { Geist, Inter, Poppins } from "next/font/google"
import ClientWrapper from '@/components/ClientWrapper'

// Initialize the Inter font (body)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
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
  title: "Sanjog - Learn Sign Language With AI-Powered Real-Time Feedback",
  description: "Practice sign language through your webcam with AI-powered gesture recognition. Get instant feedback, track progress, earn XP, and build communication skills — free and in your browser.",
  icons: [
    { rel: 'icon', url: '/S-logo.svg' }
  ]
}

// Define viewport
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

// This ensures the layout is properly typed
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be configured.');
  }

  const clerkProps = {
    publishableKey,
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
    signInFallbackRedirectUrl: "/dashboard",
    signUpFallbackRedirectUrl: "/dashboard",
    telemetry: false,
  };

  return (
    <html lang="en" data-accent="violet" className={`${geist.variable} ${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-bg text-ink">
        <ClientWrapper clerkProps={clerkProps}>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import { Archivo, Roboto_Mono } from "next/font/google"

import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { SiteFooter } from "@/components/site-footer"
import { SiteNav } from "@/components/site-nav"
import { TooltipProvider } from "@/components/ui/tooltip"

import "./globals.css"

// Both are variable fonts: do not pass a weight list (breaks Vercel's Turbopack font bundler)
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
})

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
})

const siteDescription =
  "US demographics by state and county: non-Hispanic White share over time, religion, 2024 election results, immigration enforcement, and family formation."

export const metadata: Metadata = {
  metadataBase: new URL("https://afmetrics.com"),
  title: {
    default: "afmetrics.com — America by the numbers",
    template: "%s — afmetrics.com",
  },
  description: siteDescription,
  applicationName: "AF Metrics",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AF Metrics",
    title: "afmetrics.com — America by the numbers",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "afmetrics.com — America by the numbers",
    description: siteDescription,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      // Always dark. The light tokens in globals.css exist only for the PDF export.
      className={`dark ${archivo.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TooltipProvider>
          <header className="sticky top-0 z-20 border-t-[3px] border-b border-t-primary border-b-border bg-background/90 backdrop-blur">
            <SiteNav />
          </header>
          <div className="mx-auto w-full max-w-[1100px] px-4 pt-4 sm:px-6">
            <PageBreadcrumb />
          </div>
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </TooltipProvider>
      </body>
    </html>
  )
}

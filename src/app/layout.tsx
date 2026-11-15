import type { Metadata } from "next"
import { Crimson_Pro, Open_Sans } from "next/font/google"

import { InlineScript } from "@/components/inline-script"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { SiteFooter } from "@/components/site-footer"
import { SiteNav } from "@/components/site-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"

import "./globals.css"

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

// Serif for headings and the wordmark. Crimson Pro is a variable font: do not pass a weight
// list (breaks Vercel's Turbopack font bundler).
const crimsonPro = Crimson_Pro({
  variable: "--font-crimson-pro",
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
      className={`${openSans.variable} ${crimsonPro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript
          html={`(function(){try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TooltipProvider>
          <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
            <SiteNav actions={<ThemeToggle />} />
          </header>
          <div className="mx-auto w-full max-w-[1100px] px-4 pt-3 sm:px-6">
            <PageBreadcrumb />
          </div>
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </TooltipProvider>
      </body>
    </html>
  )
}

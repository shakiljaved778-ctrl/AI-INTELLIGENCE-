import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AdBanner } from "@/components/ads/ad-banner";
import { AdFooter } from "@/components/ads/ad-footer";
import { siteConfig } from "@/lib/site";

/**
 * Display serif for headlines — a high-contrast variable editorial face that
 * gives the site a premium "newspaper" voice. Body copy stays on the clean
 * system sans (see globals.css). Self-hosted at build time by next/font, so no
 * runtime font fetch or layout shift.
 */
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "AI news",
    "artificial intelligence",
    "LLM",
    "machine learning",
    "AI models",
    "AI policy",
    "AI research",
  ],
  authors: [{ name: `${siteConfig.name} Staff` }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={display.variable} suppressHydrationWarning>
      {/*
        AD NETWORK LOADER
        =====================================================================
        To enable Google AdSense (or another network), import next/script and
        render its loader here, using strategy="afterInteractive" and the
        loader URL with your publisher id (client=ca-pub-XXXXXXXXXXXXXXXX).
        Then fill in the slot ids on the Ad components (AdBanner, AdRectangle,
        AdInArticle, AdFooter). See components/ads/ad-slot.tsx for the full
        wiring instructions.
      */}
      <body>
        {/* Without JS, scroll-reveal elements never get toggled visible —
            so make sure they show anyway. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            {/* Top banner ad — appears below the nav on every page. */}
            <AdBanner />
            <main className="flex-1">{children}</main>
            {/* Footer banner ad — appears above the footer on every page. */}
            <AdFooter />
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

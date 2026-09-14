import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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

/**
 * Brand face — Space Grotesk, a precise technical grotesque. Carries the
 * Salience wordmark and the uppercase eyebrow/section labels, giving the
 * identity a "signal instrument" feel distinct from the editorial serif.
 */
const brand = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand-sg",
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
  alternates: {
    types: { "application/rss+xml": `${siteConfig.url}/rss.xml` },
  },
  verification: {
    ...(siteConfig.verification.google
      ? { google: siteConfig.verification.google }
      : {}),
    ...(siteConfig.verification.bing
      ? { other: { "msvalidate.01": siteConfig.verification.bing } }
      : {}),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${brand.variable}`}
      suppressHydrationWarning
    >
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
          {/* Privacy-light, zero-config analytics (Vercel dashboard). */}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

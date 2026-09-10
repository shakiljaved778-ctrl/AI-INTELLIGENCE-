import Link from "next/link";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { categories } from "@/lib/categories";
import { siteConfig } from "@/lib/site";

const footerLinks = [
  { title: "About", href: "/about" },
  { title: "Advertise", href: "/advertise" },
  { title: "Contact", href: "/contact" },
  { title: "Privacy", href: "/privacy" },
  { title: "Terms", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-serif text-2xl font-bold tracking-tight">
              {siteConfig.name}
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
            <div id="newsletter" className="mt-4 max-w-md scroll-mt-24">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                The {siteConfig.name} Briefing
              </p>
              <NewsletterSignup />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sections
            </p>
            <ul className="space-y-2 text-sm">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-foreground/80 hover:text-foreground"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Company
            </p>
            <ul className="space-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground/80 hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. {siteConfig.tagline}.
          </p>
          <p>All content is editorial and for demonstration purposes.</p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const FOOTER_SECTIONS = [
  {
    title: "Explore",
    links: [
      { label: "All Services", href: "/explore" },
      { label: "Healthcare", href: "/categories/healthcare" },
      { label: "Dental Care", href: "/categories/dental-care" },
      { label: "Salon & Barber", href: "/categories/salon-barber" },
      { label: "Spa & Wellness", href: "/categories/spa-wellness" },
    ],
  },
  {
    title: "For Businesses",
    links: [
      { label: "List Your Business", href: "/register?role=owner" },
      { label: "Owner Dashboard", href: "/owner/dashboard" },
      { label: "Commission Info", href: "/#faq" },
      { label: "Business Terms", href: "/business-terms" },
    ],
  },
  {
    title: "Help & Company",
    links: [
      { label: "About QueueLess", href: "/about" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cancellation & Refund", href: "/refund-policy" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Footer Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold tracking-wide text-foreground">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-black text-primary-foreground">
                Q
              </span>
            </div>
            <span className="text-sm font-semibold">
              Queue<span className="text-primary">Less</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 QueueLess. All rights reserved.
            This is a development demo.
          </p>
        </div>
      </div>
    </footer>
  );
}

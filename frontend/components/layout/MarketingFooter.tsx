import Link from 'next/link'
import { Truck, Mail, Phone, MapPin } from 'lucide-react'

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Changelog', href: '#' },
]

const companyLinks = [
  { label: 'About Us', href: '#' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers', href: '#' },
  { label: 'Blog', href: '#' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
  { label: 'Data Processing', href: '#' },
]

export function MarketingFooter() {
  return (
    <footer className="bg-foreground text-background/80">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand column */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <Truck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-background">
                TransportAI
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-background/60 max-w-xs">
              Built by a team that spent months in transport offices across Punjab
              watching how bilties actually get processed. We know the pain because
              we sat through it.
            </p>
            <div className="space-y-3 pt-2">
              <a href="mailto:support@transportai.in" className="flex items-center gap-3 text-sm text-background/50 hover:text-background/80 transition-colors group">
                <Mail className="w-4 h-4 text-primary group-hover:text-primary" />
                support@transportai.in
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-3 text-sm text-background/50 hover:text-background/80 transition-colors group">
                <Phone className="w-4 h-4 text-primary group-hover:text-primary" />
                +91 98765 43210
              </a>
              <div className="flex items-start gap-3 text-sm text-background/50">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>SCO 12, Phase 8B, Industrial Area,<br />Mohali, Punjab 160071</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-background/40 mb-4">Product</h4>
              <ul className="space-y-3">
                {productLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-background/60 hover:text-background transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-background/40 mb-4">Company</h4>
              <ul className="space-y-3">
                {companyLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-background/60 hover:text-background transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-background/40 mb-4">Legal</h4>
              <ul className="space-y-3">
                {legalLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-background/60 hover:text-background transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40">
            &copy; {new Date().getFullYear()} TransportAI Technologies Pvt Ltd. All rights reserved.
          </p>
          <p className="text-xs text-background/40">
            Designed & built in Mohali, Punjab 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  )
}

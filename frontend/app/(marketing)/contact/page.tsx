'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, ArrowRight, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

const contactItems = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@transportai.in',
    href: 'mailto:support@transportai.in',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 98765 43210',
    detail: 'Mon–Sat, 9AM–6PM IST',
    href: 'tel:+919876543210',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'SCO 12, Phase 8B, Industrial Area, Mohali, Punjab 160071',
  },
]

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Message sent! We'll get back to you shortly.")
  }

  return (
    <main className="relative pb-24">
      {/* Gradient background wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-primary/[0.04] via-primary/[0.02] to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-28 sm:px-6 lg:px-8">
        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-xl"
        >
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Let&rsquo;s talk.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Whether you&rsquo;re exploring TransportAI for your fleet or need help
            with your account, we&rsquo;re here. Real humans, not chatbots.
          </p>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid gap-12 lg:grid-cols-[1fr_0.65fr] lg:gap-16">
          {/* ———— LEFT: Contact form ———— */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-border shadow-sm">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* First + Last name */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        placeholder="Rajesh"
                        required
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        placeholder="Sharma"
                        required
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="rajesh@yourcompany.in"
                      required
                      autoComplete="email"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone{' '}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <Label htmlFor="company">Company name</Label>
                    <Input
                      id="company"
                      placeholder="Punjab Cargo Services"
                      required
                      autoComplete="organization"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">What&rsquo;s this about?</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Pricing question, demo request, technical issue"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      placeholder="Tell us what you need — we'll figure out the rest."
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-full px-8"
                  >
                    Send message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <p className="text-xs text-muted-foreground pt-1">
                    We typically respond within 4 hours during business days.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* ———— RIGHT: Contact info ———— */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-10"
          >
            {/* Contact details */}
            <div className="space-y-6">
              {contactItems.map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-[18px] w-[18px] text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {item.value}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-foreground">
                        {item.value}
                      </p>
                    )}
                    {item.detail && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sales enquiries card */}
            <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground">
                Onboarding a large team?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                If you&rsquo;re bringing on 10+ users, we offer custom pricing,
                dedicated onboarding, and a named account manager.
              </p>
              <Link
                href="mailto:sales@transportai.in"
                className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
              >
                sales@transportai.in
              </Link>
            </div>

            {/* Office hours */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-display text-sm font-semibold text-foreground">
                  Office hours
                </h3>
              </div>
              <div className="space-y-1.5 pl-6 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Monday – Saturday
                  </span>
                  <span className="font-medium text-foreground">
                    9:00 AM – 6:00 PM IST
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-medium text-foreground">Closed</span>
                </div>
              </div>
              <p className="pl-6 text-xs leading-relaxed text-muted-foreground">
                Emergency support available for Professional and Enterprise
                customers.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

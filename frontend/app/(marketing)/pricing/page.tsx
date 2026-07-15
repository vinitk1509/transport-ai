'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Minus, HelpCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/* ─── Plan data ─── */
const plans = [
  {
    name: 'Starter',
    monthlyPrice: 999,
    yearlyPrice: 833,
    yearlyTotal: 9990,
    description: 'For small operators just getting started',
    highlighted: false,
    cta: 'Start free trial',
    ctaHref: '/signup',
    features: [
      '500 receipts/month',
      '2 team members',
      '5 GB storage',
      'AI extraction',
      'Search & basic filters',
      'Excel/CSV export',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    monthlyPrice: 2999,
    yearlyPrice: 2499,
    yearlyTotal: 29990,
    description: 'For growing fleets that need more power',
    highlighted: true,
    cta: 'Start free trial',
    ctaHref: '/signup',
    features: [
      '5,000 receipts/month',
      '10 team members',
      '50 GB storage',
      'Everything in Starter',
      'Advanced analytics & reports',
      'PDF export',
      'API access',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    yearlyPrice: null,
    yearlyTotal: null,
    description: 'For large operations with custom needs',
    highlighted: false,
    cta: 'Talk to sales',
    ctaHref: '/contact',
    features: [
      'Unlimited receipts',
      'Unlimited team members',
      'Unlimited storage',
      'Everything in Professional',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise option',
    ],
  },
] as const

/* ─── Feature comparison data ─── */
const comparisonCategories = [
  {
    name: 'Usage',
    features: [
      { label: 'Receipts per month', starter: '500', pro: '5,000', enterprise: 'Unlimited' },
      { label: 'Team members', starter: '2', pro: '10', enterprise: 'Unlimited' },
      { label: 'Storage', starter: '5 GB', pro: '50 GB', enterprise: 'Unlimited' },
    ],
  },
  {
    name: 'Core features',
    features: [
      { label: 'AI receipt extraction', starter: true, pro: true, enterprise: true },
      { label: 'Search & filters', starter: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
      { label: 'Analytics & reports', starter: false, pro: true, enterprise: true },
      { label: 'Excel/CSV export', starter: true, pro: true, enterprise: true },
      { label: 'PDF export', starter: false, pro: true, enterprise: true },
    ],
  },
  {
    name: 'Platform',
    features: [
      { label: 'API access', starter: false, pro: true, enterprise: true },
      { label: 'Custom integrations', starter: false, pro: false, enterprise: true },
      { label: 'On-premise deployment', starter: false, pro: false, enterprise: true },
      { label: 'SLA guarantee', starter: false, pro: false, enterprise: true },
    ],
  },
  {
    name: 'Support',
    features: [
      { label: 'Email support', starter: true, pro: true, enterprise: true },
      { label: 'Priority support', starter: false, pro: true, enterprise: true },
      { label: 'Dedicated account manager', starter: false, pro: false, enterprise: true },
    ],
  },
]

/* ─── FAQ data ─── */
const faqs = [
  {
    q: 'What happens when I hit my receipt limit?',
    a: "We'll send you a heads-up at 80%. You can upgrade mid-cycle or wait for the next month. We never delete your data.",
  },
  {
    q: 'Can I switch plans?',
    a: 'Anytime. Upgrades take effect immediately. Downgrades apply at the next billing cycle.',
  },
  {
    q: 'Do you offer discounts for yearly billing?',
    a: 'Yes — you save about 2 months on yearly plans. The toggle above shows you the difference.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'No. Zero. You sign up, you start uploading.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'UPI, credit/debit cards, net banking, and bank transfer for Enterprise plans.',
  },
]

/* ─── Helpers ─── */
function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-primary" />
  if (value === false) return <Minus className="mx-auto h-4 w-4 text-muted-foreground/30" />
  return <span className="text-sm text-foreground">{value}</span>
}

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

/* ─── Page ─── */
export default function PricingPage() {
  const [yearly, setYearly] = useState(false)

  return (
    <main className="pt-28 pb-24 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4 text-balance">
            Simple pricing. No surprises.
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto text-balance">
            Every plan includes a 14-day free trial. No credit card needed to start. Cancel anytime.
          </p>
        </motion.div>

        {/* ── Billing toggle ── */}
        <motion.div
          className="flex items-center justify-center gap-1 mb-14"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="inline-flex items-center rounded-full bg-muted p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-all duration-200',
                !yearly
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-all duration-200',
                yearly
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
            </button>
          </div>
          {yearly && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-2 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1"
            >
              2 months free
            </motion.span>
          )}
        </motion.div>

        {/* ── Pricing cards ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-5 items-start mb-24">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className={cn(
                plan.highlighted && 'lg:scale-[1.03] z-10'
              )}
            >
              <Card
                className={cn(
                  'relative border transition-shadow duration-300',
                  plan.highlighted
                    ? 'ring-2 ring-primary shadow-xl shadow-primary/10 border-primary'
                    : 'border-border hover:shadow-md'
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-0.5 text-xs font-semibold shadow-sm">
                      Most chosen
                    </Badge>
                  </div>
                )}

                <CardContent className="p-7">
                  {/* Plan name & description */}
                  <div className="mb-5">
                    <h2 className="font-display text-xl font-bold text-foreground">{plan.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.monthlyPrice !== null ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-4xl font-bold text-foreground">
                            {formatPrice(yearly ? plan.yearlyPrice : plan.monthlyPrice)}
                          </span>
                          <span className="text-muted-foreground text-sm">/mo</span>
                        </div>
                        {yearly && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(plan.monthlyPrice)}/mo
                            </span>
                            <span className="text-xs text-primary font-medium">
                              Billed {formatPrice(plan.yearlyTotal!)}/yr
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold text-foreground">Custom</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full mb-7"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={plan.ctaHref}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Feature comparison table ── */}
        <motion.section
          className="mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground tracking-tight mb-2">
              Compare every feature
            </h2>
            <p className="text-muted-foreground">
              Side-by-side breakdown so you know exactly what you get.
            </p>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[640px] text-sm">
              {/* Sticky header */}
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 pr-4 text-left font-medium text-muted-foreground w-[40%]" />
                  <th className="py-4 px-4 text-center font-semibold text-foreground w-[20%]">Starter</th>
                  <th className="py-4 px-4 text-center w-[20%]">
                    <span className="font-semibold text-primary">Professional</span>
                  </th>
                  <th className="py-4 pl-4 text-center font-semibold text-foreground w-[20%]">Enterprise</th>
                </tr>
              </thead>

              <tbody>
                {comparisonCategories.map((category) => (
                  <>
                    <tr key={`cat-${category.name}`}>
                      <td
                        colSpan={4}
                        className="pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {category.name}
                      </td>
                    </tr>
                    {category.features.map((feat) => (
                      <tr key={feat.label} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4 text-foreground/80">{feat.label}</td>
                        <td className="py-3 px-4 text-center">
                          <ComparisonCell value={feat.starter} />
                        </td>
                        <td className="py-3 px-4 text-center bg-primary/[0.02]">
                          <ComparisonCell value={feat.pro} />
                        </td>
                        <td className="py-3 pl-4 text-center">
                          <ComparisonCell value={feat.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* ── FAQ ── */}
        <motion.section
          className="mb-24 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground tracking-tight">
              Billing questions
            </h2>
          </div>

          <div className="space-y-0 divide-y divide-border rounded-xl border border-border overflow-hidden">
            {faqs.map((faq) => (
              <details key={faq.q} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-sm font-medium text-foreground select-none transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden list-none">
                  <span>{faq.q}</span>
                  <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </motion.section>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent overflow-hidden">
            <CardContent className="py-14 px-8 text-center relative">
              {/* Subtle decorative element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="relative z-10">
                <Zap className="mx-auto mb-4 h-8 w-8 text-primary" />
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  Not sure which plan fits?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We&apos;ll help you figure it out. No sales pitch — just an honest conversation about what your operation needs.
                </p>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">
                    Talk to our team
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </main>
  )
}

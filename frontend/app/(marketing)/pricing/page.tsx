import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const plans = [
  {
    name: 'Starter',
    price: '₹999',
    period: '/month',
    description: 'Perfect for small transport operators',
    receipts: '500 receipts/month',
    users: '2 users',
    storage: '5 GB storage',
    popular: false,
    features: [
      { label: 'AI receipt extraction', included: true },
      { label: 'Smart search', included: true },
      { label: 'Basic analytics', included: true },
      { label: 'Excel/CSV export', included: true },
      { label: 'Email support', included: true },
      { label: 'Advanced reports', included: false },
      { label: 'PDF export', included: false },
      { label: 'API access', included: false },
      { label: 'Custom integrations', included: false },
    ],
  },
  {
    name: 'Professional',
    price: '₹2,999',
    period: '/month',
    description: 'For growing logistics companies',
    receipts: '5,000 receipts/month',
    users: '10 users',
    storage: '50 GB storage',
    popular: true,
    features: [
      { label: 'AI receipt extraction', included: true },
      { label: 'Smart search', included: true },
      { label: 'Advanced analytics', included: true },
      { label: 'Excel/CSV/PDF export', included: true },
      { label: 'Priority email + chat support', included: true },
      { label: 'Advanced reports', included: true },
      { label: 'PDF export', included: true },
      { label: 'API access', included: true },
      { label: 'Custom integrations', included: false },
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large fleets and multi-branch operations',
    receipts: 'Unlimited receipts',
    users: 'Unlimited users',
    storage: 'Unlimited storage',
    popular: false,
    features: [
      { label: 'AI receipt extraction', included: true },
      { label: 'Smart search', included: true },
      { label: 'Custom analytics', included: true },
      { label: 'All export formats', included: true },
      { label: 'Dedicated account manager', included: true },
      { label: 'Advanced reports', included: true },
      { label: 'PDF export', included: true },
      { label: 'API access', included: true },
      { label: 'Custom integrations', included: true },
    ],
  },
]

export default function PricingPage() {
  return (
    <main className="pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Pricing</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            All plans include a 14-day free trial. No credit card required to start.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border shadow-sm ${plan.popular ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4">Most Popular</Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground mb-6 border-y border-border py-4">
                  <p className="font-medium text-foreground">{plan.receipts}</p>
                  <p>{plan.users}</p>
                  <p>{plan.storage}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-3 text-sm">
                      {f.included ? (
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={f.included ? 'text-foreground' : 'text-muted-foreground/60'}>{f.label}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} asChild>
                  <Link href={plan.name === 'Enterprise' ? '/contact' : '/signup'}>
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-14 text-center bg-muted/30 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-foreground mb-2">Not sure which plan is right for you?</h3>
          <p className="text-sm text-muted-foreground mb-4">Our team is happy to walk you through the options.</p>
          <Button variant="outline" asChild>
            <Link href="/contact">Talk to our team</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

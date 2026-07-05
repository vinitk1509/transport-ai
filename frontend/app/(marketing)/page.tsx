import Link from 'next/link'
import { ArrowRight, CheckCircle, Cloud, Search, BarChart3, Users, FileSpreadsheet, ShieldCheck, ChevronDown, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Zap,
    title: 'AI Receipt Extraction',
    desc: 'Our AI reads handwritten and printed receipts instantly, extracting consignor, consignee, amount, and route data with up to 99% accuracy.',
  },
  {
    icon: Search,
    title: 'Smart Search',
    desc: 'Find any receipt in seconds. Search by consignor name, city, date range, or amount — across thousands of records.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Excel & PDF Export',
    desc: 'Export filtered data to Excel, CSV, or PDF with one click. Perfectly formatted for your accountant or auditor.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Visual insights into upload trends, revenue by route, top consignors, and monthly comparisons.',
  },
  {
    icon: Users,
    title: 'Multi-User Access',
    desc: 'Admin, Manager, and Operator roles with granular permissions. Your team, your rules.',
  },
  {
    icon: Cloud,
    title: 'Secure Cloud Storage',
    desc: 'All receipts are stored securely in the cloud with AES-256 encryption, accessible from any device.',
  },
]

const steps = [
  { num: '01', title: 'Upload a Receipt', desc: 'Drag & drop, take a photo on mobile, or bulk-upload multiple files at once.' },
  { num: '02', title: 'AI Extracts Data', desc: 'Our model reads the receipt and fills in consignor, consignee, route, amount, and more.' },
  { num: '03', title: 'Review & Approve', desc: 'Check AI-extracted fields with confidence scores. Edit if needed, then approve in one click.' },
  { num: '04', title: 'Search & Export', desc: 'Your data is instantly searchable and exportable for accounting, audits, and analytics.' },
]

const testimonials = [
  {
    name: 'Harpreet Singh',
    role: 'Owner, Punjab Cargo Services',
    text: 'We used to spend 3 hours daily entering receipts. TransportAI cut that to 20 minutes. The AI accuracy is genuinely impressive for handwritten Punjabi receipts.',
    rating: 5,
  },
  {
    name: 'Meena Agarwal',
    role: 'Finance Manager, Delhi Freight Co',
    text: "The search and export features alone are worth it. I can pull any receipt from the past two years in seconds. Our CA loves the audit trail.",
    rating: 5,
  },
  {
    name: 'Ranjit Dhaliwal',
    role: 'Director, Ludhiana Logistics Ltd',
    text: 'Rolled out to 8 operators in a week. The role permissions mean I can trust the team with data entry without worrying about deletions.',
    rating: 5,
  },
]

const faqs = [
  { q: 'Does it work with handwritten receipts?', a: 'Yes. Our AI model is specifically trained on Indian transport receipts, including handwritten Punjabi, Hindi, and English text.' },
  { q: 'How secure is my data?', a: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are hosted on Indian cloud infrastructure.' },
  { q: 'Can I import my existing data?', a: 'Yes. We support bulk import via CSV and can help migrate from Excel or other systems during onboarding.' },
  { q: 'What happens if the AI makes a mistake?', a: 'Every extracted field shows a confidence score. Low-confidence fields are highlighted for manual review before approval.' },
  { q: 'Do I need to install anything?', a: 'No. TransportAI is fully web-based. It works on any browser and has a mobile-optimised view for on-the-go uploads.' },
]

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            AI-Powered for Indian Transport Businesses
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance mb-6">
            Turn Transport Receipts Into<br className="hidden sm:block" />
            <span className="text-primary"> Digital Records in Seconds</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10 text-pretty">
            Upload a receipt, let AI extract the data, review in one click — your entire
            {"fleet's"} paperwork, searchable forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/signup">
                Start Free Trial — No Credit Card
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/dashboard">See Live Demo</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">14-day free trial · No setup fee · Cancel anytime</p>
        </div>

        {/* Animated receipt flow */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-3 gap-4">
            {/* Step 1: Paper receipt */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm text-center">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📄</span>
              </div>
              <p className="text-xs font-semibold text-foreground mb-1">Paper Receipt</p>
              <div className="space-y-1.5 mt-3">
                <div className="h-2 bg-muted rounded-full w-full" />
                <div className="h-2 bg-muted rounded-full w-4/5" />
                <div className="h-2 bg-muted rounded-full w-3/5" />
                <div className="h-2 bg-muted rounded-full w-4/5" />
              </div>
            </div>

            {/* Step 2: AI processing */}
            <div className="bg-primary rounded-xl p-5 shadow-sm text-center">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-semibold text-white mb-1">AI Processing</p>
              <div className="space-y-1.5 mt-3">
                <div className="h-2 bg-white/30 rounded-full w-full animate-pulse" />
                <div className="h-2 bg-white/20 rounded-full w-4/5 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="h-2 bg-white/30 rounded-full w-3/5 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>

            {/* Step 3: Clean data */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xs font-semibold text-foreground mb-1 text-center">Clean Record</p>
              <div className="space-y-1.5 mt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From</span>
                  <span className="font-mono font-medium">Amritsar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-mono font-medium">Kotkapura</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono font-medium text-primary">₹4,250</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-border bg-muted/30 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6">Trusted by transport businesses across Punjab & beyond</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { num: '50,000+', label: 'Receipts Processed' },
              { num: '200+', label: 'Active Businesses' },
              { num: '99.2%', label: 'AI Accuracy' },
              { num: '4.9/5', label: 'Customer Rating' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-primary">{s.num}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Features</Badge>
            <h2 className="text-3xl font-bold text-foreground text-balance">Everything your operations team needs</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Built specifically for Indian freight and transport companies managing high volumes of paper receipts.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">How It Works</Badge>
            <h2 className="text-3xl font-bold text-foreground">From paper to database in 4 steps</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-sm font-bold text-primary-foreground">{s.num}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Pricing</Badge>
            <h2 className="text-3xl font-bold text-foreground">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mt-3">Start free, scale as your business grows</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { plan: 'Starter', price: '₹999', period: '/mo', receipts: '500/mo', users: '2 users', highlight: false },
              { plan: 'Professional', price: '₹2,999', period: '/mo', receipts: '5,000/mo', users: '10 users', highlight: true },
              { plan: 'Enterprise', price: 'Custom', period: '', receipts: 'Unlimited', users: 'Unlimited', highlight: false },
            ].map((p) => (
              <Card key={p.plan} className={`relative border shadow-sm ${p.highlight ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-foreground mb-2">{p.plan}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">{p.price}</span>
                    <span className="text-muted-foreground text-sm">{p.period}</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground mb-6">
                    <p>{p.receipts}</p>
                    <p>{p.users}</p>
                  </div>
                  <Button className="w-full" variant={p.highlight ? 'default' : 'outline'} asChild>
                    <Link href="/pricing">
                      {p.plan === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Testimonials</Badge>
            <h2 className="text-3xl font-bold text-foreground">Loved by transport operators</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">FAQ</Badge>
            <h2 className="text-3xl font-bold text-foreground">Common questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group border border-border rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-foreground text-sm hover:bg-muted/50 transition-colors list-none">
                  {f.q}
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border bg-muted/20">
                  <p className="pt-4">{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary rounded-2xl p-10 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4 text-balance">
              Ready to digitise your transport receipts?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join 200+ transport businesses already saving hours every day. Start your free 14-day trial — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

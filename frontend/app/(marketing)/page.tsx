'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Camera,
  Search,
  FileSpreadsheet,
  BarChart3,
  Users,
  Cloud,
  ChevronDown,
  Star,
  CheckCircle,
  Play,
  ScanLine,
  ShieldCheck,
  Phone,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/* ─── animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

/* ─── data ─── */
const stats = [
  { value: '12,000+', label: 'bilties processed' },
  { value: '180+', label: 'transport companies' },
  { value: '98.7%', label: 'read accuracy' },
  { value: '< 4 sec', label: 'per receipt' },
]

const features = [
  {
    icon: ScanLine,
    title: 'Receipt Extraction',
    desc: 'Upload a photo of any bilty — printed or handwritten, Hindi or English — and watch it turn into structured data. GR number, consignor, consignee, origin, destination, freight charges. All pulled out automatically.',
    large: true,
    preview: true,
  },
  {
    icon: Search,
    title: 'Smart Search',
    desc: 'Find any receipt from the last 3 years by typing a name, city, date range, or amount. Results in under a second.',
    large: false,
    preview: false,
  },
  {
    icon: FileSpreadsheet,
    title: 'Export Tools',
    desc: 'One-click Excel, CSV, and PDF exports. Filters carry over so your CA gets exactly what they asked for.',
    large: false,
    preview: false,
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Revenue by route, top consignors, monthly upload trends, average freight per destination. Real numbers, not vanity metrics. Exportable charts your management team will actually read.',
    large: true,
    preview: true,
  },
  {
    icon: Users,
    title: 'Team Roles',
    desc: 'Admin, Manager, and Operator roles with proper permissions. Operators upload, managers review, admins see everything.',
    large: false,
    preview: false,
  },
  {
    icon: Cloud,
    title: 'Cloud Storage',
    desc: 'Every receipt stored with AES-256 encryption. Access them from any device, anywhere. No more lost papers.',
    large: false,
    preview: false,
  },
]

const timelineSteps = [
  {
    num: '01',
    title: 'Snap or upload',
    desc: 'Take a photo on your phone or drag files from your desktop. We handle JPG, PNG, and even slightly crumpled ones.',
  },
  {
    num: '02',
    title: 'AI reads the receipt',
    desc: 'Our model was trained specifically on Indian bilties — handwritten Hindi, Punjabi, English. It picks out every field.',
  },
  {
    num: '03',
    title: 'You verify',
    desc: 'Each field shows a confidence score. Green means the AI is sure. Amber means you should double-check. Takes 10 seconds.',
  },
  {
    num: '04',
    title: 'Done. Search it, export it, forget about it.',
    desc: 'Your receipt lives in the cloud now. Pull it up anytime by consignor, city, date, or amount.',
  },
]

const testimonials = {
  featured: {
    name: 'Harpreet Singh',
    initials: 'HS',
    role: 'Owner at Sarhad Transport, Amritsar',
    text: 'We were burning 3 hours daily on data entry. Now my operator uploads photos during chai break and everything\u2019s in the system before lunch. The handwriting recognition is surprisingly good — even my driver\u2019s scribbles.',
    rating: 5,
    color: 'bg-indigo-600',
  },
  right: [
    {
      name: 'Meena Patel',
      initials: 'MP',
      role: 'Finance Head at Delhivery Partners',
      text: 'I can pull any bilty from the last 18 months in under 5 seconds. Our CA actually smiled during the last audit.',
      rating: 5,
      color: 'bg-emerald-600',
    },
    {
      name: 'Ranjit Dhaliwal',
      initials: 'RD',
      role: 'Director, Ludhiana Cargo Co.',
      text: 'Rolled it out to 8 operators across 3 branches. The permission system means I sleep easy.',
      rating: 5,
      color: 'bg-amber-600',
    },
  ],
}

const plans = [
  {
    name: 'Starter',
    price: '₹999',
    period: '/mo',
    bullets: ['Up to 500 receipts/month', '2 team members', 'Excel & CSV export'],
    highlight: false,
    cta: 'Start free trial',
  },
  {
    name: 'Professional',
    price: '₹2,999',
    period: '/mo',
    bullets: ['Up to 5,000 receipts/month', '10 team members', 'Analytics dashboard + PDF export'],
    highlight: true,
    cta: 'Start free trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    bullets: ['Unlimited receipts', 'Unlimited users', 'Dedicated onboarding & API access'],
    highlight: false,
    cta: 'Talk to us',
  },
]

const faqs = [
  {
    q: 'Does it work with handwritten receipts?',
    a: 'Yes. Our model was trained on thousands of real Indian transport receipts — handwritten Punjabi, Hindi, and English. It handles messy handwriting, faded ink, and even slightly torn forms. Where it\u2019s unsure, it flags the field for you to review.',
  },
  {
    q: 'How accurate is the extraction?',
    a: 'Across our user base, we average 98.7% field-level accuracy. Every extracted value comes with a confidence score, so you\u2019ll always know which fields might need a second look. Most receipts need zero corrections.',
  },
  {
    q: 'What happens to my data? Is it secure?',
    a: 'All data is encrypted at rest with AES-256 and in transit with TLS 1.3. We host on Indian cloud infrastructure, so your data stays within the country. You can delete any receipt at any time — we don\u2019t keep copies.',
  },
  {
    q: 'Can my whole team use it?',
    a: 'Absolutely. You can invite operators, managers, and admins — each with different permission levels. Operators can upload, managers can review and export, admins control everything. Works well for multi-branch setups.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. TransportAI is fully web-based. Works on Chrome, Safari, Firefox — and the mobile view is optimised for uploading directly from your phone camera. No app store, no downloads.',
  },
]

/* ─── component ─── */
export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 px-4">
        {/* background gradient + grain */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10 grain-overlay -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            {/* ─── left: copy (60%) ─── */}
            <motion.div
              className="lg:col-span-3"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.p
                variants={fadeUp}
                className="text-sm font-medium tracking-wide text-primary/80 uppercase mb-4"
              >
                AI-powered receipt management for Indian transport
              </motion.p>

              <motion.h1
                variants={fadeUp}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-foreground mb-6"
              >
                Stop typing out bilties
                <br className="hidden sm:block" />
                by hand.{' '}
                <span className="text-primary">
                  Let the machine
                  <br className="hidden sm:block" />
                  read them.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-8"
              >
                We built an AI that actually understands handwritten Indian transport receipts.
                Upload a photo, get structured data back in seconds — consignor, destination,
                freight charges, all of it.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full" asChild>
                  <Link href="/signup">
                    Try it free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full" asChild>
                  <Link href="#how-it-works">
                    <Play className="mr-2 h-4 w-4" />
                    Watch it work
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* ─── right: 3D receipt card (40%) ─── */}
            <motion.div
              className="lg:col-span-2 perspective-1200"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="receipt-3d animate-float-slow relative">
                {/* floating match badge */}
                <div className="absolute -top-3 -right-3 z-10">
                  <Badge className="bg-white dark:bg-card shadow-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse-dot" />
                    99.2% match
                  </Badge>
                </div>

                {/* receipt body */}
                <div className="bg-amber-50/80 dark:bg-card border border-amber-200/60 dark:border-border rounded-xl p-6 shadow-2xl max-w-sm mx-auto lg:mx-0">
                  {/* header */}
                  <div className="text-center border-b border-dashed border-amber-300/50 dark:border-border pb-3 mb-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Goods Receipt / Bilty
                    </p>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      GR No: <span className="font-semibold text-foreground">AMR-2025-4471</span>
                    </p>
                  </div>

                  {/* fields */}
                  <div className="space-y-2.5 font-mono text-sm">
                    {[
                      { label: 'Date', value: '12 Mar 2025' },
                      { label: 'From', value: 'Amritsar' },
                      { label: 'To', value: 'Kotkapura' },
                      { label: 'Consignor', value: 'Gurmeet Transport' },
                      { label: 'Amount', value: '₹4,250', highlight: true },
                    ].map((f) => (
                      <div key={f.label} className="flex justify-between items-center">
                        <span className="text-muted-foreground text-xs">{f.label}</span>
                        <span
                          className={cn(
                            'font-semibold',
                            f.highlight ? 'text-primary text-base' : 'text-foreground'
                          )}
                        >
                          {f.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* footer */}
                  <div className="mt-4 pt-3 border-t border-dashed border-amber-300/50 dark:border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                        Verified
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      TransportAI
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SOCIAL PROOF BAR
      ═══════════════════════════════════════════ */}
      <section className="border-y border-border bg-muted/30 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES — BENTO GRID
      ═══════════════════════════════════════════ */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="max-w-2xl mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              What it actually does
            </h2>
            <p className="text-muted-foreground text-lg">
              No filler features. Everything here exists because transport operators asked for it.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className={cn(f.large ? 'sm:col-span-2 lg:col-span-2' : '')}
              >
                <Card
                  className={cn(
                    'glossy-card h-full border-border hover:shadow-lg transition-shadow duration-300',
                    f.large ? 'p-0' : ''
                  )}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 shrink-0">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>

                    {/* mini preview for large cards */}
                    {f.preview && f.title === 'Receipt Extraction' && (
                      <div className="mt-auto bg-muted/50 rounded-lg p-4 border border-border">
                        <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                          {[
                            { field: 'GR No', val: 'AMR-4471', conf: '99%' },
                            { field: 'From', val: 'Amritsar', conf: '98%' },
                            { field: 'Amount', val: '₹4,250', conf: '97%' },
                          ].map((r) => (
                            <div key={r.field} className="space-y-1">
                              <p className="text-muted-foreground">{r.field}</p>
                              <p className="font-semibold text-foreground">{r.val}</p>
                              <p className="text-green-600 dark:text-green-400 text-[10px]">
                                {r.conf}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {f.preview && f.title === 'Analytics Dashboard' && (
                      <div className="mt-auto bg-muted/50 rounded-lg p-4 border border-border">
                        <div className="flex items-end gap-1.5 h-16">
                          {[40, 65, 50, 80, 72, 95, 60, 88].map((h, idx) => (
                            <div
                              key={idx}
                              className="flex-1 bg-primary/20 rounded-t-sm"
                              style={{ height: `${h}%` }}
                            >
                              <div
                                className="w-full bg-primary rounded-t-sm"
                                style={{ height: `${Math.min(h + 10, 100)}%` }}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono">
                          <span>Jan</span>
                          <span>Aug</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — VERTICAL TIMELINE
      ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Paper in, data out. Four steps.
            </h2>
          </motion.div>

          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            {/* vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border hidden sm:block" />

            <div className="space-y-12">
              {timelineSteps.map((step, i) => (
                <motion.div key={step.num} variants={fadeUp} className="flex gap-6 sm:gap-8">
                  {/* number circle */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold font-display z-10 relative">
                      {step.num}
                    </div>
                  </div>

                  {/* content */}
                  <div className="pb-2">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            Don&rsquo;t take our word for it
          </motion.h2>

          <motion.div
            className="grid lg:grid-cols-5 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            {/* featured — left 60% */}
            <motion.div variants={fadeUp} className="lg:col-span-3">
              <Card className="h-full border-border">
                <CardContent className="p-8 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex gap-0.5 mb-5">
                      {Array.from({ length: testimonials.featured.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-lg leading-relaxed text-foreground mb-8">
                      &ldquo;{testimonials.featured.text}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0',
                        testimonials.featured.color
                      )}
                    >
                      {testimonials.featured.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {testimonials.featured.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonials.featured.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* right stack 40% */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {testimonials.right.map((t) => (
                <motion.div key={t.name} variants={fadeUp}>
                  <Card className="border-border h-full">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex gap-0.5 mb-4">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <p className="text-sm leading-relaxed text-foreground mb-5">
                          &ldquo;{t.text}&rdquo;
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0',
                            t.color
                          )}
                        >
                          {t.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRICING PREVIEW
      ═══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Plans that grow with your fleet
            </h2>
            <p className="text-muted-foreground text-lg">
              Start free. No credit card. Upgrade when you&rsquo;re ready.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-3 gap-6 items-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            {plans.map((p) => (
              <motion.div
                key={p.name}
                variants={fadeUp}
                className={cn(p.highlight && 'scale-[1.02]')}
              >
                <Card
                  className={cn(
                    'relative border shadow-sm transition-shadow duration-300',
                    p.highlight
                      ? 'ring-2 ring-primary shadow-xl border-primary'
                      : 'border-border hover:shadow-md'
                  )}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-sm">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-7 text-center">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      {p.name}
                    </h3>
                    <div className="mb-5">
                      <span className="text-4xl font-bold text-foreground font-display">
                        {p.price}
                      </span>
                      {p.period && (
                        <span className="text-muted-foreground text-sm">{p.period}</span>
                      )}
                    </div>

                    <ul className="space-y-2.5 text-sm text-muted-foreground mb-7 text-left">
                      {p.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={p.highlight ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href={p.name === 'Enterprise' ? '/contact' : '/signup'}>
                        {p.cta}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            Quick answers
          </motion.h2>

          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            {faqs.map((f) => (
              <motion.details
                key={f.q}
                variants={fadeUp}
                className="group border border-border rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-foreground text-sm hover:bg-muted/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border bg-muted/20">
                  <p className="pt-4">{f.a}</p>
                </div>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[linear-gradient(135deg,oklch(0.50_0.20_270),oklch(0.45_0.18_270)_50%,oklch(0.38_0.20_280))]">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5"
          >
            Your receipts are piling up.
            <br />
            We can help.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-white/80 mb-9 max-w-xl mx-auto"
          >
            Start your 14-day trial. Takes 2 minutes to set up, nothing to install.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="rounded-full bg-white text-foreground hover:bg-white/90" asChild>
              <Link href="/signup">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/contact">
                <Phone className="mr-2 h-4 w-4" />
                Talk to our team
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}

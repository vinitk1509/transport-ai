'use client'

import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Message sent! Our team will get back to you within 24 hours.')
  }

  return (
    <main className="pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Contact</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">Get in touch</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Have questions about TransportAI? Our team is ready to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Form */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <h2 className="font-semibold text-foreground mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fname">First name</Label>
                    <Input id="fname" placeholder="Rajesh" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lname">Last name</Label>
                    <Input id="lname" placeholder="Sharma" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="rajesh@yourcompany.in" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" type="tel" placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company name</Label>
                  <Input id="company" placeholder="Punjab Cargo Services" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    placeholder="Tell us how we can help..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-foreground mb-4">Contact information</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'Email', value: 'support@transportai.in' },
                  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                  { icon: MapPin, label: 'Address', value: 'SCO 12, Phase 8, Industrial Area, Mohali, Punjab 160071' },
                ].map((c) => (
                  <div key={c.label} className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <c.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{c.label}</p>
                      <p className="text-sm text-foreground">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Live chat support</p>
                  <p className="text-sm text-muted-foreground">Available Monday–Saturday, 9 AM to 6 PM IST</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
              <h3 className="font-semibold text-foreground text-sm mb-2">Sales enquiries</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Looking to onboard your entire fleet? We offer custom pricing and dedicated onboarding for companies with 10+ users.
              </p>
              <p className="text-sm text-primary mt-2 font-medium">sales@transportai.in</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

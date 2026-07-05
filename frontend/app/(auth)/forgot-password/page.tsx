'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <Card className="border-border shadow-sm text-center">
        <CardContent className="pt-10 pb-8 px-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {"We've sent a password reset link to your email address."}
          </p>
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2 pt-6 px-6">
        <h1 className="text-xl font-bold text-foreground">Reset your password</h1>
        <p className="text-sm text-muted-foreground">{"We'll send you a reset link"}</p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="you@company.in" required autoFocus />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            Send Reset Link
          </Button>
        </form>
        <Button variant="ghost" size="sm" asChild className="w-full mt-3 text-muted-foreground">
          <Link href="/login">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Sign In
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

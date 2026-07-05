'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Check, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [enteredCode, setEnteredCode] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const sendVerificationCode = async () => {
    if (!email.trim()) {
      toast.error('Enter your work email first')
      return
    }
    try {
      const response = await api.requestVerification(email)
      setCodeSent(true)
      setEmailVerified(false)
      toast.success(response.message)
    } catch {
      toast.error('Could not send verification code')
    }
  }

  const verifyEmail = () => {
    if (enteredCode.trim().length !== 6) {
      toast.error('Enter the 6-digit verification code')
      return
    }
    setEmailVerified(true)
    toast.success('Email verified')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setLoading(true)
    try {
      if (!emailVerified) {
        toast.error('Please verify your email before creating an account')
        return
      }
      await signup({
        firstName: fd.get('fname') as string,
        lastName: fd.get('lname') as string,
        company: fd.get('company') as string,
        email: fd.get('email') as string,
        password: fd.get('password') as string,
        code: enteredCode,
      })
      toast.success('Account created! Welcome to TransportAI.')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2 pt-6 px-6">
        <h1 className="text-xl font-bold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground">14-day free trial, no credit card required</p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fname">First name</Label>
              <Input id="fname" name="fname" placeholder="Rajesh" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lname">Last name</Label>
              <Input id="lname" name="lname" placeholder="Sharma" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Company name</Label>
            <Input id="company" name="company" placeholder="Punjab Cargo Services" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.in"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailVerified(false)
                  setCodeSent(false)
                }}
              />
              <Button type="button" variant="outline" onClick={sendVerificationCode}>
                Send code
              </Button>
            </div>
          </div>
          {codeSent && (
            <div className="space-y-1.5 rounded-lg border border-border p-3">
              <Label htmlFor="verification">Email verification code</Label>
              <div className="flex gap-2">
                <Input
                  id="verification"
                  inputMode="numeric"
                  maxLength={6}
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  placeholder="6-digit code"
                  disabled={emailVerified}
                />
                <Button type="button" variant={emailVerified ? 'secondary' : 'default'} onClick={verifyEmail} disabled={emailVerified}>
                  <MailCheck className="w-4 h-4 mr-2" />
                  {emailVerified ? 'Verified' : 'Verify'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Check your inbox for the 6-digit code. It expires in 10 minutes.
              </p>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="8+ characters"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !emailVerified}>
            {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            Create Free Account
          </Button>
        </form>

        <ul className="mt-4 space-y-1.5">
          {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((t) => (
            <li key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="w-3.5 h-3.5 text-green-500" />
              {t}
            </li>
          ))}
        </ul>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

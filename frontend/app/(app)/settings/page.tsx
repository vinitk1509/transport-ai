'use client'

import { useState } from 'react'
import { Building2, Shield, Save, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [company, setCompany] = useState({
    name: user?.company ?? '',
    email: user?.email ?? '',
  })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

  const handleSaveCompany = () => {
    toast.info('Profile update API is not connected yet.')
  }

  const handleSavePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('Please fill all password fields')
      return
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }
    toast.info('Password update API is not connected yet.')
    setPasswords({ current: '', new: '', confirm: '' })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage account details available from your profile</p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="company" className="gap-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5" />Company
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5" />Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Company Profile</CardTitle>
              <CardDescription>Only stored account fields are shown here. No placeholder profile data is used.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Account Email</Label>
                  <Input id="email" type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
                </div>
              </div>

              <Separator />

              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                Profile persistence is not connected yet. Changes here are intentionally not faked as saved server data.
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveCompany}>
                  <Save className="w-4 h-4 mr-2" />Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Password update will be enabled after the backend endpoint is connected</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'current', label: 'Current Password' },
                { key: 'new', label: 'New Password' },
                { key: 'confirm', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={passwords[key as keyof typeof passwords]}
                      onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={handleSavePassword}>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

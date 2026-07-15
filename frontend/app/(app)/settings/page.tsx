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
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, Upload, Camera } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRef } from 'react'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [company, setCompany] = useState({
    name: user?.company ?? '',
    email: user?.email ?? '',
  })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      await api.updateAvatar(file)
      await refreshUser()
      toast.success('Profile picture updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile picture')
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false)

  const handleSaveCompany = async () => {
    if (!company.name.trim()) {
      toast.error('Company name is required')
      return
    }
    
    setIsUpdatingCompany(true)
    try {
      await api.updateProfile({ company: company.name.trim() })
      await refreshUser()
      toast.success('Company profile updated successfully')
    } catch (e: any) {
      toast.error(e.message || 'Failed to update company profile')
    } finally {
      setIsUpdatingCompany(false)
    }
  }

  const handleSavePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('Please fill all password fields')
      return
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }
    
    setIsUpdatingPassword(true)
    try {
      await api.updatePassword(passwords.current, passwords.new)
      toast.success('Password updated successfully')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (e: any) {
      toast.error(e.message || 'Failed to update password')
    } finally {
      setIsUpdatingPassword(false)
    }
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

        <TabsContent value="company" className="mt-6 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Company Profile</CardTitle>
              <CardDescription>Only stored account fields are shown here. No placeholder profile data is used.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6 pb-2">
                <Avatar className="w-20 h-20 border bg-primary">
                  {user?.avatar?.includes('/') ? (
                    <AvatarImage src={user.avatar.replace('/api/v1', '/api/proxy')} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {user?.avatar && !user.avatar.includes('/') ? user.avatar : (user?.name?.slice(0, 2).toUpperCase() || '--')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="mr-2 h-4 w-4" />
                    )}
                    Upload new picture
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. 5MB max.</p>
                </div>
              </div>
              <Separator />
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

              <div className="flex justify-end">
                <Button onClick={handleSaveCompany} disabled={isUpdatingCompany}>
                  {isUpdatingCompany && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className={isUpdatingCompany ? "hidden" : "w-4 h-4 mr-2"} />Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
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
                <Button onClick={handleSavePassword} disabled={isUpdatingPassword}>
                  {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

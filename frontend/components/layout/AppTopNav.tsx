'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, LogOut, Settings, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function AppTopNav() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <>
      <header className="h-14 bg-background border-b border-border flex items-center px-4 gap-4 shrink-0">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search receipts, consignors, routes..."
              className="pl-8 h-8 text-sm bg-muted border-0 focus-visible:ring-1"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 ml-auto">


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
                <Avatar className="w-6 h-6 border bg-primary">
                  {user?.avatar?.includes('/') ? (
                    <AvatarImage src={`http://localhost:8080${user.avatar}`} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="text-[10px] font-bold bg-primary text-primary-foreground">
                    {user?.avatar && !user.avatar.includes('/') ? user.avatar : (user?.name?.slice(0, 2).toUpperCase() || '--')}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">{user?.name?.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>


    </>
  )
}

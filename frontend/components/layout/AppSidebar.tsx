'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Receipt, Upload, Search, BarChart3, Settings,
  Bell, ChevronLeft, ChevronRight, Truck, FileText, TrendingUp, Route,
  CalendarDays, LogOut, Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, usePermission } from '@/lib/auth-context'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'All Receipts', href: '/receipts', icon: Receipt },
  { label: 'Upload', href: '/receipts/upload', icon: Upload },
  { label: 'Search', href: '/search', icon: Search },
  {
    label: 'Reports',
    icon: BarChart3,
    children: [
      { label: 'Daily', href: '/reports/daily', icon: CalendarDays },
      { label: 'Monthly', href: '/reports/monthly', icon: FileText },
      { label: 'Yearly', href: '/reports/yearly', icon: BarChart3 },

    ],
  },
  { label: 'Settings', href: '/settings', icon: Settings, adminOnly: true },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { canManageUsers, canBilling } = usePermission()
  const [collapsed, setCollapsed] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(pathname.startsWith('/reports'))

  return (
    <aside className={cn(
      'hidden md:flex flex-col h-screen sticky top-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center h-14 px-4 border-b border-sidebar-border', collapsed ? 'justify-center' : 'gap-3')}>
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
          <Truck className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-sm text-sidebar-foreground">TransportAI</span>}
      </div>

      {/* Company switcher */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <div className="rounded-lg bg-sidebar-accent px-3 py-2">
            <p className="text-xs text-sidebar-foreground/70">Company</p>
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.company || 'No company set'}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          if (item.adminOnly && !canManageUsers && !canBilling) return null

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => !collapsed && setReportsOpen(!reportsOpen)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                    pathname.startsWith('/reports') && 'bg-sidebar-accent text-sidebar-foreground',
                    collapsed && 'justify-center'
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', reportsOpen && 'rotate-90')} />
                    </>
                  )}
                </button>
                {reportsOpen && !collapsed && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors',
                          pathname === child.href
                            ? 'bg-primary/20 text-sidebar-foreground font-medium'
                            : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                      >
                        <child.icon className="w-3.5 h-3.5" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-1">
            <Avatar className="w-8 h-8 shrink-0 border bg-primary">
              {user?.avatar?.includes('/') ? (
                <AvatarImage src={user.avatar.replace('/api/v1', '/api/proxy')} alt={user.name} />
              ) : null}
              <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                {user?.avatar && !user.avatar.includes('/') ? user.avatar : (user?.name?.slice(0, 2).toUpperCase() || '--')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name || 'No name set'}</p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5 bg-sidebar-accent text-sidebar-foreground/70 border-0">
                {user?.role || 'No role'}
              </Badge>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && 'Sign Out'}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}

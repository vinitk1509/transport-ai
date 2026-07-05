'use client'

import { useEffect, useRef } from 'react'
import { Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/20" />}
      <div
        ref={ref}
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-80 bg-background border-l border-border shadow-xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Notifications</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-57px)]">
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <Bell className="mb-3 h-9 w-9 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No notifications yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Important upload, approval, and export events will appear here when notification tracking is enabled.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

'use client'

import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All caught up</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
        <Bell className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="font-medium text-foreground">No notifications yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Upload, approval, export, and account events will appear here after notification tracking is connected.
        </p>
      </div>
    </div>
  )
}

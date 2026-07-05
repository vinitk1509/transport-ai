import Link from 'next/link'
import { Truck } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Truck className="w-4 h-4 text-primary-foreground" />
        </div>
        TransportAI
      </Link>
      <div className="w-full max-w-sm">
        {children}
      </div>
      <p className="text-xs text-muted-foreground mt-8">
        &copy; {new Date().getFullYear()} TransportAI Technologies Pvt Ltd
      </p>
    </div>
  )
}

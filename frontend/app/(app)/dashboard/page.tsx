'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Download,
  FileCheck,
  FileText,
  Loader2,
  Package,
  Upload,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { api, BackendReceipt } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [receipts, setReceipts] = useState<BackendReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    api.getReceipts()
      .then((data) => {
        if (!alive) return
        const sorted = [...data].sort((a, b) => (
          new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
        ))
        setReceipts(sorted)
        setError(null)
      })
      .catch((err) => {
        if (!alive) return
        console.error(err)
        setError('Dashboard could not load receipt data.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  const stats = useMemo(() => {
    const todayKey = new Date().toDateString()
    const totalCharges = receipts.reduce((sum, receipt) => (
      sum + Number(receipt.charges ?? receipt.amount ?? 0)
    ), 0)

    return {
      total: receipts.length,
      todayUploads: receipts.filter((receipt) => (
        receipt.uploadedAt && new Date(receipt.uploadedAt).toDateString() === todayKey
      )).length,
      extractionIssues: receipts.filter((receipt) => Boolean(receipt.rejectionReason)).length,
      totalCharges,
    }
  }, [receipts])

  const recentReceipts = receipts.slice(0, 6)
  const missingRequired = receipts.filter(hasMissingRequiredFields).length
  const usableReceipts = Math.max(stats.total - missingRequired - stats.extractionIssues, 0)
  const usablePercent = stats.total ? Math.round((usableReceipts / stats.total) * 100) : 0

  const downloadAllBilties = async () => {
    try {
      const blob = await api.exportAllReceipts()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'all_bilties.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError('Could not download the bilty Excel sheet.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="sm" variant="outline" onClick={downloadAllBilties}>
            <Download className="w-4 h-4 mr-2" />
            Download Excel
          </Button>
          <Button size="sm" render={<Link href="/receipts/upload" />}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Bilty
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="border-border shadow-sm">
          <CardContent className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your dashboard
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Billties" value={stats.total.toLocaleString('en-IN')} icon={FileText} />
            <MetricCard title="Uploaded Today" value={stats.todayUploads.toLocaleString('en-IN')} icon={Upload} />
            <MetricCard title="Extraction Issues" value={stats.extractionIssues.toLocaleString('en-IN')} icon={AlertCircle} />
            <MetricCard title="Charges Found" value={`Rs ${stats.totalCharges.toLocaleString('en-IN')}`} icon={FileCheck} />
          </div>

          {receipts.length === 0 ? (
            <Card className="border-border shadow-sm">
              <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">No billties uploaded yet</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Your dashboard will show live counts, charges, data quality, and recent uploads after the first bilty is processed.
                </p>
                <Button className="mt-5" render={<Link href="/receipts/upload" />}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload First Bilty
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="border-border shadow-sm lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Data Quality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Ready for export</span>
                      <span className="font-medium text-foreground">{usablePercent}%</span>
                    </div>
                    <Progress value={usablePercent} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <MiniStat label="Ready" value={usableReceipts} tone="text-green-600" />
                    <MiniStat label="Missing" value={missingRequired} tone="text-blue-600" />
                    <MiniStat label="Issues" value={stats.extractionIssues} tone="text-red-600" />
                  </div>
                  <div className="rounded-md border border-border p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{missingRequired}</span> billties still have missing required fields before Excel export.
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm lg:col-span-2">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Recent Uploads</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs" render={<Link href="/receipts" />}>
                    View All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {recentReceipts.map((receipt) => (
                      <Link
                        key={receipt.id}
                        href={`/receipts/${receipt.id}`}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono font-medium text-primary">
                            {receipt.grNumber || receipt.id}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {receipt.consignor || 'Missing consignor'} to {receipt.consignee || 'Missing consignee'}
                          </p>
                        </div>
                        <div className="hidden text-right sm:block">
                          <p className="text-xs font-semibold font-mono text-foreground">
                            Rs {Number(receipt.charges ?? receipt.amount ?? 0).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {receipt.packages || 'Missing'} pkgs
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-md border border-border p-2">
      <p className={cn('text-lg font-semibold', tone)}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function hasMissingRequiredFields(receipt: BackendReceipt) {
  return !receipt.grNumber
    || !receipt.packages
    || !receipt.material
    || !Number(receipt.charges ?? receipt.amount)
    || !receipt.consignee
    || !receipt.consignor
}

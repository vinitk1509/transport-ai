'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Download, FileText, Loader2, PackageCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api, BackendReceipt } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { normalizeStationName, CHART_COLORS, truncateRoute } from '@/lib/report-utils'

const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export default function MonthlyReportPage() {
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth()))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [receipts, setReceipts] = useState<BackendReceipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getReceipts()
      .then(setReceipts)
      .catch(() => toast.error('Could not load monthly report data'))
      .finally(() => setLoading(false))
  }, [])

  const monthReceipts = useMemo(() => receipts.filter((receipt) => {
    if (!receipt.uploadedAt) return false
    const uploadedAt = new Date(receipt.uploadedAt)
    return uploadedAt.getMonth() === Number(month) && uploadedAt.getFullYear() === Number(year)
  }), [month, receipts, year])

  const extractionIssues = monthReceipts.filter((receipt) => Boolean(receipt.rejectionReason)).length
  const complete = monthReceipts.filter((receipt) => !hasMissingRequiredFields(receipt) && !receipt.rejectionReason).length
  const totalCharges = monthReceipts.reduce((sum, receipt) => sum + Number(receipt.charges ?? receipt.amount ?? 0), 0)
  
  const destinations = useMemo(() => getIncomingTraffic(monthReceipts), [monthReceipts])

  const exportMonth = async () => {
    const ids = monthReceipts.map((receipt) => receipt.id)
    if (ids.length === 0) {
      toast.info('No billties to export for this month')
      return
    }
    const blob = await api.exportReceiptsBulk(ids)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `monthly-report-${year}-${Number(month) + 1}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real receipt statistics by month</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={month} onChange={(event) => setMonth(event.target.value)} className="h-8 rounded-lg border border-border bg-card px-3 text-sm">
            {months.map((name, index) => <option key={name} value={String(index)}>{name}</option>)}
          </select>
          <input value={year} onChange={(event) => setYear(event.target.value)} className="h-8 w-24 rounded-lg border border-border bg-card px-3 text-sm" />
          <Button size="sm" variant="outline" onClick={exportMonth}>
            <Download className="w-3.5 h-3.5 mr-1.5" />Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric title="Total Uploads" value={monthReceipts.length.toLocaleString('en-IN')} icon={FileText} />
        <Metric title="Complete" value={complete.toLocaleString('en-IN')} icon={PackageCheck} />
        <Metric title="Extraction Issues" value={extractionIssues.toLocaleString('en-IN')} icon={AlertCircle} />
        <Metric title="Charges" value={`Rs ${totalCharges.toLocaleString('en-IN')}`} icon={FileText} />
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-36 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading report
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Breakdown label="Complete" count={complete} total={monthReceipts.length} tone="text-green-600" bg="bg-green-500/10" />
              <Breakdown label="Missing Fields" count={monthReceipts.length - complete - extractionIssues} total={monthReceipts.length} tone="text-blue-600" bg="bg-blue-500/10" />
              <Breakdown label="Extraction Issues" count={extractionIssues} total={monthReceipts.length} tone="text-red-600" bg="bg-red-500/10" />
              <Breakdown label="Charges" count={totalCharges} total={0} tone="text-primary" bg="bg-primary/10" currency />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {destinations.length === 0 ? (
          <Card className="border-border shadow-sm col-span-full">
            <CardContent className="flex h-72 items-center justify-center text-sm text-muted-foreground">
              No routing data available for this month.
            </CardContent>
          </Card>
        ) : (
          destinations.map((destData) => (
            <Card key={destData.destination} className="border-border shadow-sm flex flex-col">
              <CardHeader className="pb-2 border-b border-border/50 bg-muted/30">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Incoming Packages to {destData.destination}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="h-64 mt-4 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={destData.sources} 
                        dataKey="count" 
                        nameKey="source" 
                        outerRadius={85} 
                        cx="50%"
                        cy="50%"
                        label={({ name, percent }: any) => `${truncateRoute(name || '', 12)} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {destData.sources.map((entry, index) => (
                          <Cell key={entry.source} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any, props: any) => [
                          `${value} Shipments (${props.payload.percentage}%)`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function getIncomingTraffic(receipts: BackendReceipt[]) {
  const destMap = new Map<string, Map<string, number>>()
  receipts.forEach(receipt => {
    const dest = normalizeStationName(receipt.destination)
    const src = normalizeStationName(receipt.source)
    
    if (!destMap.has(dest)) {
      destMap.set(dest, new Map<string, number>())
    }
    const sourceMap = destMap.get(dest)!
    sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1)
  })
  
  const results: { destination: string; sources: { source: string; count: number; percentage: number }[] }[] = []
  
  for (const [dest, sourceMap] of destMap.entries()) {
    const total = Array.from(sourceMap.values()).reduce((a, b) => a + b, 0)
    const sources = Array.from(sourceMap.entries()).map(([src, count]) => ({
      source: src,
      count,
      percentage: Number(((count / total) * 100).toFixed(1))
    })).sort((a, b) => b.count - a.count)
    
    results.push({ destination: dest, sources })
  }
  
  return results.sort((a, b) => {
    const totalA = a.sources.reduce((sum, s) => sum + s.count, 0)
    const totalB = b.sources.reduce((sum, s) => sum + s.count, 0)
    return totalB - totalA
  }).slice(0, 8)
}

function hasMissingRequiredFields(receipt: BackendReceipt) {
  return !receipt.grNumber
    || !receipt.packages
    || !receipt.material
    || !Number(receipt.charges ?? receipt.amount)
    || !receipt.consignee
    || !receipt.consignor
}

function Metric({ title, value, icon: Icon }: { title: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}

function Breakdown({ label, count, total, tone, bg, currency = false }: { label: string; count: number; total: number; tone: string; bg: string; currency?: boolean }) {
  const percent = total ? Math.round((count / total) * 100) : 0
  return (
    <div className={cn('rounded-xl p-4', bg)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-2xl font-bold mt-1', tone)}>{currency ? `Rs ${count.toLocaleString('en-IN')}` : count}</p>
      {!currency && <p className="text-xs text-muted-foreground mt-0.5">{percent}%</p>}
    </div>
  )
}

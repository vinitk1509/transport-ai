'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, FileText, Loader2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api, BackendReceipt } from '@/lib/api'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatRoute, truncateRoute, normalizeStationName } from '@/lib/report-utils'

export default function YearlyReportPage() {
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [receipts, setReceipts] = useState<BackendReceipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getReceipts()
      .then(setReceipts)
      .catch(() => toast.error('Could not load yearly report data'))
      .finally(() => setLoading(false))
  }, [])

  const yearReceipts = useMemo(() => receipts.filter((receipt) => (
    receipt.uploadedAt && new Date(receipt.uploadedAt).getFullYear() === Number(year)
  )), [receipts, year])

  const destinationCharts = useMemo(() => getDestinationCounts(yearReceipts), [yearReceipts])
  const totalRevenue = yearReceipts.reduce((sum, receipt) => sum + Number(receipt.charges ?? receipt.amount ?? 0), 0)

  const exportYear = async () => {
    const ids = yearReceipts.map((receipt) => receipt.id)
    if (ids.length === 0) {
      toast.info('No billties to export for this year')
      return
    }
    const blob = await api.exportReceiptsBulk(ids)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yearly-report-${year}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Yearly Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Station count and revenue for a full year</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={year} onChange={(event) => setYear(event.target.value)} className="h-8 w-24 rounded-lg border border-border bg-card px-3 text-sm" />
          <Button size="sm" variant="outline" onClick={exportYear}>
            <Download className="w-3.5 h-3.5 mr-1.5" />Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric title="Billties" value={yearReceipts.length.toLocaleString('en-IN')} icon={FileText} />
        <Metric title="Revenue" value={`Rs ${totalRevenue.toLocaleString('en-IN')}`} icon={TrendingUp} />
      </div>

      {loading ? (
        <Card className="border-border shadow-sm">
          <CardContent className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />Loading report
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {destinationCharts.length === 0 ? (
            <Card className="border-border shadow-sm">
              <CardContent className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                No route data for this year.
              </CardContent>
            </Card>
          ) : (
            destinationCharts.map((chart) => (
              <div key={chart.destination} className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b pb-2">Destination: {chart.destination}</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  <ChartCard 
                    title="Volume by Source" 
                    rows={chart.sources} 
                    dataKey="count" 
                    empty="No volume data." 
                  />
                  <ChartCard 
                    title="Revenue by Source" 
                    rows={[...chart.sources].sort((a,b) => b.revenue - a.revenue)} 
                    dataKey="revenue" 
                    empty="No revenue data." 
                    currency 
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function getDestinationCounts(receipts: BackendReceipt[]) {
  const destMap = new Map<string, Map<string, { count: number, revenue: number }>>()
  
  receipts.forEach((receipt) => {
    const dest = normalizeStationName(receipt.destination)
    const src = normalizeStationName(receipt.source)
    const amount = Number(receipt.charges ?? receipt.amount ?? 0)
    
    if (!destMap.has(dest)) {
      destMap.set(dest, new Map())
    }
    
    const sourceMap = destMap.get(dest)!
    const current = sourceMap.get(src) ?? { count: 0, revenue: 0 }
    sourceMap.set(src, { count: current.count + 1, revenue: current.revenue + amount })
  })
  
  return Array.from(destMap.entries()).map(([dest, sourceMap]) => {
    const sources = Array.from(sourceMap.entries()).map(([src, data]) => ({
      source: src,
      count: data.count,
      revenue: data.revenue
    })).sort((a, b) => b.count - a.count).slice(0, 10)
    
    const totalCount = sources.reduce((sum, s) => sum + s.count, 0)
    const totalRevenue = sources.reduce((sum, s) => sum + s.revenue, 0)
    
    return {
      destination: dest,
      sources,
      totalCount,
      totalRevenue
    }
  }).sort((a, b) => b.totalCount - a.totalCount).slice(0, 5)
}

function ChartCard({ title, rows, dataKey, empty, currency = false }: {
  title: string
  rows: Array<{ source: string; count: number; revenue: number }>
  dataKey: 'count' | 'revenue'
  empty: string
  currency?: boolean
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{empty}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="source" tick={{ fontSize: 11 }} tickFormatter={(val) => truncateRoute(val, 15)} />
              <YAxis allowDecimals={!currency} tick={{ fontSize: 11 }} />
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [
                  currency 
                    ? `Rs ${Number(props.payload.revenue).toLocaleString('en-IN')} (${props.payload.count} Shipments)` 
                    : `${props.payload.count} Shipments (Rs ${Number(props.payload.revenue).toLocaleString('en-IN')})`,
                  props.payload.source
                ]} 
                labelFormatter={() => ''}
              />
              <Bar dataKey={dataKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

function Metric({ title, value, icon: Icon }: { title: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}

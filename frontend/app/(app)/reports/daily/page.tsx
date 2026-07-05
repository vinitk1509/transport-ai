'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Calendar, Download, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api, BackendReceipt } from '@/lib/api'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatRoute, truncateRoute, normalizeStationName } from '@/lib/report-utils'

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export default function DailyReportPage() {
  const [date, setDate] = useState(todayInputValue())
  const [receipts, setReceipts] = useState<BackendReceipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getReceipts()
      .then(setReceipts)
      .catch(() => toast.error('Could not load daily report data'))
      .finally(() => setLoading(false))
  }, [])

  const dayReceipts = useMemo(() => receipts.filter((receipt) => (
    receipt.uploadedAt && receipt.uploadedAt.slice(0, 10) === date
  )), [date, receipts])

  const totalCharges = dayReceipts.reduce((sum, receipt) => sum + Number(receipt.charges ?? receipt.amount ?? 0), 0)
  const extractionIssues = dayReceipts.filter((receipt) => Boolean(receipt.rejectionReason)).length
  const destinationCharts = useMemo(() => getDestinationCounts(dayReceipts), [dayReceipts])

  const exportDay = async () => {
    const ids = dayReceipts.map((receipt) => receipt.id)
    if (ids.length === 0) {
      toast.info('No billties to export for this day')
      return
    }
    const blob = await api.exportReceiptsBulk(ids)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-report-${date}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real receipt activity for the selected day</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button size="sm" variant="outline" onClick={exportDay}>
            <Download className="w-3.5 h-3.5 mr-1.5" />Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric title="Uploads" value={dayReceipts.length.toLocaleString('en-IN')} icon={Calendar} />
        <Metric title="Extraction Issues" value={extractionIssues.toLocaleString('en-IN')} icon={AlertCircle} />
        <Metric title="Charges" value={`Rs ${totalCharges.toLocaleString('en-IN')}`} icon={FileText} />
      </div>

      <div className={destinationCharts.length > 1 ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "grid gap-4"}>
        {destinationCharts.length === 0 ? (
          <Card className="border-border shadow-sm col-span-full">
            <CardContent className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              No route data for this date.
            </CardContent>
          </Card>
        ) : (
          destinationCharts.map((chart) => (
            <Card key={chart.destination} className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Destination: {chart.destination}</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart.sources}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="source" 
                      tick={{ fontSize: 11 }} 
                      tickFormatter={(val) => truncateRoute(val, 15)} 
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${value} Shipments`,
                        props.payload.source
                      ]}
                      labelFormatter={() => ''}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Billties</CardTitle>
          <span className="text-xs text-muted-foreground">{dayReceipts.length} entries</span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading report
            </div>
          ) : dayReceipts.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No billties were uploaded on this date.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['GR Number', 'Source', 'Destination', 'Packages', 'Charges'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dayReceipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{receipt.grNumber || receipt.id}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{normalizeStationName(receipt.source)}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{normalizeStationName(receipt.destination)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{receipt.packages || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">Rs {Number(receipt.charges ?? receipt.amount ?? 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function getDestinationCounts(receipts: BackendReceipt[]) {
  const destMap = new Map<string, Map<string, number>>()
  
  receipts.forEach((receipt) => {
    const dest = normalizeStationName(receipt.destination)
    const src = normalizeStationName(receipt.source)
    
    if (!destMap.has(dest)) {
      destMap.set(dest, new Map<string, number>())
    }
    
    const sourceMap = destMap.get(dest)!
    sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1)
  })
  
  return Array.from(destMap.entries()).map(([dest, sourceMap]) => {
    const sources = Array.from(sourceMap.entries()).map(([src, count]) => ({
      source: src,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 10)
    
    const total = sources.reduce((sum, s) => sum + s.count, 0)
    
    return {
      destination: dest,
      sources,
      total
    }
  }).sort((a, b) => b.total - a.total).slice(0, 10)
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

'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { api, BackendReceipt } from '@/lib/api'

export default function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [receipt, setReceipt] = useState<BackendReceipt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getReceipt(id).then(r => {
      setReceipt(r)
      setLoading(false)
    }).catch(() => {
      toast.error('Receipt not found')
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Loading receipt...</p>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="font-medium text-foreground">Receipt not found</p>
        <Button className="mt-4" size="sm" asChild>
          <Link href="/receipts">Back to Receipts</Link>
        </Button>
      </div>
    )
  }

  const handleDownload = async () => {
    try {
      const blob = await api.exportReceiptById(receipt.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt_${receipt.grNumber || receipt.id}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch {
      toast.error('Failed to download')
    }
  }

  const rawJson = (() => {
    if (!receipt.extractedJson) return 'No extracted data'
    try {
      return JSON.stringify(JSON.parse(receipt.extractedJson), null, 2)
    } catch {
      return receipt.extractedJson
    }
  })()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/receipts"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-foreground">{receipt.id}</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Uploaded {receipt.uploadedAt ? new Date(receipt.uploadedAt).toLocaleString('en-IN') : '-'} by {receipt.uploadedBy || '-'}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />Download Excel
        </Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Image */}
        <div className="lg:col-span-3">
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-center bg-muted/30 min-h-[400px] rounded-xl p-6">
                {receipt.contentType?.startsWith('image/') ? (
                  <img
                    src={api.receiptFileUrl(receipt.id)}
                    alt={receipt.originalFilename || 'Uploaded bilty'}
                    className="max-w-full max-h-[720px] object-contain"
                  />
                ) : (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 text-gray-800 max-w-xs w-full">
                  <div className="text-center border-b border-gray-200 pb-3 mb-3">
                    <p className="font-bold text-base">{receipt.consignor || 'Unknown Consignor'}</p>
                    <p className="text-xs text-gray-400">Transport Receipt</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{receipt.grNumber || receipt.id}</p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <Row label="GR No." value={receipt.grNumber || '-'} />
                    <Row label="From" value={receipt.source || '-'} />
                    <Row label="To" value={receipt.destination || '-'} />
                    <Row label="Consignee" value={receipt.consignee || '-'} />
                    <Row label="Packages" value={String(receipt.packages || 0)} />
                    <Row label="Material" value={receipt.material || receipt.description || '-'} />
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                      <span>Amount:</span><span>₹{(receipt.amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details panel */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="data">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="data" className="text-xs">Extracted Data</TabsTrigger>
              <TabsTrigger value="raw" className="text-xs">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="data">
              <Card className="border-border shadow-sm">
                <CardContent className="p-5 space-y-3">
                  {[
                    { label: 'GR Number', value: receipt.grNumber || '-' },
                    { label: 'Consignor', value: receipt.consignor || '-' },
                    { label: 'Consignee', value: receipt.consignee || '-' },
                    { label: 'Packages', value: String(receipt.packages || 0) },
                    { label: 'Material', value: receipt.material || receipt.description || '-' },
                    { label: 'Charges', value: `₹${(receipt.charges ?? receipt.amount ?? 0).toLocaleString('en-IN')}`, mono: true },
                    { label: 'Source', value: receipt.source || '-' },
                    { label: 'Destination', value: receipt.destination || '-' },
                    { label: 'Description', value: receipt.description || '-' },
                    { label: 'Amount', value: `₹${(receipt.amount || 0).toLocaleString('en-IN')}`, mono: true },
                    { label: 'Bilty Date', value: receipt.biltyDate || '-' },
                    { label: 'Uploaded Date', value: receipt.uploadedAt ? new Date(receipt.uploadedAt).toLocaleDateString('en-IN') : '-' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-start justify-between gap-3">
                      <span className="text-xs text-muted-foreground shrink-0 w-28">{f.label}</span>
                      <span className={cn('text-xs font-medium text-foreground text-right', f.mono && 'font-mono')}>{f.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">AI Confidence</span>
                      <span className="text-xs font-semibold text-primary">
                        {receipt.confidenceOverall ? `${receipt.confidenceOverall}%` : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="raw">
              <Card className="border-border shadow-sm">
                <CardContent className="p-5">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto max-h-[400px]">
                    {rawJson}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, Edit, Trash2, ZoomIn, ZoomOut, RotateCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { api, BackendReceipt } from '@/lib/api'

function ConfidenceDot({ score }: { score?: number }) {
  if (!score) {
    return <span className="text-xs text-muted-foreground">Not provided</span>
  }

  const color = score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('w-2 h-2 rounded-full', color)} />
      <span className={cn('text-xs', score >= 90 ? 'text-green-600 dark:text-green-400' : score >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400')}>
        {score}%
      </span>
    </div>
  )
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [receipt, setReceipt] = useState<BackendReceipt | null>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    grNumber: '',
    consignor: '',
    consignee: '',
    packages: '',
    material: '',
    description: '',
    charges: '',
    amount: '',
    source: '',
    destination: '',
    date: '',
  })
  
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    api.getReceipt(id).then(r => {
      setReceipt(r)
      setForm({
        grNumber: r.grNumber || '',
        consignor: r.consignor || '',
        consignee: r.consignee || '',
        packages: String(r.packages || 0),
        material: r.material || r.description || '',
        description: r.description || '',
        charges: String(r.charges ?? r.amount ?? 0),
        amount: String(r.amount || 0),
        source: r.source || '',
        destination: r.destination || '',
        date: r.biltyDate || '',
      })
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load receipt')
      router.push('/receipts')
    })
  }, [id, router])

  if (loading || !receipt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Loading receipt data...</p>
      </div>
    )
  }

  const overall = receipt.confidenceOverall || undefined
  const overallColor = !overall ? 'bg-muted text-muted-foreground border-border' : overall >= 90 ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' : overall >= 70 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
  const needsManualReview = Boolean(receipt.rejectionReason) || !overall || overall < 70

  const fields: { key: keyof typeof form; label: string }[] = [
    { key: 'grNumber', label: 'GR Number' },
    { key: 'consignor', label: 'Consignor' },
    { key: 'consignee', label: 'Consignee' },
    { key: 'packages', label: 'Packages' },
    { key: 'material', label: 'Material' },
    { key: 'charges', label: 'Charges' },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'source', label: 'Source' },
    { key: 'destination', label: 'Destination' },
    { key: 'date', label: 'Date' },
  ]

  const handleSave = async () => {
    try {
      const extracted = parseExtractedJson(receipt.extractedJson)
      const correctedJson = JSON.stringify({
        ...extracted,
        documentNo: form.grNumber || 'MISSING',
        origin: form.source || 'MISSING',
        destination: form.destination || 'MISSING',
        date: form.date || extracted.date || 'MISSING',
        consignor: { ...(extracted.consignor || {}), name: form.consignor || 'MISSING' },
        consignee: { ...(extracted.consignee || {}), name: form.consignee || 'MISSING' },
        items: [
          {
            ...((extracted.items && extracted.items[0]) || {}),
            description: form.material || form.description || 'MISSING',
            quantity: parseInt(form.packages) || -1,
          },
        ],
        freight: { ...(extracted.freight || {}), totalAmount: parseFloat(form.charges || form.amount) || -1 },
      })
      await api.updateReceipt(receipt.id, {
        grNumber: form.grNumber,
        consignor: form.consignor,
        consignee: form.consignee,
        packages: parseInt(form.packages) || 0,
        material: form.material,
        description: form.description,
        charges: parseFloat(form.charges) || 0,
        amount: parseFloat(form.charges || form.amount) || 0,
        source: form.source,
        destination: form.destination,
        biltyDate: form.date,
        extractedJson: correctedJson,
        rejectionReason: '',
      })
      toast.success(`Receipt ${receipt.id} saved`)
      router.push('/receipts')
    } catch (e) {
      toast.error('Failed to save receipt')
    }
  }

  const handleDelete = async () => {
    try {
      await api.deleteReceipt(receipt.id)
      toast.success(`Receipt ${receipt.id} deleted`)
      router.push('/receipts')
    } catch {
      toast.error('Failed to delete receipt')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Review Receipt</h1>
          <p className="font-mono text-sm text-muted-foreground mt-0.5">{receipt.id}</p>
        </div>
        <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium', overallColor)}>
          AI Confidence: {overall ? `${overall}%` : 'Not provided'}
        </div>
      </div>

      {needsManualReview && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Please review manually</p>
            <p className="text-xs mt-0.5">
              {receipt.rejectionReason || 'The extraction did not include a reliable confidence score.'}
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Image Panel (60%) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-muted rounded-xl overflow-hidden border border-border">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card">
              <span className="text-xs text-muted-foreground flex-1">Receipt Image</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setZoom(z => Math.min(z + 25, 200))}>
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setZoom(z => Math.max(z - 25, 50))}>
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setRotation(r => (r + 90) % 360)}>
                <RotateCw className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center justify-center min-h-[400px] p-6 overflow-auto">
              {receipt.contentType?.startsWith('image/') && (
                <img
                  src={api.receiptFileUrl(receipt.id)}
                  alt={receipt.originalFilename || 'Uploaded bilty'}
                  className="max-w-full max-h-[720px] object-contain transition-transform"
                  style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)`, transformOrigin: 'center' }}
                />
              )}
              {/* Simulated receipt image */}
              <div
                className="hidden bg-white rounded-lg shadow-md p-6 border border-gray-100 text-gray-800 transition-transform"
                style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)`, transformOrigin: 'center', minWidth: 280 }}
              >
                <div className="text-center border-b border-gray-200 pb-3 mb-3">
                  <p className="font-bold text-base">{receipt.consignor || 'Unknown Consignor'}</p>
                  <p className="text-xs text-gray-500">Transport Receipt</p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">From:</span><span className="font-medium">{receipt.source}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">To:</span><span className="font-medium">{receipt.destination}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Consignee:</span><span className="font-medium">{receipt.consignee}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Packages:</span><span className="font-medium">{receipt.packages}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Description:</span><span className="font-medium">{receipt.description}</span></div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                    <span>Amount:</span><span>₹{(receipt.amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Panel (40%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Extracted Data</h3>
            {fields.map(({ key, label }) => {
              const score = undefined
              const lowConf = Boolean(score && score < 70)
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{label}</Label>
                    <ConfidenceDot score={score} />
                  </div>
                  <Input
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className={cn('h-8 text-sm', lowConf && 'border-yellow-400 focus-visible:ring-yellow-400/50')}
                    type={key === 'amount' || key === 'charges' || key === 'packages' ? 'number' : key === 'date' ? 'date' : 'text'}
                  />
                  {lowConf && (
                    <p className="text-[11px] text-yellow-600 dark:text-yellow-400">Low confidence — review carefully</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleSave}>
              <Check className="w-4 h-4 mr-2" />Save
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleSave}>
              <Edit className="w-4 h-4 mr-2" />Edit & Save
            </Button>
          </div>
          {receipt.rejectionReason && (
            <Button variant="destructive" className="w-full" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />Delete Failed Image
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function parseExtractedJson(value?: string) {
  if (!value) return {}
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

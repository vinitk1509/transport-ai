'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const initialForm = {
  grNumber: '',
  biltyDate: '',
  consignor: '',
  consignee: '',
  source: '',
  destination: '',
  packages: '',
  material: '',
  description: '',
  charges: '',
  privateMarka: '',
}

type Receipt = {
  storedFilename?: string;
}

export default function EditReceiptPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [form, setForm] = useState(initialForm)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getReceipt(id).then(receipt => {
      setForm({
        grNumber: receipt.grNumber || '',
        biltyDate: receipt.biltyDate || '',
        consignor: receipt.consignor || '',
        consignee: receipt.consignee || '',
        source: receipt.source || '',
        destination: receipt.destination || '',
        packages: String(receipt.packages || ''),
        material: receipt.material || '',
        description: receipt.description || '',
        charges: String(receipt.charges ?? receipt.amount ?? ''),
        privateMarka: receipt.privateMarka || '',
      })
      setReceipt({ storedFilename: receipt.storedFilename })
      setLoading(false)
    }).catch((error) => {
      toast.error('Failed to load receipt')
      console.error(error)
      setLoading(false)
    })
  }, [id])

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateReceipt(id, {
        grNumber: form.grNumber.trim(),
        biltyDate: form.biltyDate,
        consignor: form.consignor.trim(),
        consignee: form.consignee.trim(),
        source: form.source.trim(),
        destination: form.destination.trim(),
        packages: Number(form.packages || 0),
        material: form.material.trim(),
        description: form.description.trim() || form.material.trim(),
        charges: Number(form.charges || 0),
        amount: Number(form.charges || 0),
        privateMarka: form.privateMarka.trim(),
      })
      toast.success('Bilty updated successfully')
      router.push('/receipts')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update bilty')
      console.error('Update bilty error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Bilty</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Modify the extracted information or manually correct errors.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Bilty Image</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px] relative bg-muted/20 flex items-center justify-center p-0 overflow-hidden">
            {receipt?.storedFilename ? (
              <img 
                src={`http://localhost:8080/api/v1/uploads/${receipt.storedFilename}`} 
                alt="Bilty image" 
                className="w-full h-full object-contain"
              />
            ) : (
              <p className="text-muted-foreground">No image available</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Bilty Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="GR Number" value={form.grNumber} onChange={(value) => setField('grNumber', value)} />
              <Field label="Bilty Date" type="date" value={form.biltyDate} onChange={(value) => setField('biltyDate', value)} />
              <Field label="Consignor" value={form.consignor} onChange={(value) => setField('consignor', value)} />
              <Field label="Consignee" value={form.consignee} onChange={(value) => setField('consignee', value)} />
              <Field label="Source" value={form.source} onChange={(value) => setField('source', value)} />
              <Field label="Destination" value={form.destination} onChange={(value) => setField('destination', value)} />
              <Field label="Packages" type="number" value={form.packages} onChange={(value) => setField('packages', value)} />
              <Field label="Charges" type="number" value={form.charges} onChange={(value) => setField('charges', value)} />
              <Field label="Private Marka" value={form.privateMarka} onChange={(value) => setField('privateMarka', value)} />
              <Field label="Material" value={form.material} onChange={(value) => setField('material', value)} />
              <Field label="Description" value={form.description} onChange={(value) => setField('description', value)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.push('/receipts')}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <Input id={inputId} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

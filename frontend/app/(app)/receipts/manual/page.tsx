'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
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

export default function ManualReceiptPage() {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const receipt = await api.createManualReceipt({
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
        rejectionReason: '',
      })
      toast.success('Manual bilty saved')
      router.push(`/receipts/${receipt.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save manual bilty')
      console.error('Save manual bilty error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manual Bilty Entry</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Enter bilty details when no image is available or AI extraction needs to be bypassed.</p>
      </div>

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
            <Button variant="outline" onClick={() => router.push('/receipts/upload')}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Bilty'}
            </Button>
          </div>
        </CardContent>
      </Card>
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
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

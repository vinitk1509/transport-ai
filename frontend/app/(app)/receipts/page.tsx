'use client'

import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import {
  Upload, Search, Download, Trash2, Eye, Lock,
  ChevronLeft, ChevronRight, FileX, Edit,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePermission } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { api, BackendReceipt } from '@/lib/api'

const PAGE_SIZE = 25

export default function ReceiptsPage() {
  const { canDelete, canExport } = usePermission()
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)
  const [receipts, setReceipts] = useState<BackendReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // Fetch paginated receipts
  useEffect(() => {
    setLoading(true)
    api.getPaginatedReceipts(page - 1, PAGE_SIZE, { search, source, dateFilter })
      .then(data => {
        setReceipts(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      })
      .catch(() => toast.error('Failed to load receipts'))
      .finally(() => setLoading(false))
  }, [page, search, source, dateFilter])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, source, dateFilter])

  const toggleSelect = (id: string) => {
    const s = new Set(selected)
    if (s.has(id)) s.delete(id)
    else s.add(id)
    setSelected(s)
  }
  const toggleAll = () => {
    if (selected.size === receipts.length) setSelected(new Set())
    else setSelected(new Set(receipts.map((r) => r.id)))
  }
  const selectedIds = Array.from(selected)

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBulkExport = async () => {
    try {
      const blob = await api.exportReceiptsBulk(selectedIds)
      downloadBlob(blob, 'receipts_export.zip')
      toast.success('Export started')
    } catch {
      toast.error('Failed to export selected receipts')
    }
  }

  const handleBulkDelete = async () => {
    try {
      await api.deleteReceipts(selectedIds)
      setReceipts((prev) => prev.filter((r) => !selected.has(r.id)))
      setSelected(new Set())
      toast.success('Deleted selected receipts')
    } catch {
      toast.error('Failed to delete selected receipts')
    }
  }

  const handleDeleted = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Receipts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{totalElements} total receipts</p>
          </div>
          <Button size="sm" render={<Link href="/receipts/upload" />}>
            <Upload className="w-4 h-4 mr-2" />Upload
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ID, GR no., consignor, route..."
              className="pl-8 h-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Input
            placeholder="Source city"
            className="h-8 w-40 text-sm"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-xs text-muted-foreground ml-auto">{totalElements} results</span>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5">
            <span className="text-sm font-medium text-primary">{selected.size} selected</span>
            <div className="flex gap-2 ml-auto">
              {canExport && (
                <Button size="sm" variant="outline" onClick={handleBulkExport}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />Export
                </Button>
              )}
              {canDelete && (
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        {receipts.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
            <FileX className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-foreground">No receipts found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query</p>
            <Button className="mt-4" size="sm" render={<Link href="/receipts/upload" />}>Upload your first receipt</Button>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left w-10">
                      <Checkbox
                        checked={receipts.length > 0 && selected.size === receipts.length}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Receipt ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">GR No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Truck No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Consignor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Consignee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Route</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">P.M.</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {receipts.map((r) => (
                    <ReceiptRow
                      key={r.id}
                      receipt={r}
                      selected={selected.has(r.id)}
                      onToggle={() => toggleSelect(r.id)}
                      canDelete={canDelete}
                      canExport={canExport}
                      onDeleted={handleDeleted}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

function ReceiptRow({ receipt: r, selected, onToggle, canDelete, canExport, onDeleted }: {
  receipt: BackendReceipt
  selected: boolean
  onToggle: () => void
  canDelete: boolean
  canExport: boolean
  onDeleted: (id: string) => void
}) {
  const handleDownload = async () => {
    try {
      const blob = await api.exportReceiptById(r.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt_${r.grNumber || r.id}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch {
      toast.error('Failed to download')
    }
  }

  const handleDelete = async () => {
    try {
      await api.deleteReceipt(r.id)
      onDeleted(r.id)
      toast.success('Receipt deleted')
    } catch {
      toast.error('Failed to delete receipt')
    }
  }

  return (
    <tr className={cn('hover:bg-muted/30 transition-colors', selected && 'bg-primary/5')}>
      <td className="px-4 py-3">
        <Checkbox checked={selected} onCheckedChange={onToggle} aria-label={`Select ${r.id}`} />
      </td>
      <td className="px-4 py-3">
        <Link href={`/receipts/${r.id}`} className="font-mono text-xs font-medium text-primary hover:underline">
          {r.id}
        </Link>
      </td>
      <td className="px-4 py-3 text-xs font-medium text-foreground">{r.grNumber || '-'}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {(r.biltyDate || r.uploadedAt) ? new Date(r.biltyDate || r.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '-'}
      </td>
      <td className="px-4 py-3 text-xs font-mono text-foreground">{r.truckNumber || '-'}</td>
      <td className="px-4 py-3 text-xs font-medium text-foreground max-w-[140px] truncate">{r.consignor || '-'}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell max-w-[140px] truncate">{r.consignee || '-'}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{r.source || '-'} → {r.destination || '-'}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell max-w-[100px] truncate">{r.privateMarka || '-'}</td>
      <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-foreground">
        ₹{(r.charges ?? r.amount ?? 0).toLocaleString('en-IN')}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-6 w-6" asChild>
                <Link href={`/receipts/${r.id}`}><Eye className="w-3.5 h-3.5" /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-6 w-6" asChild>
                <Link href={`/receipts/${r.id}/edit`}><Edit className="w-3.5 h-3.5" /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              {canExport ? (
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleDownload}>
                  <Download className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-40 cursor-not-allowed">
                  <Lock className="w-3.5 h-3.5" />
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent>{canExport ? 'Download' : 'Requires Manager role'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              {canDelete ? (
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={handleDelete}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-40 cursor-not-allowed">
                  <Lock className="w-3.5 h-3.5" />
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent>{canDelete ? 'Delete' : 'Requires Admin role'}</TooltipContent>
          </Tooltip>
        </div>
      </td>
    </tr>
  )
}

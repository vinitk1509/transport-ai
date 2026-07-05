'use client'

import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, Clock, Bookmark, FileX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { api, BackendReceipt } from '@/lib/api'

const recentSearches = [
  'cloth from Amritsar',
  'Surinder Kumar October',
  'missing consignee',
  'Mumbai consignee',
]

const savedSearches = [
  { label: 'High value > Rs 20K', query: 'amount:20000' },
  { label: 'Delhi route', query: 'Delhi' },
  { label: 'Missing GR number', query: 'MISSING' },
]

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-primary/20 text-primary rounded-sm px-0.5">{p}</mark>
      : p
  )
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [committed, setCommitted] = useState(searchParams.get('q') ?? '')
  const [receipts, setReceipts] = useState<BackendReceipt[]>([])

  useEffect(() => {
    api.getReceipts().then(setReceipts).catch(console.error)
  }, [])

  const results = useMemo(() => {
    if (!committed.trim()) return []
    const q = committed.toLowerCase()
    return receipts.filter((r) => (
      r.id.toLowerCase().includes(q) ||
      (r.grNumber || '').toLowerCase().includes(q) ||
      (r.consignor || '').toLowerCase().includes(q) ||
      (r.consignee || '').toLowerCase().includes(q) ||
      (r.source || '').toLowerCase().includes(q) ||
      (r.destination || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      (r.material || '').toLowerCase().includes(q) ||
      (r.biltyDate || '').toLowerCase().includes(q) ||
      String(r.amount || '').includes(q) ||
      String(r.charges || '').includes(q)
    ))
  }, [committed, receipts])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCommitted(query)
  }

  const handleChip = (q: string) => {
    setQuery(q)
    setCommitted(q)
  }

  const hasSearched = committed.trim().length > 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Search</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Search across all receipts, consignors, and routes</p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'cloth from Amritsar' or 'Surinder Kumar October'"
          className="pl-12 pr-12 h-12 text-base bg-card border-border shadow-sm rounded-xl"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setCommitted('') }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {!hasSearched && (
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => handleChip(s)}
                  className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-foreground hover:bg-muted hover:border-primary/40 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Saved Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleChip(s.query)}
                  className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary hover:bg-primary/10 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground flex-1">
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;<strong className="text-foreground">{committed}</strong>&rdquo;
            </span>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
              <FileX className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="font-medium text-foreground">No receipts found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((r) => (
                <Link key={r.id} href={`/receipts/${r.id}`}>
                  <Card className="border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="font-mono text-xs font-semibold text-primary">
                            {highlight(r.id, committed)}
                          </span>
                          <p className="text-sm font-medium text-foreground">
                            {highlight(r.consignor || '', committed)}
                            <span className="text-muted-foreground font-normal"> to {highlight(r.consignee || '', committed)}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {highlight(r.source || '', committed)} to {highlight(r.destination || '', committed)} &middot; {highlight(r.material || r.description || '', committed)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono text-sm font-bold text-foreground">Rs {(r.amount || 0).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-muted-foreground mt-0.5" title={r.biltyDate ? 'Bilty Date' : 'Upload Date'}>
                            {r.biltyDate || r.uploadedAt ? new Date(r.biltyDate || r.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

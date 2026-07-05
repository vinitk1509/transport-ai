'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, FileImage, X, Loader2, CheckCircle, Zap, FileCheck2, Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { toast } from 'sonner'

type Stage = 'idle' | 'uploading' | 'enhancing' | 'extracting' | 'done'

const stages: Stage[] = ['uploading', 'enhancing', 'extracting', 'done']

const stageLabel: Record<Stage, string> = {
  idle: '',
  uploading: 'Uploading receipt...',
  enhancing: 'Enhancing image quality...',
  extracting: 'AI extracting data fields...',
  done: 'Extraction complete!',
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [processedReceiptIds, setProcessedReceiptIds] = useState<string[]>([])
  const [allReceiptIds, setAllReceiptIds] = useState<string[]>([])
  const [failedReceiptIds, setFailedReceiptIds] = useState<string[]>([])
  const [failedCount, setFailedCount] = useState(0)
  const [manualReviewCount, setManualReviewCount] = useState(0)

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  })

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  const processFiles = async () => {
    if (files.length === 0) return
    
    try {
      setStage('uploading')
      setProgress(25)
      
      setStage('extracting')
      setProgress(60)
      
      const receipts = await api.uploadReceipts(files)
      const processed = receipts.filter((receipt) => !receipt.rejectionReason)
      const failedReceipts = receipts.filter((receipt) => Boolean(receipt.rejectionReason))
      const failed = receipts.length - processed.length
      const reviewNeeded = processed.filter((receipt) => !receipt.confidenceOverall || receipt.confidenceOverall < 70).length
      setProcessedReceiptIds(processed.map((receipt) => receipt.id))
      setAllReceiptIds(receipts.map((receipt) => receipt.id))
      setFailedReceiptIds(failedReceipts.map((receipt) => receipt.id))
      setFailedCount(failed)
      setManualReviewCount(reviewNeeded)
      
      setStage('done')
      setProgress(100)
      toast.success(`${processed.length} bilty image${processed.length === 1 ? '' : 's'} processed${reviewNeeded ? `, ${reviewNeeded} need manual review` : ''}${failed ? `, ${failed} failed` : ''}`)
      
    } catch (error) {
      console.error(error)
      toast.error('Failed to process receipt images')
      setStage('idle')
      setProgress(0)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Bilties</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Drag and drop one image or a full batch</p>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" render={<Link href="/receipts/manual" />}>
          Manual Entry
        </Button>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', isDragActive ? 'bg-primary' : 'bg-muted')}>
            <Upload className={cn('w-6 h-6', isDragActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {isDragActive ? 'Drop files here' : 'Drag & drop bilty images here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse - PNG, JPG, JPEG supported</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            <Button size="sm" variant="outline" type="button">
              <FileImage className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
            <Button size="sm" type="button" onClick={(e) => {
              e.stopPropagation()
              document.getElementById('camera-input')?.click()
            }}>
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden camera input */}
      <input
        id="camera-input"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
        }}
      />

      {/* File list */}
      {files.length > 0 && stage === 'idle' && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">{files.length} file{files.length > 1 ? 's' : ''} selected</h3>
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
              <FileImage className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button className="w-full mt-3" onClick={processFiles}>
            <Zap className="w-4 h-4 mr-2" />
            Process {files.length} image{files.length === 1 ? '' : 's'} with AI
          </Button>
        </div>
      )}

      {/* Progress stage */}
      {stage !== 'idle' && stage !== 'done' && (
        <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{stageLabel[stage]}</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait while we process your receipt</p>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
        </div>
      )}

      {stage === 'done' && (
        <div className="bg-card border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
          <p className="font-semibold text-foreground">Extraction complete</p>
          <p className="text-sm text-muted-foreground">
            {processedReceiptIds.length} bilty image{processedReceiptIds.length === 1 ? '' : 's'} accepted.
            {manualReviewCount > 0 ? ` ${manualReviewCount} need manual review due to low or missing confidence.` : ''}
            {failedCount > 0 ? ` ${failedCount} image${failedCount === 1 ? '' : 's'} could not be extracted.` : ''}
          </p>
          {failedCount > 0 && (
            <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Failed images may need manual review before export.
            </div>
          )}
          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            <Button disabled={allReceiptIds.length === 0} onClick={() => allReceiptIds[0] && router.push(`/receipts/upload/review/${allReceiptIds[0]}`)}>
              <FileCheck2 className="w-4 h-4 mr-2" />
              Review first image
            </Button>
            <Button variant="outline" disabled={failedReceiptIds.length === 0} onClick={() => failedReceiptIds[0] && router.push(`/receipts/upload/review/${failedReceiptIds[0]}`)}>
              <AlertCircle className="w-4 h-4 mr-2" />
              Review failed
            </Button>
            <Button variant="outline" disabled={processedReceiptIds.length === 0} onClick={() => router.push('/receipts')}>
              <Download className="w-4 h-4 mr-2" />
              View accepted bilties
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

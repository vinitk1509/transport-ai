'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Camera, FileImage, X, CheckCircle, Zap, FileCheck2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { toast } from 'sonner'

type Stage = 'idle' | 'processing' | 'done'
type PreviewFile = File & { preview: string }

const FADE_IN = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, scale: 0.95 } }

export default function PremiumUploadPage() {
  const router = useRouter()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  const [files, setFiles] = useState<PreviewFile[]>([])
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  
  // Clean up state
  const [results, setResults] = useState<{ processed: string[], failed: string[], reviewCount: number }>({ processed: [], failed: [], reviewCount: 0 })

  // Clean up ObjectURLs to prevent memory leaks
  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview))
  }, [files])

  const onDrop = useCallback((accepted: File[]) => {
    const mapped = accepted.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }))
    setFiles(prev => [...prev, ...mapped])
    setStage('idle') // Reset on new drops
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  })

  const removeFile = (i: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[i].preview)
      newFiles.splice(i, 1)
      return newFiles
    })
  }

  const processFiles = async () => {
    if (!files.length) return
    setStage('processing')
    setProgress(15) // Simulate initial network handshake
    
    // Simulate gradual progress while waiting for GenAI
    const progressInterval = setInterval(() => {
      setProgress(p => (p < 85 ? p + Math.random() * 5 : p))
    }, 500)

    try {
      const receipts = await api.uploadReceipts(files) // Assuming this is now fully async on backend
      clearInterval(progressInterval)
      setProgress(100)
      
      const processed = receipts.filter(r => !r.rejectionReason)
      const failed = receipts.filter(r => !!r.rejectionReason)
      const reviewNeeded = processed.filter(r => !r.confidenceOverall || r.confidenceOverall < 70).length

      setResults({
        processed: processed.map(r => r.id),
        failed: failed.map(r => r.id),
        reviewCount: reviewNeeded
      })
      
      setStage('done')
      toast.success('Extraction complete')
    } catch (error) {
      clearInterval(progressInterval)
      console.error(error)
      toast.error('Failed to process bilties')
      setStage('idle')
      setProgress(0)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload Bilties</h1>
            <p className="text-sm text-muted-foreground mt-1">Upload images to instantly extract data using AI.</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/receipts/manual')}>
            Manual Entry
          </Button>
        </div>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {stage === 'idle' && (
          <motion.div key="dropzone" {...FADE_IN} layout>
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors duration-300 relative overflow-hidden',
                isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <input {...getInputProps()} />
              <motion.div 
                className="flex flex-col items-center gap-4 relative z-10"
                animate={{ scale: isDragActive ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className={cn('w-16 h-16 rounded-full flex items-center justify-center transition-colors', isDragActive ? 'bg-primary' : 'bg-primary/10')}>
                  <Upload className={cn('w-8 h-8', isDragActive ? 'text-primary-foreground' : 'text-primary')} />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {isDragActive ? 'Drop them here!' : 'Drag & drop bilty images'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                </div>
                
                <div className="flex gap-3 mt-2" onClick={e => e.stopPropagation()}>
                  <Button size="sm" variant="secondary" onClick={() => document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'))}>
                    <FileImage className="w-4 h-4 mr-2" /> Browse
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-2" /> Camera
                  </Button>
                </div>
              </motion.div>
            </div>
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) onDrop(Array.from(e.target.files))
                e.target.value = '' // Allow re-uploading same file
              }}
            />

            {files.length > 0 && (
              <motion.div layout className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{files.length} file(s) ready</h3>
                  <Button onClick={processFiles} className="shadow-lg shadow-primary/20">
                    <Zap className="w-4 h-4 mr-2 fill-current" /> Process AI Extraction
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  <AnimatePresence>
                    {files.map((f, i) => (
                      <motion.div 
                        key={f.name + i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05, type: 'spring' }}
                        className="flex items-center gap-4 bg-card border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.preview} alt="preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button onClick={() => removeFile(i)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div key="processing" {...FADE_IN} className="bg-card border border-border rounded-2xl p-10 text-center space-y-6 shadow-sm overflow-hidden">
            {/* Road + Truck Scene */}
            <div className="relative h-32 mx-auto max-w-md">
              {/* Road surface */}
              <div className="absolute bottom-4 left-0 right-0 h-8 bg-muted-foreground/10 rounded-full" />
              {/* Road dashes */}
              <div className="absolute bottom-7 left-0 right-0 flex justify-around overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-6 h-[3px] bg-muted-foreground/25 rounded-full"
                    animate={{ x: [-120, 400] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear', delay: i * 0.25 }}
                  />
                ))}
              </div>

              {/* Truck */}
              <motion.div
                className="absolute bottom-6 left-1/2 -translate-x-1/2"
                animate={{ x: [-8, 8, -8] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              >
                <svg width="120" height="72" viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Cargo container */}
                  <rect x="2" y="8" width="68" height="40" rx="4" className="fill-primary/20 stroke-primary" strokeWidth="2" />
                  {/* Cargo stripes */}
                  <line x1="24" y1="8" x2="24" y2="48" className="stroke-primary/30" strokeWidth="1.5" />
                  <line x1="46" y1="8" x2="46" y2="48" className="stroke-primary/30" strokeWidth="1.5" />
                  {/* Box on cargo */}
                  <motion.rect
                    x="10" y="18" width="12" height="12" rx="2" className="fill-primary/40"
                    animate={{ y: [18, 15, 18] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                  />
                  <motion.rect
                    x="30" y="22" width="10" height="10" rx="2" className="fill-primary/30"
                    animate={{ y: [22, 19, 22] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0.15 }}
                  />
                  <motion.rect
                    x="50" y="16" width="14" height="14" rx="2" className="fill-primary/35"
                    animate={{ y: [16, 13, 16] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0.3 }}
                  />
                  {/* Cabin */}
                  <path d="M70 18 H100 C106 18 110 22 110 28 V48 H70 V18Z" className="fill-primary stroke-primary" strokeWidth="2" />
                  {/* Window */}
                  <rect x="78" y="24" width="24" height="14" rx="3" className="fill-primary-foreground/90" />
                  {/* Headlight */}
                  <rect x="108" y="36" width="6" height="6" rx="1.5" className="fill-yellow-400" />
                  {/* Bumper */}
                  <rect x="70" y="48" width="46" height="4" rx="2" className="fill-muted-foreground/30" />

                  {/* Front wheel */}
                  <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}>
                    <circle cx="96" cy="56" r="8" className="fill-foreground/80" />
                    <circle cx="96" cy="56" r="3" className="fill-muted" />
                    <line x1="96" y1="49" x2="96" y2="51" className="stroke-muted/60" strokeWidth="1.5" />
                    <line x1="96" y1="61" x2="96" y2="63" className="stroke-muted/60" strokeWidth="1.5" />
                    <line x1="89" y1="56" x2="91" y2="56" className="stroke-muted/60" strokeWidth="1.5" />
                    <line x1="101" y1="56" x2="103" y2="56" className="stroke-muted/60" strokeWidth="1.5" />
                  </motion.g>
                  {/* Rear wheel */}
                  <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}>
                    <circle cx="24" cy="56" r="8" className="fill-foreground/80" />
                    <circle cx="24" cy="56" r="3" className="fill-muted" />
                    <line x1="24" y1="49" x2="24" y2="51" className="stroke-muted/60" strokeWidth="1.5" />
                    <line x1="24" y1="61" x2="24" y2="63" className="stroke-muted/60" strokeWidth="1.5" />
                    <line x1="17" y1="56" x2="19" y2="56" className="stroke-muted/60" strokeWidth="1.5" />
                    <line x1="29" y1="56" x2="31" y2="56" className="stroke-muted/60" strokeWidth="1.5" />
                  </motion.g>
                </svg>

                {/* Exhaust puffs */}
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="absolute -left-4 bottom-4 w-3 h-3 rounded-full bg-muted-foreground/15"
                    animate={{ x: [-10, -50], y: [0, -12], opacity: [0.5, 0], scale: [0.6, 1.8] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut', delay: i * 0.5 }}
                  />
                ))}
              </motion.div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-semibold">AI is analyzing bilties</h3>
              <p className="text-sm text-muted-foreground">Extracting consignor, freight details, and dates...</p>
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-xs text-muted-foreground font-mono">{Math.round(progress)}%</p>
            </div>
          </motion.div>
        )}

        {stage === 'done' && (
          <motion.div key="done" {...FADE_IN} className="bg-card border border-green-500/30 rounded-2xl p-10 text-center space-y-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Extraction Complete</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Successfully extracted <span className="font-semibold text-foreground">{results.processed.length}</span> documents.
                {results.reviewCount > 0 && ` ${results.reviewCount} need verification.`}
                {results.failed.length > 0 && ` ${results.failed.length} failed to process.`}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {results.processed.length > 0 && (
                <Button className="rounded-full shadow-lg" onClick={() => router.push(`/receipts/upload/review/${results.processed[0]}`)}>
                  <FileCheck2 className="w-4 h-4 mr-2" /> Start Review
                </Button>
              )}
              {results.failed.length > 0 && (
                <Button variant="outline" className="rounded-full border-amber-500/50 text-amber-600 hover:bg-amber-500/10" onClick={() => router.push(`/receipts/upload/review/${results.failed[0]}`)}>
                  <AlertCircle className="w-4 h-4 mr-2" /> Review Failed Image
                </Button>
              )}
              <Button variant="outline" className="rounded-full" onClick={() => { setStage('idle'); setFiles([]); }}>
                <Upload className="w-4 h-4 mr-2" /> Upload More
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

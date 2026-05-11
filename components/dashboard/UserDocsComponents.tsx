"use client"

import React, { useState, useRef } from 'react'
import { IDocument } from '@/db/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  MoreHorizontal,
  Trash2,
  Pencil,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  HardDrive,
  Calendar,
  Zap,
  MessageCircle,
} from 'lucide-react'
import { useDeleteDocument, useUpdateDocument } from '@/lib/hooks/document/useDocument'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'

/* ─────────────────── props ─────────────────── */
interface UserDocsComponentsProps {
  data: IDocument[]
  isLoading: boolean
  page: number
  totalPages: number
  total: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSearch: (search: string) => void
  setStatus: (status: any) => void
}

/* ─────────────────── status config ─────────────────── */
const STATUS_CFG = {
  completed: {
    label: 'Completed',
    Icon: CheckCircle2,
    cls: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    spin: false,
  },
  processing: {
    label: 'Processing',
    Icon: Loader2,
    cls: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    spin: true,
  },
  uploading: {
    label: 'Uploading',
    Icon: Loader2,
    cls: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    spin: true,
  },
  failed: {
    label: 'Failed',
    Icon: XCircle,
    cls: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    spin: false,
  },
} as const

type StatusKey = keyof typeof STATUS_CFG

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'processing', label: 'Processing' },
  { value: 'uploading', label: 'Uploading' },
  { value: 'failed', label: 'Failed' },
]

/* ─────────────────── helpers ─────────────────── */
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status as StatusKey]
  if (!cfg) return <Badge variant="outline">{status}</Badge>
  const { label, Icon, cls, spin } = cfg
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', cls)}>
      <Icon className={cn('h-3 w-3 shrink-0', spin && 'animate-spin')} />
      {label}
    </span>
  )
}

function fmt(date: Date | string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

function fmtNum(n: number | null | undefined) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

/* ─────────────────── skeleton cards ─────────────────── */
function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex h-64 flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────── empty state ─────────────────── */
function EmptyState() {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-border py-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="mt-4 font-serif text-base font-semibold text-foreground">
        No documents yet
      </p>
      <p className="max-w-xs text-center text-sm text-muted-foreground mt-1">
        Upload a document or adjust your filters to get started.
      </p>
      <Link href={"/dashboard/user/documents"}>
        <Button variant="secondary" className="mt-3 text-sm">Upload Documents</Button>
      </Link>
    
    </div>
  )
}

/* ─────────────────── main component ─────────────────── */
export default function UserDocsComponents({
  data,
  isLoading,
  page,
  totalPages,
  total,
  setPage,
  setLimit,
  setSearch,
  setStatus,
}: UserDocsComponentsProps) {
  const [searchVal, setSearchVal] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [editingDoc, setEditingDoc] = useState<IDocument | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { mutate: deleteDoc } = useDeleteDocument()
  const { mutate: updateDoc, isPending: isUpdating } = useUpdateDocument()

  /* debounced search */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchVal(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { setSearch(val); setPage(1) }, 400)
  }

  /* status filter */
  const handleFilter = (value: string) => {
    setActiveFilter(value)
    setStatus(value === 'all' ? '' : value)
    setPage(1)
  }

  /* edit */
  const openEdit = (doc: IDocument) => { setEditingDoc(doc); setEditTitle(doc.title) }
  const saveEdit = () => {
    if (!editingDoc || !editTitle.trim()) return
    updateDoc(
      { id: editingDoc.id, data: { title: editTitle.trim() } },
      {
        onSuccess: () => { toast.success('Title updated'); setEditingDoc(null) },
        onError: () => toast.error('Failed to update title'),
      }
    )
  }

  /* toggle active */
  const handleToggleActive = (doc: IDocument) => {
    setTogglingId(doc.id)
    updateDoc(
      { id: doc.id, data: { isActive: !doc.isActive } },
      {
        onSuccess: () => {
          toast.success(doc.isActive ? 'Document deactivated' : 'Document activated')
          setTogglingId(null)
        },
        onError: () => { toast.error('Failed to update status'); setTogglingId(null) },
      }
    )
  }

  /* delete */
  const handleDelete = (id: string) => {
    setDeletingId(id)
    deleteDoc(id, {
      onSuccess: () => { toast.success('Document deleted'); setDeletingId(null) },
      onError: () => { toast.error('Failed to delete'); setDeletingId(null) },
    })
  }

  /* pagination number array */
  const pageNums = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const arr: (number | 'ellipsis')[] = [1]
    if (page > 3) arr.push('ellipsis')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) arr.push(i)
    if (page < totalPages - 2) arr.push('ellipsis')
    if (totalPages > 1) arr.push(totalPages)
    return arr
  }

  return (
    <>
      {/* ── Edit Title Sheet ── */}
      <Sheet open={!!editingDoc} onOpenChange={(o) => !o && setEditingDoc(null)}>
        <SheetContent className="border-border bg-background/95 backdrop-blur-2xl">
          <SheetHeader className="space-y-1">
            <SheetTitle className="font-serif text-xl font-semibold">
              Edit Title
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Rename your document. Content stays unchanged.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8 space-y-2">
            <Label htmlFor="doc-title" className="text-sm font-medium">Document Title</Label>
            <Input
              id="doc-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter title…"
              className="rounded-xl font-serif"
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
            />
          </div>

          <SheetFooter className="mt-8 flex gap-2">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1 rounded-xl">Cancel</Button>
            </SheetClose>
            <Button
              onClick={saveEdit}
              disabled={isUpdating || !editTitle.trim()}
              className="flex-1 rounded-xl"
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Page ── */}
      <div className="space-y-6 w-full">

        {/* header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              My Documents
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {total} document{total !== 1 ? 's' : ''} total
            </p>
          </div>

          {/* search */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents…"
              value={searchVal}
              onChange={handleSearch}
              className="rounded-xl pl-9 font-serif"
            />
          </div>
        </div>

        {/* status filter pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilter(value)}
              className={cn(
                'rounded-full border px-4 py-1.5 font-serif text-xs font-medium transition-all duration-150',
                activeFilter === value
                  ? 'border-foreground bg-foreground text-background shadow-sm'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Grid of Cards ── */}
        {isLoading ? (
          <SkeletonCards />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 space-y-7">
            {data.map((doc) => {
              const isThisDeleting = deletingId === doc.id
              const isThisToggling = togglingId === doc.id

              return (
                <div
                  key={doc.id}
                  className={cn(
                    'group space relative flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-foreground/20',
                    isThisDeleting && 'pointer-events-none opacity-40'
                  )}
                >
                  <div className='space-y-7'>
                    {/* Top Row: Title + Dropdown */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 overflow-hidden">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <h3 className="truncate font-serif text-lg font-semibold text-foreground" title={doc.title}>
                          {doc.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {doc.documentType && <span className="capitalize">{doc.documentType}</span>}
                          <span>•</span>
                          <span>{doc.source ?? 'No Source'}</span>
                        </div>
                      </div>

                      {/* Action Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[150px] rounded-xl border-border bg-background/95 shadow-xl backdrop-blur-xl"
                        >
                          <DropdownMenuItem
                            onClick={() => openEdit(doc)}
                            className="flex cursor-pointer items-center gap-2 rounded-lg font-serif text-sm"
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            Edit Title
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(doc.id)}
                            disabled={isThisDeleting}
                            className="flex cursor-pointer items-center gap-2 rounded-lg font-serif text-sm text-destructive focus:text-destructive"
                          >
                            {isThisDeleting
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Trash2 className="h-3.5 w-3.5" />
                            }
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status + Switch row */}
                    <div className="mt-4 flex items-center justify-between">
                      <StatusBadge status={doc.status} />
                      
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-serif text-xs font-medium',
                          doc.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                        )}>
                          {doc.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {isThisToggling ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Switch
                            checked={doc.isActive ?? false}
                            onCheckedChange={() => handleToggleActive(doc)}
                            aria-label={doc.isActive ? 'Deactivate' : 'Activate'}
                          />
                        )}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-6 grid grid-cols-2 gap-3 text-sm ">
                      <div className="flex flex-col gap-1 rounded-2xl bg-muted/50 p-3.5">
                        <span className="flex items-center gap-1.5 font-serif text-xs text-muted-foreground">
                          <Zap className="h-3.5 w-3.5" /> Tokens
                        </span>
                        <span className="font-mono text-sm font-medium text-foreground">{fmtNum(doc.tokenCount)}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 rounded-2xl bg-muted/50 p-3.5">
                        <span className="flex items-center gap-1.5 font-serif text-xs text-muted-foreground">
                          <HardDrive className="h-3.5 w-3.5" /> Size
                        </span>
                        <span className="font-mono text-sm font-medium text-foreground">{doc.size ?? '—'}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 rounded-2xl bg-muted/50 p-3.5">
                        <span className="flex items-center gap-1.5 font-serif text-xs text-muted-foreground">
                          <Database className="h-3.5 w-3.5" /> Vectors
                        </span>
                        <span className="font-mono text-sm font-medium text-foreground">{fmtNum(doc.vectorCount)}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 rounded-2xl bg-muted/50 p-3.5">
                        <span className="flex items-center gap-1.5 font-serif text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" /> Created
                        </span>
                        <span className="text-sm font-medium text-foreground">{fmt(doc.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar (if processing/uploading) */}
                  {doc.status !== 'completed' && doc.status !== 'failed' && (
                    <div className="mt-5 flex items-center gap-3">
                      <Progress value={doc.progress ?? 0} className="h-1.5 flex-1" />
                      <span className="w-8 text-right font-mono text-xs font-medium text-muted-foreground">
                        {doc.progress ?? 0}%
                      </span>
                    </div>
                  )}

                  
                    <Link href={`/chat/${doc.id}`} className=" font-serif">
                    <Button variant={"outline"} className="w-full  cursor-pointer mt-3 text-primary">
                        <MessageCircle className=' w-4 h-4'/>
                    Chat with this document </Button>
                    </Link>
                 
                </div>
              )
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <Pagination className="pt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1) }}
                  className={cn('rounded-xl font-serif', page <= 1 && 'pointer-events-none opacity-40')}
                />
              </PaginationItem>

              {pageNums().map((p, i) =>
                p === 'ellipsis' ? (
                  <PaginationItem key={`el-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => { e.preventDefault(); setPage(p) }}
                      className="rounded-xl font-serif"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1) }}
                  className={cn('rounded-xl font-serif', page >= totalPages && 'pointer-events-none opacity-40')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </>
  )
}
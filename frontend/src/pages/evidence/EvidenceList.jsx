import { useEffect, useState, useRef } from 'react'
import { getCaseEvidence, uploadEvidence, verifyEvidence, deleteEvidence } from '@/api/evidence.api'
import { useAuth } from '@/hooks/useAuth'
import {
  ROLES, EVIDENCE_TYPES, EVIDENCE_TYPE_LABELS, ACCESS_LEVELS,
  ACCEPTED_EVIDENCE_TYPES, MAX_EVIDENCE_FILE_SIZE_BYTES, MAX_EVIDENCE_FILE_SIZE_MB,
} from '@/utils/constants'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { FileText, Image, Video, Music, Upload, CheckCircle, Trash2, AlertCircle, ExternalLink } from 'lucide-react'

const TYPE_ICONS = { PHOTO: Image, VIDEO: Video, DOCUMENT: FileText, AUDIO: Music }

const ACCESS_COLORS = {
  PUBLIC: 'bg-green-100 text-green-700',
  INTERNAL: 'bg-blue-100 text-blue-700',
  CONFIDENTIAL: 'bg-red-100 text-red-700',
}

function EvidenceCard({ item, canVerify, canDelete, onVerify, onDelete }) {
  const Icon = TYPE_ICONS[item.fileCategory] || FileText
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.fileName || 'Unnamed file'}</p>
            <p className="text-xs text-muted-foreground">
              {item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : ''} · {EVIDENCE_TYPE_LABELS[item.fileCategory] || item.fileCategory}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ACCESS_COLORS[item.accessLevel] || 'bg-gray-100 text-gray-700'}`}>
            {item.accessLevel}
          </span>
          {item.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
              <CheckCircle className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
      </div>

      {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}

      {item.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground">{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1 border-t">
        <p className="text-xs text-muted-foreground">{item.uploadedBy?.name} · {new Date(item.createdAt).toLocaleDateString()}</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          {canVerify && !item.isVerified && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => onVerify(item)}>
              <CheckCircle className="h-3.5 w-3.5" />
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(item)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function UploadModal({ open, onClose, caseId, onSuccess }) {
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ description: '', fileCategory: '', accessLevel: ACCESS_LEVELS.INTERNAL, tags: '' })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > MAX_EVIDENCE_FILE_SIZE_BYTES) { setError(`File must be under ${MAX_EVIDENCE_FILE_SIZE_MB}MB.`); return }
    setFile(f); setError('')
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select a file.'); return }
    if (!form.fileCategory) { setError('Please select an evidence type.'); return }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('fileCategory', form.fileCategory)
    fd.append('accessLevel', form.accessLevel)
    if (form.description) fd.append('description', form.description)
    if (form.tags) form.tags.split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => fd.append('tags[]', t))
    setUploading(true)
    try {
      await uploadEvidence(caseId, fd)
      setFile(null); setForm({ description: '', fileCategory: '', accessLevel: ACCESS_LEVELS.INTERNAL, tags: '' })
      onSuccess(); onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Upload Evidence</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>File <span className="text-muted-foreground text-xs">(max {MAX_EVIDENCE_FILE_SIZE_MB}MB)</span></Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileRef.current?.click()}>
              {file ? <p className="text-sm font-medium truncate">{file.name}</p> : (
                <div className="space-y-1">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to select a file</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, PDF, MP4</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept={ACCEPTED_EVIDENCE_TYPES} onChange={handleFile} className="hidden" />
          </div>
          <div className="space-y-1.5">
            <Label>Evidence Type</Label>
            <Select value={form.fileCategory} onValueChange={(v) => setForm((f) => ({ ...f, fileCategory: v }))}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{Object.values(EVIDENCE_TYPES).map((t) => <SelectItem key={t} value={t}>{EVIDENCE_TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Access Level</Label>
            <Select value={form.accessLevel} onValueChange={(v) => setForm((f) => ({ ...f, accessLevel: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.values(ACCESS_LEVELS).map((l) => <SelectItem key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea placeholder="Brief description…" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
            <Input placeholder="witness, photo" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function EvidenceList({ caseId }) {
  const { role } = useAuth()
  const canUpload = role === ROLES.ADMIN || role === ROLES.INVESTIGATOR
  const canVerify = role === ROLES.ADMIN
  const canDelete = role === ROLES.ADMIN

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetch = () => {
    setLoading(true)
    getCaseEvidence(caseId)
      .then((res) => setItems(res.data.data?.evidence || []))
      .catch(() => setError('Failed to load evidence.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [caseId])

  const handleVerify = async (item) => {
    try { await verifyEvidence(item._id); fetch() } catch (err) { console.error(err) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await deleteEvidence(deleteItem._id); setDeleteItem(null); fetch() } catch (err) { console.error(err) } finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      {canUpload && (
        <Button size="sm" onClick={() => setUploadOpen(true)}>
          <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Evidence
        </Button>
      )}
      {error && <div className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> {error}</div>}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No evidence uploaded yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <EvidenceCard key={item._id} item={item} canVerify={canVerify} canDelete={canDelete} onVerify={handleVerify} onDelete={setDeleteItem} />
          ))}
        </div>
      )}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} caseId={caseId} onSuccess={fetch} />
      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(v) => !v && setDeleteItem(null)}
        title="Delete Evidence"
        description="This will archive the file and remove it from Cloudinary."
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}

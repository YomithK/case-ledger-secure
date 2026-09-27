import { useEffect, useState } from 'react'
import { getCaseProgress, addCaseProgress, updateProgress, deleteProgress } from '@/api/progress.api'
import { useAuth } from '@/hooks/useAuth'
import { ROLES, CASE_STATUS, CASE_STATUS_LABELS } from '@/utils/constants'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'

const EDIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function isWithinEditWindow(createdAt) {
  return Date.now() - new Date(createdAt).getTime() < EDIT_WINDOW_MS
}

function TimelineEntry({ entry, onEdit, onDelete, canModify }) {
  const withinWindow = isWithinEditWindow(entry.createdAt)

  return (
    <div className="flex gap-4">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div className="h-3 w-3 rounded-full bg-primary mt-1 shrink-0" />
        <div className="w-px flex-1 bg-border mt-1" />
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{entry.updatedBy?.name || 'Unknown'}</span>
              {entry.statusSnapshot && <StatusBadge status={entry.statusSnapshot} />}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </div>

          {canModify && withinWindow && (
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(entry)}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(entry)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{entry.message}</p>
      </div>
    </div>
  )
}

export default function ProgressTimeline({ caseId }) {
  const { role, user } = useAuth()
  const canAdd = role === ROLES.INVESTIGATOR
  const canDelete = role === ROLES.ADMIN

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Add form
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ message: '', statusSnapshot: '' })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  // Edit
  const [editEntry, setEditEntry] = useState(null)
  const [editMessage, setEditMessage] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleteEntry, setDeleteEntry] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProgress = () => {
    setLoading(true)
    getCaseProgress(caseId)
      .then((res) => setEntries(res.data.data?.progress || []))
      .catch(() => setError('Failed to load progress.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProgress() }, [caseId])

  // Add progress
  const handleAdd = async () => {
    if (!addForm.message.trim()) { setAddError('Message is required.'); return }
    setAdding(true)
    setAddError('')
    try {
      await addCaseProgress(caseId, addForm)
      toast.success('Progress update added.')
      setAddForm({ message: '', statusSnapshot: '' })
      setShowAdd(false)
      fetchProgress()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add progress.'
      setAddError(msg)
      toast.error(msg)
    } finally {
      setAdding(false)
    }
  }

  // Edit progress
  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      await updateProgress(editEntry._id, { message: editMessage })
      toast.success('Progress update saved.')
      setEditEntry(null)
      fetchProgress()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save progress update.')
    } finally {
      setSaving(false)
    }
  }

  // Delete progress
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteProgress(deleteEntry._id)
      toast.success('Progress entry deleted.')
      setDeleteEntry(null)
      fetchProgress()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete progress entry.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      {canAdd && !showAdd && (
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Progress Update
        </Button>
      )}

      {/* Add form */}
      {showAdd && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            {addError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                <AlertCircle className="h-4 w-4" /> {addError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Progress Update</Label>
              <Textarea
                placeholder="Describe the progress made…"
                value={addForm.message}
                onChange={(e) => setAddForm((f) => ({ ...f, message: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status Snapshot <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Select value={addForm.statusSnapshot} onValueChange={(v) => setAddForm((f) => ({ ...f, statusSnapshot: v }))}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Current case status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CASE_STATUS).map((s) => (
                    <SelectItem key={s} value={s}>{CASE_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={adding}>
                {adding ? 'Saving…' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setAddError('') }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No progress updates yet.</p>
      ) : (
        <div className="mt-4">
          {entries.map((entry) =>
            editEntry?._id === entry._id ? (
              // Inline edit
              <div key={entry._id} className="flex gap-4 pb-6">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-primary mt-1 shrink-0" />
                  <div className="w-px flex-1 bg-border mt-1" />
                </div>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                      <Check className="h-3.5 w-3.5 mr-1" /> {saving ? 'Saving…' : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditEntry(null)}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <TimelineEntry
                key={entry._id}
                entry={entry}
                canModify={role === ROLES.INVESTIGATOR && entry.updatedBy?._id === user?._id}
                onEdit={(e) => { setEditEntry(e); setEditMessage(e.message) }}
                onDelete={setDeleteEntry}
              />
            )
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteEntry}
        onOpenChange={(v) => !v && setDeleteEntry(null)}
        title="Delete Progress Entry"
        description="This will permanently remove this progress update."
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}

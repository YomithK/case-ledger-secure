import { useEffect, useState } from 'react'
import { getSavedReports, createSavedReport, deleteSavedReport, downloadSavedReport } from '@/api/report.api'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2, BookMarked, AlertCircle, Download } from 'lucide-react'
import { REPORT_TYPES } from '@/utils/constants'

const REPORT_TYPE_LABELS = {
  DASHBOARD: 'Dashboard',
  CASE_ANALYTICS: 'Case Analytics',
  INVESTIGATOR: 'Investigator',
  EVIDENCE: 'Evidence',
  CUSTOM: 'Custom',
}

function CreateModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', description: '', reportType: REPORT_TYPES.CASE_ANALYTICS, startDate: '', endDate: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        reportType: form.reportType,
        filters: {
          ...(form.startDate && { startDate: form.startDate }),
          ...(form.endDate && { endDate: form.endDate }),
        },
      }
      await createSavedReport(payload)
      setForm({ name: '', description: '', reportType: REPORT_TYPES.CASE_ANALYTICS, startDate: '', endDate: '' })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Generate Report</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input placeholder="Report name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.reportType} onValueChange={(v) => setForm((f) => ({ ...f, reportType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(REPORT_TYPES).map((t) => (
                  <SelectItem key={t} value={t}>{REPORT_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>Start Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>End Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea placeholder="What does this report track?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Generating…' : 'Generate'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function SavedReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)

  const fetch = () => {
    setLoading(true)
    getSavedReports()
      .then((res) => setReports(res.data.data?.reports || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleDownloadReport = async (report) => {
    setDownloadingId(report._id)
    try {
      const res = await downloadSavedReport(report._id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('CSV download failed', err)
    } finally {
      setDownloadingId(null)
    }
  }

  useEffect(() => { fetch() }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteSavedReport(deleteItem._id)
      setDeleteItem(null)
      fetch()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Reports</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage saved report configurations</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> New Report
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <BookMarked className="h-8 w-8" />
          <p className="text-sm">No saved reports yet. Click &ldquo;New Report&rdquo; to create one.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <Card key={r._id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold truncate">{r.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{REPORT_TYPE_LABELS[r.reportType] || r.reportType}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive hover:text-destructive" onClick={() => setDeleteItem(r)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {r.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-xs"
                  disabled={downloadingId === r._id}
                  onClick={() => handleDownloadReport(r)}
                >
                  <Download className="h-3 w-3 mr-1.5" />
                  {downloadingId === r._id ? 'Downloading…' : 'Download CSV'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={fetch} />
      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(v) => !v && setDeleteItem(null)}
        title="Delete Saved Report"
        description={`Delete "${deleteItem?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}

import { useEffect, useState, lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const ProgressTimeline = lazy(() => import('@/pages/progress/ProgressTimeline'))
const EvidenceList = lazy(() => import('@/pages/evidence/EvidenceList'))
import {
  getCaseById, assignInvestigator, updateCaseStatus, deleteCase, assignVictim,
} from '@/api/case.api'
import { getAssignableUsers, getVictimUsers } from '@/api/ref.api'
import { useAuth } from '@/hooks/useAuth'
import {
  ROLES, CASE_STATUS, CASE_STATUS_LABELS, CASE_CATEGORY_LABELS, CASE_PRIORITY_LABELS,
  CONFIDENTIAL_LEVELS, VALID_STATUS_TRANSITIONS,
} from '@/utils/constants'
import StatusBadge from '@/components/shared/StatusBadge'
import PriorityBadge from '@/components/shared/PriorityBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { AlertCircle, ArrowLeft, Edit, UserCheck, RefreshCw, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

// ─── Assign Investigator Modal ───────────────────────────────────────────────

function AssignModal({ open, onClose, caseId, onSuccess }) {
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    getAssignableUsers({ role: ROLES.INVESTIGATOR })
      .then((res) => setUsers(res.data.data?.users || []))
      .catch(() => { })
  }, [open])

  const handleAssign = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await assignInvestigator(caseId, { investigatorId: selected })
      toast.success('Investigator assigned successfully.')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign investigator.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Investigator</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue placeholder="Select investigator" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              {users.map((u) => (
                <SelectItem key={u._id} value={u._id}>{u.name} — {u.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selected || loading}>
            {loading ? 'Assigning…' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Update Status Modal ─────────────────────────────────────────────────────

function StatusModal({ open, onClose, caseId, currentStatus, onSuccess }) {
  const [newStatus, setNewStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const nextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] || []

  const handleUpdate = async () => {
    if (!newStatus) return
    setLoading(true)
    try {
      await updateCaseStatus(caseId, { status: newStatus })
      toast.success('Case status updated successfully.')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Current: <StatusBadge status={currentStatus} />
          </div>
          <div className="space-y-1.5">
            <Label>New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {nextStatuses.length === 0
                  ? <SelectItem value="_none" disabled>No valid transitions</SelectItem>
                  : nextStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{CASE_STATUS_LABELS[s]}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={!newStatus || loading}>
            {loading ? 'Updating…' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Assign Victim Modal ─────────────────────────────────────────────────────

function AssignVictimModal({ open, onClose, caseId, onSuccess }) {
  const [mode, setMode] = useState('select') // 'select' | 'invite'
  const [victims, setVictims] = useState([])
  const [selected, setSelected] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || mode !== 'select') return
    getVictimUsers()
      .then((res) => setVictims(res.data.data?.users || []))
      .catch(() => { })
  }, [open, mode])

  const handleAssign = async () => {
    if (mode === 'select' && !selected) return
    if (mode === 'invite' && !inviteEmail) return
    setLoading(true)
    try {
      const payload = mode === 'select' ? { victimId: selected } : { inviteEmail }
      await assignVictim(caseId, payload)
      toast.success(mode === 'invite' ? 'Invitation sent to victim.' : 'Victim assigned successfully.')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign victim.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Victim</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant={mode === 'select' ? 'default' : 'outline'} onClick={() => setMode('select')}>
              From system
            </Button>
            <Button size="sm" variant={mode === 'invite' ? 'default' : 'outline'} onClick={() => setMode('invite')}>
              Invite by email
            </Button>
          </div>

          {mode === 'select' ? (
            <>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger>
                  <SelectValue placeholder="Select victim" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {victims.length === 0
                    ? <SelectItem value="_none" disabled>No victims found</SelectItem>
                    : victims.map((u) => (
                      <SelectItem key={u._id} value={u._id}>{u.name} — {u.email}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label>Victim Email</Label>
              <Input
                type="email"
                placeholder="victim@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">An invitation will be sent to register on the platform.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleAssign} disabled={loading || (mode === 'select' ? !selected : !inviteEmail)}>
            {loading ? 'Saving…' : mode === 'invite' ? 'Send Invite' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role, user } = useAuth()

  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [assignOpen, setAssignOpen] = useState(false)
  const [victimOpen, setVictimOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetch = () => {
    setLoading(true)
    getCaseById(id)
      .then((res) => setCaseData(res.data.data))
      .catch(() => setError('Failed to load case.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteCase(id)
      toast.success('Case deleted successfully.')
      navigate('/cases')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete case.')
      setDeleting(false)
    }
  }

  const isCaseClosed = caseData?.case?.status === CASE_STATUS.RESOLVED || caseData?.case?.status === CASE_STATUS.CLOSED
  const canEdit = role === ROLES.ADMIN || (role === ROLES.INVESTIGATOR && caseData?.assignedInvestigator?._id === user?._id)
  const canAssign = (role === ROLES.ADMIN || role === ROLES.NGO) && !isCaseClosed && !caseData?.case?.assignedInvestigator
  const canAssignVictim = (role === ROLES.ADMIN || role === ROLES.INVESTIGATOR) && !isCaseClosed && !caseData?.case?.victim
  const canUpdateStatus = role === ROLES.ADMIN || (role === ROLES.INVESTIGATOR && caseData?.assignedInvestigator?._id === user?._id)
  const canDelete = role === ROLES.ADMIN

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" /> {error || 'Case not found.'}
      </div>
    )
  }

  const case_data = caseData.case

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{case_data.title}</h1>
              <StatusBadge status={case_data.status} />
              <PriorityBadge priority={case_data.priority} />
            </div>
            <p className="text-muted-foreground text-xs mt-0.5 font-mono">{case_data.caseNumber}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap shrink-0">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/cases/${id}/edit`)}>
              <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
          )}
          {canAssign && (
            <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
              <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Assign Investigator
            </Button>
          )}
          {canAssignVictim && (
            <Button variant="outline" size="sm" onClick={() => setVictimOpen(true)}>
              <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Assign Victim
            </Button>
          )}
          {canUpdateStatus && VALID_STATUS_TRANSITIONS[case_data.status]?.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setStatusOpen(true)}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Status
            </Button>
          )}
          {canDelete && (
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                ['Category', CASE_CATEGORY_LABELS[case_data.category] || case_data.category],
                ['Priority', CASE_PRIORITY_LABELS[case_data.priority] || case_data.priority],
                ['Incident Date', case_data.incidentDate ? new Date(case_data.incidentDate).toLocaleDateString() : '—'],
                ['Location', case_data.location],
                ['Confidentiality', case_data.confidentialLevel],
                ['Reference #', case_data.caseReferenceNumber || '—'],
                ['Reported By', case_data.reportedBy?.name || '—'],
                ['Assigned To', case_data.assignedInvestigator?.name || 'Unassigned'],
                ['Victim', case_data.victim?.name || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right max-w-xs">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{case_data.description}</p>
            </CardContent>
          </Card>

          {case_data.relatedUsers?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Related Persons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {case_data.relatedUsers.map(({ user: u, role: r }) => (
                    <div key={u._id} className="flex items-center justify-between text-sm">
                      <span>{u.name} — {u.email}</span>
                      <span className="text-muted-foreground text-xs">{r}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Progress Tab — loaded lazily from ProgressTimeline */}
        <TabsContent value="progress" className="mt-4">
          <ProgressTab caseId={id} />
        </TabsContent>

        {/* Evidence Tab — loaded lazily from EvidenceTab */}
        <TabsContent value="evidence" className="mt-4">
          <EvidenceTab caseId={id} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)} caseId={id} onSuccess={fetch} />
      <AssignVictimModal open={victimOpen} onClose={() => setVictimOpen(false)} caseId={id} onSuccess={fetch} />
      <StatusModal open={statusOpen} onClose={() => setStatusOpen(false)} caseId={id} currentStatus={case_data.status} onSuccess={fetch} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Case"
        description="This will archive the case. This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}

function ProgressTab({ caseId }) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground py-4">Loading…</div>}>
      <ProgressTimeline caseId={caseId} />
    </Suspense>
  )
}

function EvidenceTab({ caseId }) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground py-4">Loading…</div>}>
      <EvidenceList caseId={caseId} />
    </Suspense>
  )
}

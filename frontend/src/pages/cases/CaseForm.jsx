import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCase, getCaseById, updateCase } from '@/api/case.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import {
  CASE_CATEGORIES, CASE_CATEGORY_LABELS, CASE_PRIORITY, CASE_PRIORITY_LABELS,
  CONFIDENTIAL_LEVELS,
} from '@/utils/constants'

export default function CaseForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: CASE_PRIORITY.MEDIUM,
    incidentDate: '',
    location: '',
    confidentialLevel: CONFIDENTIAL_LEVELS.INTERNAL,
    caseReferenceNumber: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getCaseById(id)
      .then((res) => {
        const c = res.data.data
        setForm({
          title: c.title || '',
          description: c.description || '',
          category: c.category || '',
          priority: c.priority || CASE_PRIORITY.MEDIUM,
          incidentDate: c.incidentDate ? c.incidentDate.split('T')[0] : '',
          location: c.location || '',
          confidentialLevel: c.confidentialLevel || CONFIDENTIAL_LEVELS.INTERNAL,
          caseReferenceNumber: c.caseReferenceNumber || '',
        })
      })
      .catch(() => setError('Failed to load case.'))
      .finally(() => setFetching(false))
  }, [id, isEdit])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSelect = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.category || !form.incidentDate || !form.location) {
      setError('Title, description, category, incident date and location are required.')
      return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await updateCase(id, form)
        toast.success('Case updated successfully.')
        navigate(`/cases/${id}`)
      } else {
        await createCase(form)
        toast.success('Case created successfully.')
        navigate('/cases')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save case.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Case' : 'New Case'}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{isEdit ? 'Update the case details' : 'Submit a new human rights case'}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Brief case title" value={form.title} onChange={handleChange} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Detailed description of the case…" value={form.description} onChange={handleChange} rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => handleSelect('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {Object.values(CASE_CATEGORIES).map((c) => (
                      <SelectItem key={c} value={c}>{CASE_CATEGORY_LABELS[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => handleSelect('priority', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(CASE_PRIORITY).map((p) => (
                      <SelectItem key={p} value={p}>{CASE_PRIORITY_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="incidentDate">Incident Date</Label>
                <Input id="incidentDate" name="incidentDate" type="date" value={form.incidentDate} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <Label>Confidentiality</Label>
                <Select value={form.confidentialLevel} onValueChange={(v) => handleSelect('confidentialLevel', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(CONFIDENTIAL_LEVELS).map((l) => (
                      <SelectItem key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Where did the incident occur?" value={form.location} onChange={handleChange} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="caseReferenceNumber">
                Reference Number <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input id="caseReferenceNumber" name="caseReferenceNumber" placeholder="External reference" value={form.caseReferenceNumber} onChange={handleChange} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create case'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

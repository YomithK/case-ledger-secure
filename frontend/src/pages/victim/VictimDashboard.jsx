import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAssociatedCases } from '@/api/case.api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  CASE_STATUS_COLORS,
  CASE_STATUS_LABELS,
  CASE_PRIORITY_COLORS,
  CASE_CATEGORY_LABELS,
} from '@/utils/constants'
import { FolderOpen, AlertCircle, ChevronRight } from 'lucide-react'

export default function VictimDashboard() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAssociatedCases({ limit: 20 })
      .then((res) => setCases(res.data.data?.cases || []))
      .catch(() => setError('Failed to load your cases.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Cases</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cases you are associated with as a victim
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <FolderOpen className="h-10 w-10" />
          <div className="text-center space-y-1">
            <p className="font-medium">No cases found</p>
            <p className="text-sm">You have not been assigned to any cases yet.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Card key={c._id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate(`/cases/${c._id}`)}>
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm font-semibold leading-snug truncate">{c.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.caseNumber}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CASE_STATUS_COLORS[c.status]}`}>
                      {CASE_STATUS_LABELS[c.status]}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CASE_PRIORITY_COLORS[c.priority]}`}>
                      {c.priority}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-5 pb-4">
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{CASE_CATEGORY_LABELS[c.category] || c.category}</span>
                  <div className="flex items-center gap-1">
                    <span>{c.location}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

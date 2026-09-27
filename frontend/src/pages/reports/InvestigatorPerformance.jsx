import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInvestigatorPerformance } from '@/api/report.api'
import { CASE_STATUS_LABELS } from '@/utils/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FolderOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function InvestigatorPerformance() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getInvestigatorPerformance(id)
      .then((res) => setData(res.data.data))
      .catch(() => setError('Failed to load performance data.'))
      .finally(() => setLoading(false))
  }, [id])

  const statusChartData = data?.casesByStatus
    ? Object.entries(data.casesByStatus).map(([k, v]) => ({
        name: CASE_STATUS_LABELS[k] || k, value: v,
      }))
    : []

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investigator Performance</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data?.investigator?.name || 'Loading…'}</p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Assigned', value: data?.totalCases, icon: FolderOpen },
          { label: 'Resolved', value: data?.resolvedCases, icon: CheckCircle },
          { label: 'Active', value: data?.activeCases, icon: TrendingUp },
          { label: 'Avg. Days to Resolve', value: data?.avgResolutionDays != null ? `${data.avgResolutionDays}d` : null, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value ?? '—'}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status breakdown chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cases by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-52 w-full" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent cases table */}
      {data?.recentCases?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentCases.map((c) => (
                <div key={c._id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{c.caseNumber}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {CASE_STATUS_LABELS[c.status] || c.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardSummary } from '@/api/report.api'
import { getCases } from '@/api/case.api'
import { ROLES, CASE_STATUS_LABELS, CASE_STATUS_COLORS, CASE_PRIORITY_COLORS, CASE_PRIORITY_LABELS } from '@/utils/constants'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { FolderOpen, Users, FileCheck, Clock, TrendingUp, AlertCircle } from 'lucide-react'

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']

function StatCard({ title, value, icon: Icon, description, loading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value ?? '—'}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Admin Dashboard ────────────────────────────────────────────────────────

function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboardSummary()
      .then((res) => setData(res.data.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  const statusChartData = data?.casesByStatus
    ? data.casesByStatus.map(({ status, count }) => ({
        name: CASE_STATUS_LABELS[status] || status,
        value: count,
      }))
    : []

  const priorityChartData = data?.casesByPriority
    ? data.casesByPriority.map(({ priority, count }) => ({
        name: CASE_PRIORITY_LABELS[priority] || priority,
        value: count,
      }))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">System overview</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Cases" value={data?.totalCases} icon={FolderOpen} loading={loading} />
        <StatCard title="Active Cases" value={data?.activeCases} icon={TrendingUp} loading={loading} description="Reported + Under Investigation" />
        <StatCard title="Total Users" value={data?.totalUsers} icon={Users} loading={loading} />
        <StatCard title="Evidence Files" value={data?.totalEvidence} icon={FileCheck} loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cases by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cases by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={priorityChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent cases */}
      {data?.recentCases?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Cases</CardTitle>
            <CardDescription>Latest 5 cases in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentCases.map((c) => (
                <div key={c._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-muted-foreground text-xs">{c.caseNumber}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CASE_STATUS_COLORS[c.status]}`}>
                    {CASE_STATUS_LABELS[c.status]}
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

// ─── NGO Dashboard ───────────────────────────────────────────────────────────

function NgoDashboard() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCases({ limit: 50 })
      .then((res) => setCases(res.data.data?.cases || res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const byStatus = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(byStatus).map(([name, value]) => ({
    name: CASE_STATUS_LABELS[name] || name,
    value,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your cases overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Cases" value={cases.length} icon={FolderOpen} loading={loading} />
        <StatCard title="Open Cases" value={cases.filter(c => ['REPORTED', 'UNDER_INVESTIGATION', 'EVIDENCE_COLLECTED'].includes(c.status)).length} icon={Clock} loading={loading} />
        <StatCard title="Resolved" value={cases.filter(c => c.status === 'RESOLVED').length} icon={FileCheck} loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cases by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <RecentCasesList cases={cases.slice(0, 5)} loading={loading} />
    </div>
  )
}

// ─── Investigator Dashboard ──────────────────────────────────────────────────

function InvestigatorDashboard() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCases({ limit: 50 })
      .then((res) => setCases(res.data.data?.cases || res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your assigned cases</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Assigned Cases" value={cases.length} icon={FolderOpen} loading={loading} />
        <StatCard title="In Progress" value={cases.filter(c => c.status === 'UNDER_INVESTIGATION').length} icon={Clock} loading={loading} />
        <StatCard title="Resolved" value={cases.filter(c => c.status === 'RESOLVED').length} icon={FileCheck} loading={loading} />
      </div>

      <RecentCasesList cases={cases.slice(0, 5)} loading={loading} />
    </div>
  )
}

// ─── User Dashboard ──────────────────────────────────────────────────────────

function UserDashboard() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('@/api/case.api').then(({ getAssociatedCases }) =>
      getAssociatedCases()
        .then((res) => setCases(res.data.data?.cases || res.data.data || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    )
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Cases you are associated with</p>
      </div>
      <StatCard title="Associated Cases" value={cases.length} icon={FolderOpen} loading={loading} />
      <RecentCasesList cases={cases.slice(0, 5)} loading={loading} />
    </div>
  )
}

// ─── Shared recent cases list ────────────────────────────────────────────────

function RecentCasesList({ cases, loading }) {
  if (loading) return <Skeleton className="h-32 w-full" />
  if (!cases.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Cases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {cases.map((c) => (
            <div key={c._id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-muted-foreground text-xs">{c.caseNumber}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CASE_STATUS_COLORS[c.status]}`}>
                {CASE_STATUS_LABELS[c.status]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Root export ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { role } = useAuth()

  if (role === ROLES.ADMIN) return <AdminDashboard />
  if (role === ROLES.NGO) return <NgoDashboard />
  if (role === ROLES.INVESTIGATOR) return <InvestigatorDashboard />
  return <UserDashboard />
}

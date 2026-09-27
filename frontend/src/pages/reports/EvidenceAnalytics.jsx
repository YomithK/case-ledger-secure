import { useEffect, useState } from 'react'
import { getEvidenceDistribution, getEvidenceVerificationRatio } from '@/api/report.api'
import { EVIDENCE_TYPE_LABELS } from '@/utils/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444']

export default function EvidenceAnalytics() {
  const navigate = useNavigate()
  const [distribution, setDistribution] = useState([])
  const [verification, setVerification] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getEvidenceDistribution(), getEvidenceVerificationRatio()])
      .then(([d, v]) => {
        const raw = d?.data?.data || {}
        setDistribution(
          Object.entries(raw).map(([k, val]) => ({ name: EVIDENCE_TYPE_LABELS[k] || k, value: val }))
        )
        setVerification(v?.data?.data || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const verificationData = verification
    ? [
        { name: 'Verified', value: verification.verified || 0 },
        { name: 'Unverified', value: verification.unverified || 0 },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evidence Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Distribution and verification breakdown</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Evidence by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {distribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Verification Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <>
                {verification && (
                  <div className="flex gap-4 mb-4 text-sm">
                    <div className="flex-1 rounded-lg bg-green-50 p-3 text-center">
                      <p className="text-2xl font-bold text-green-700">{verification.verified || 0}</p>
                      <p className="text-green-600 text-xs mt-0.5">Verified</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-2xl font-bold text-gray-600">{verification.unverified || 0}</p>
                      <p className="text-gray-500 text-xs mt-0.5">Unverified</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-2xl font-bold text-blue-700">
                        {verification.total > 0
                          ? `${Math.round((verification.verified / verification.total) * 100)}%`
                          : '—'}
                      </p>
                      <p className="text-blue-600 text-xs mt-0.5">Ratio</p>
                    </div>
                  </div>
                )}
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={verificationData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {verificationData.map((_, i) => <Cell key={i} fill={i === 0 ? '#22c55e' : '#94a3b8'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

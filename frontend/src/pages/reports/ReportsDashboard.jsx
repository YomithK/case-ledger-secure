import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart2, Users, FileCheck, FolderOpen, BookMarked } from 'lucide-react'

const cards = [
  {
    to: '/reports/cases',
    icon: FolderOpen,
    title: 'Case Analytics',
    description: 'Cases by status, priority, category, monthly and yearly trends',
    roles: [ROLES.ADMIN, ROLES.NGO],
  },
  {
    to: '/reports/evidence',
    icon: FileCheck,
    title: 'Evidence Analytics',
    description: 'Evidence type distribution and verification ratios',
    roles: [ROLES.ADMIN],
  },
  {
    to: '/reports/saved',
    icon: BookMarked,
    title: 'Saved Reports',
    description: 'Manage and reuse saved report configurations',
    roles: [ROLES.ADMIN],
  },
]

export default function ReportsDashboard() {
  const { role, user } = useAuth()
  const navigate = useNavigate()

  const visible = cards.filter((c) => c.roles.includes(role))

  // For investigators, show own performance card
  const showPerformance = role === ROLES.INVESTIGATOR

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Explore data and generate insights</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ to, icon: Icon, title, description }) => (
          <Card
            key={to}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(to)}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </div>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}

        {showPerformance && (
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(`/reports/investigators/${user._id}`)}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">My Performance</CardTitle>
              </div>
              <CardDescription>View your case resolution metrics and activity</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, FileText, Users, BarChart3, Lock, ArrowRight, Globe } from 'lucide-react'
import { getPublicCases } from '@/api/case.api'
import { CASE_STATUS_COLORS, CASE_PRIORITY_COLORS, CASE_STATUS_LABELS, CASE_CATEGORY_LABELS } from '@/utils/constants'

const FEATURES = [
  {
    icon: FileText,
    title: 'Case Management',
    description: 'Document, track, and manage human rights cases with structured workflows and status tracking.',
  },
  {
    icon: Users,
    title: 'Investigator Assignment',
    description: 'Assign dedicated investigators to cases and monitor their progress in real time.',
  },
  {
    icon: Shield,
    title: 'Evidence Collection',
    description: 'Securely upload and organise evidence files linked directly to each case.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Generate insightful reports on case outcomes, priorities, and investigator performance.',
  },
  {
    icon: Lock,
    title: 'Confidentiality Controls',
    description: 'Role-based access ensures sensitive information is only visible to authorised personnel.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [publicCases, setPublicCases] = useState([])
  const [casesLoading, setCasesLoading] = useState(true)

  useEffect(() => {
    getPublicCases({ limit: 6 })
      .then((res) => setPublicCases(res.data.data?.cases || []))
      .catch(() => {})
      .finally(() => setCasesLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">CaseLedger</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Log in
          </Button>
          <Button size="sm" onClick={() => navigate('/register')}>
            Get started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Shield className="h-3.5 w-3.5" />
            Human Rights Case Management
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Track every case.<br />Protect every voice.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            CaseLedger is a secure platform for NGOs and investigators to document human rights cases,
            manage evidence, and generate transparent accountability reports.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button size="lg" onClick={() => navigate('/register')}>
              Get started free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Log in
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center tracking-tight mb-12">
              Everything you need to manage cases effectively
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="bg-background rounded-xl border p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Public Cases */}
        <section className="py-20 px-6 border-t">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
                <Globe className="h-3.5 w-3.5" />
                Public Cases
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Publicly Available Cases</h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                These cases are accessible for research, awareness, and accountability. No account required.
              </p>
            </div>
            {casesLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-xl border bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : publicCases.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">No public cases available at this time.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {publicCases.map((c) => (
                  <div key={c._id} className="bg-background rounded-xl border p-5 space-y-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CASE_STATUS_COLORS[c.status]}`}>
                        {CASE_STATUS_LABELS[c.status]}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CASE_PRIORITY_COLORS[c.priority]}`}>
                        {c.priority}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">{c.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>{CASE_CATEGORY_LABELS[c.category] || c.category}</span>
                      <span>{c.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 px-6 text-center space-y-5">
          <h2 className="text-2xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            Join organisations already using CaseLedger to bring accountability and transparency to human rights work.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/register')}>
              Create an account
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Log in
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-5 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} CaseLedger. All rights reserved.
      </footer>
    </div>
  )
}

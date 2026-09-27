import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCases } from '@/api/case.api'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import {
  ROLES,
  CASE_STATUS,
  CASE_STATUS_LABELS,
  CASE_CATEGORIES,
  CASE_CATEGORY_LABELS,
  CASE_PRIORITY,
  CASE_PRIORITY_LABELS,
} from '@/utils/constants'
import StatusBadge from '@/components/shared/StatusBadge'
import PriorityBadge from '@/components/shared/PriorityBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, X, AlertCircle } from 'lucide-react'
import Pagination from '@/components/shared/Pagination'

const DEFAULT_PAGE_SIZE = 10

export default function CaseList() {
  const { role } = useAuth()
  const navigate = useNavigate()

  const [cases, setCases] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const debouncedSearch = useDebounce(search)

  const hasActiveFilters = search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL'

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setPriorityFilter('ALL')
    setCategoryFilter('ALL')
  }

  const fetchCases = useCallback(() => {
    setLoading(true)
    setError('')
    const params = {
      page,
      limit: pageSize,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(priorityFilter !== 'ALL' && { priority: priorityFilter }),
      ...(categoryFilter !== 'ALL' && { category: categoryFilter }),
    }
    getCases(params)
      .then((res) => {
        const d = res.data.data
        setCases(d?.cases || [])
        setTotal(d?.pagination?.totalCount || 0)
      })
      .catch(() => setError('Failed to load cases.'))
      .finally(() => setLoading(false))
  }, [page, pageSize, debouncedSearch, statusFilter, priorityFilter, categoryFilter])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, priorityFilter, categoryFilter, pageSize])

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total > 0 ? `${total} case${total !== 1 ? 's' : ''} found` : 'No cases found'}
          </p>
        </div>
        {role === ROLES.NGO && (
          <Button onClick={() => navigate('/cases/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Case
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.values(CASE_STATUS).map((s) => (
              <SelectItem key={s} value={s}>{CASE_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priorities</SelectItem>
            {Object.values(CASE_PRIORITY).map((p) => (
              <SelectItem key={p} value={p}>{CASE_PRIORITY_LABELS[p]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {Object.values(CASE_CATEGORIES).map((c) => (
              <SelectItem key={c} value={c}>{CASE_CATEGORY_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-3.5 w-3.5 mr-1" /> Clear filters
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Mobile: Card list */}
      <div className="md:hidden space-y-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          : cases.length === 0
          ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No cases found.</div>
          )
          : cases.map((c) => (
            <Card key={c._id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => navigate(`/cases/${c._id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-sm leading-snug line-clamp-2 flex-1">{c.title}</p>
                  <StatusBadge status={c.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{c.caseNumber}</span>
                  <PriorityBadge priority={c.priority} />
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>

      {/* Desktop: Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden lg:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: pageSize }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : cases.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No cases found.
                    </TableCell>
                  </TableRow>
                )
                : cases.map((c) => (
                  <TableRow
                    key={c._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/cases/${c._id}`)}
                  >
                    <TableCell className="font-mono text-xs">{c.caseNumber}</TableCell>
                    <TableCell className="font-medium max-w-56 truncate">{c.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {CASE_CATEGORY_LABELS[c.category] || c.category}
                    </TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={total}
        limit={pageSize}
        onPageChange={setPage}
        onLimitChange={setPageSize}
      />
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers } from '@/api/user.api'
import { useDebounce } from '@/hooks/useDebounce'
import { ROLES } from '@/utils/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, X, AlertCircle } from 'lucide-react'
import Pagination from '@/components/shared/Pagination'

const ROLE_COLORS = {
  [ROLES.ADMIN]: 'bg-purple-100 text-purple-800',
  [ROLES.NGO]: 'bg-blue-100 text-blue-800',
  [ROLES.INVESTIGATOR]: 'bg-orange-100 text-orange-800',
  [ROLES.USER]: 'bg-gray-100 text-gray-700',
}

const PAGE_SIZE = 10

export default function UserList() {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [activeFilter, setActiveFilter] = useState('ALL')

  const debouncedSearch = useDebounce(search)

  const hasActiveFilters = search || roleFilter !== 'ALL' || activeFilter !== 'ALL'

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('ALL')
    setActiveFilter('ALL')
  }

  const fetchUsers = useCallback(() => {
    setLoading(true)
    setError('')
    const params = {
      page,
      limit: pageSize,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(roleFilter !== 'ALL' && { type: roleFilter }),
      ...(activeFilter !== 'ALL' && { status: activeFilter.toLowerCase() }),
    }
    getUsers(params)
      .then((res) => {
        const d = res.data.data
        setUsers(d?.users || [])
        setTotal(d?.pagination?.totalCount || 0)
      })
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false))
  }, [page, pageSize, debouncedSearch, roleFilter, activeFilter])

  useEffect(() => { setPage(1) }, [debouncedSearch, roleFilter, activeFilter, pageSize])
  useEffect(() => { fetchUsers() }, [fetchUsers])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {total > 0 ? `${total} user${total !== 1 ? 's' : ''}` : 'No users found'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            {Object.values(ROLES).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
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
                : users.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No users found.</TableCell>
                  </TableRow>
                )
                : users.map((u) => (
                  <TableRow key={u._id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/users/${u._id}`)}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.organizationName || '—'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
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

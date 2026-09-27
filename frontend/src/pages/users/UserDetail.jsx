import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserById, updateUserRole, deleteUser } from '@/api/user.api'
import { ROLES } from '@/utils/constants'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft, ShieldCheck, UserX } from 'lucide-react'

const ROLE_COLORS = {
  [ROLES.ADMIN]: 'bg-purple-100 text-purple-800',
  [ROLES.NGO]: 'bg-blue-100 text-blue-800',
  [ROLES.INVESTIGATOR]: 'bg-orange-100 text-orange-800',
  [ROLES.USER]: 'bg-gray-100 text-gray-700',
}

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Role change
  const [newRole, setNewRole] = useState('')
  const [roleConfirmOpen, setRoleConfirmOpen] = useState(false)
  const [savingRole, setSavingRole] = useState(false)
  const [roleSuccess, setRoleSuccess] = useState(false)

  // Deactivate
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const fetch = () => {
    setLoading(true)
    getUserById(id)
      .then((res) => {
        const userData = res.data.data.user
        setUser(userData)
        setNewRole(userData.role)
      })
      .catch(() => setError('Failed to load user.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [id])

  const handleRoleChange = async () => {
    setSavingRole(true)
    try {
      await updateUserRole(id, { role: newRole })
      setRoleSuccess(true)
      setRoleConfirmOpen(false)
      fetch()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.')
    } finally {
      setSavingRole(false)
    }
  }

  const handleDeactivate = async () => {
    setDeactivating(true)
    try {
      await deleteUser(id)
      navigate('/users')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate user.')
      setDeactivating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" /> {error || 'User not found.'}
      </div>
    )
  }

  const fields = [
    ['Name', user.name],
    ['Email', user.email],
    ['Phone', user.phoneNumber || '—'],
    ['Organization', user.organizationName || '—'],
    ['Last Login', user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'],
    ['Joined', new Date(user.createdAt).toLocaleDateString()],
  ]

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
              {user.role}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {fields.map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Change role */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Change Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {roleSuccess && (
            <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
              Role updated successfully.
            </div>
          )}
          <div className="flex items-center gap-3">
            <Select value={newRole} onValueChange={(v) => { setNewRole(v); setRoleSuccess(false) }}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ROLES).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={newRole === user.role}
              onClick={() => setRoleConfirmOpen(true)}
            >
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deactivate */}
      {user.isActive && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <UserX className="h-4 w-4" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Deactivate user</p>
                <p className="text-xs text-muted-foreground">This will prevent the user from logging in.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setDeactivateOpen(true)}>
                Deactivate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ConfirmDialog
        open={roleConfirmOpen}
        onOpenChange={setRoleConfirmOpen}
        title="Change User Role"
        description={`Change ${user.name}'s role from ${user.role} to ${newRole}?`}
        onConfirm={handleRoleChange}
        loading={savingRole}
        confirmLabel="Change Role"
      />
      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title="Deactivate User"
        description={`Deactivate ${user.name}? They will no longer be able to log in.`}
        onConfirm={handleDeactivate}
        loading={deactivating}
        confirmLabel="Deactivate"
        destructive
      />
    </div>
  )
}

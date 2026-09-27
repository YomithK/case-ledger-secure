import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register as registerApi } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, EyeOff, Scale } from 'lucide-react'
import { ROLES } from '@/utils/constants'

const ROLE_OPTIONS = [
  { value: ROLES.NGO, label: 'NGO' },
  { value: ROLES.INVESTIGATOR, label: 'Investigator' },
  { value: ROLES.VICTIM, label: 'Victim' },
]

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.NGO,
    phoneNumber: '',
    organizationName: '',
    nic: '',
    dob: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleRoleChange = (value) => {
    setForm((prev) => ({ ...prev, role: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.role) {
      setError('Name, email, password, and role are required.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.role === ROLES.NGO && !form.organizationName) {
      setError('Organization name is required for NGO accounts.')
      return
    }
    if (form.role === ROLES.INVESTIGATOR && (!form.nic || !form.dob)) {
      setError('NIC and date of birth are required for Investigator accounts.')
      return
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      ...(form.phoneNumber && { phoneNumber: form.phoneNumber }),
      ...(form.role === ROLES.NGO && { organizationName: form.organizationName }),
      ...(form.role === ROLES.INVESTIGATOR && { nic: form.nic, dob: form.dob }),
    }

    setLoading(true)
    try {
      await registerApi(payload)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary text-primary-foreground">
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Case Ledger</h1>
          <p className="text-sm text-muted-foreground">Human Rights Case Management</p>
        </div>

        <Card>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>Fill in the details below to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Select value={form.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone (optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="0771234567"
                  value={form.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              {/* NGO: Organization Name */}
              {form.role === ROLES.NGO && (
                <div className="space-y-1.5">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    placeholder="Your NGO name"
                    value={form.organizationName}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Investigator: NIC + DOB */}
              {form.role === ROLES.INVESTIGATOR && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="nic">NIC Number</Label>
                    <Input
                      id="nic"
                      name="nic"
                      placeholder="123456789V or 200012345678"
                      value={form.nic}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={form.dob}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

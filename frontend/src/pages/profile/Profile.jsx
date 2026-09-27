import { useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { updateUser, uploadProfilePhoto } from '@/api/user.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ROLES } from '@/utils/constants'
import { Camera, User } from 'lucide-react'
import { toast } from 'sonner'

const ROLE_COLORS = {
  [ROLES.ADMIN]: 'bg-purple-100 text-purple-800 border border-purple-200',
  [ROLES.NGO]: 'bg-blue-100 text-blue-800 border border-blue-200',
  [ROLES.INVESTIGATOR]: 'bg-amber-100 text-amber-800 border border-amber-200',
  [ROLES.VICTIM]: 'bg-rose-100 text-rose-800 border border-rose-200',
  [ROLES.USER]: 'bg-gray-100 text-gray-700 border border-gray-200',
}

export default function Profile() {
  const { user, updateUserInContext } = useAuth()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    organizationName: user?.organizationName || '',
  })
  const [loading, setLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { name: form.name, phoneNumber: form.phoneNumber }
      if (user?.role === ROLES.NGO) payload.organizationName = form.organizationName
      const res = await updateUser(user._id, payload)
      updateUserInContext(res.data.data.user)
      toast.success('Profile updated successfully.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handlePhotoUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return
    setPhotoLoading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await uploadProfilePhoto(user._id, formData)
      updateUserInContext(res.data.data.user)
      setPhotoPreview(null)
      toast.success('Profile photo updated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.')
    } finally {
      setPhotoLoading(false)
    }
  }

  const currentPhoto = photoPreview || user?.profilePhoto

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">View and update your account details</p>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile Photo</CardTitle>
          <CardDescription>Upload a photo to personalise your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center">
                {currentPhoto ? (
                  <img src={currentPhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center shadow hover:opacity-90 transition-opacity"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 flex-1">
              <p className="text-sm text-muted-foreground">
                JPG, PNG or WebP · max 5 MB · auto-cropped to 400×400
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              {photoPreview && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handlePhotoUpload} disabled={photoLoading}>
                    {photoLoading ? 'Uploading…' : 'Save photo'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setPhotoPreview(null); fileInputRef.current.value = '' }}
                    disabled={photoLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Read-only info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account Information</CardTitle>
          <CardDescription>Your account details (read-only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[user?.role]}`}>
              {user?.role}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Editable info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Edit Profile</CardTitle>
          <CardDescription>Update your name and contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="0771234567"
                value={form.phoneNumber}
                onChange={handleChange}
              />
            </div>

            {user?.role === ROLES.NGO && (
              <div className="space-y-1.5">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  value={form.organizationName}
                  onChange={handleChange}
                />
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

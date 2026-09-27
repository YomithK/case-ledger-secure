import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  BarChart2,
  User,
  Scale,
  BookOpen,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.NGO, ROLES.INVESTIGATOR] },
  { to: '/my-cases', label: 'My Cases', icon: BookOpen, roles: [ROLES.VICTIM] },
  { to: '/cases', label: 'Cases', icon: FolderOpen, roles: [ROLES.ADMIN, ROLES.NGO, ROLES.INVESTIGATOR] },
  { to: '/users', label: 'Users', icon: Users, roles: [ROLES.ADMIN] },
  { to: '/reports', label: 'Reports', icon: BarChart2, roles: [ROLES.ADMIN, ROLES.NGO] },
  { to: '/profile', label: 'Profile', icon: User, roles: null },
]

export default function Sidebar({ onClose }) {
  const { role, user } = useAuth()

  const visible = navItems.filter(
    (item) => !item.roles || item.roles.includes(role),
  )

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <aside className="w-60 h-full bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between gap-2.5 px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-md bg-sidebar-foreground flex items-center justify-center shrink-0">
            <Scale className="h-4 w-4 text-sidebar" />
          </div>
          <span className="font-bold text-sidebar-foreground text-base tracking-tight">
            Case Ledger
          </span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.profilePhoto} alt={user?.name} />
            <AvatarFallback className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

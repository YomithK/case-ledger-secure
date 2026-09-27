import { CASE_PRIORITY_COLORS, CASE_PRIORITY_LABELS } from '@/utils/constants'
import { cn } from '@/lib/utils'

export default function PriorityBadge({ priority, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        CASE_PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700',
        className,
      )}
    >
      {CASE_PRIORITY_LABELS[priority] || priority}
    </span>
  )
}

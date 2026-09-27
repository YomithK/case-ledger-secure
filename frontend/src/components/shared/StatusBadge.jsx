import { CASE_STATUS_COLORS, CASE_STATUS_LABELS } from '@/utils/constants'
import { cn } from '@/lib/utils'

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        CASE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700',
        className,
      )}
    >
      {CASE_STATUS_LABELS[status] || status}
    </span>
  )
}

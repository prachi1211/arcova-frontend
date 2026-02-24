import { cn } from '@/lib/utils';
import type { BookingStatus, PropertyStatus } from '@/types';
import { BOOKING_STATUS_STYLES, PROPERTY_STATUS_STYLES } from '@/lib/constants';

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No Show',
  active: 'Active',
  inactive: 'Inactive',
  pending_review: 'Under Review',
};

interface StatusBadgeProps {
  status: BookingStatus | PropertyStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style =
    BOOKING_STATUS_STYLES[status as BookingStatus] ??
    PROPERTY_STATUS_STYLES[status as PropertyStatus] ??
    'bg-warm-100 text-warm-600 border border-warm-200';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        style,
        className,
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

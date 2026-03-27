import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-[#25293a] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[#e3e3db]/40" />
      </div>
      <h3 className="text-base font-semibold text-[#e3e3db]/80 mb-1">{title}</h3>
      <p className="text-sm text-[#e3e3db]/40 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

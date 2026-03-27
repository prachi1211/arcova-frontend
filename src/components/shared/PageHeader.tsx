import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6 md:mb-8', className)}>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-[#e3e3db]">{title}</h1>
        {description && (
          <p className="text-sm text-[#e3e3db]/45 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

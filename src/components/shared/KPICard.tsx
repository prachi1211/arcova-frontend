import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  trend?: number; // positive = up, negative = down, undefined = no trend
  trendLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function KPICard({ label, value, trend, trendLabel, icon: Icon, iconColor, className }: KPICardProps) {
  const hasTrend = trend !== undefined;
  const isPositive = (trend ?? 0) > 0;
  const isNeutral = trend === 0;

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-warm-200 p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-warm-500 uppercase tracking-wide">{label}</p>
        {Icon && (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconColor ?? 'bg-gold-100')}>
            <Icon size={16} className="text-gold-600" />
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-navy-950 tracking-tight">{value}</p>

      {hasTrend && (
        <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', isNeutral ? 'text-warm-500' : isPositive ? 'text-emerald-600' : 'text-red-500')}>
          {isNeutral ? <Minus size={12} /> : isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>
            {isPositive ? '+' : ''}{trend}%{trendLabel ? ` ${trendLabel}` : ' vs last month'}
          </span>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency } from '@/lib/utils';
import type { RevenuePoint } from '@/hooks/useAnalytics';

interface RevenueChartProps {
  data: RevenuePoint[];
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: RevenuePoint } | null>(null);

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-warm-400">
        No revenue data for this period
      </div>
    );
  }

  const W = 600;
  const H = 200;
  const PADDING = { top: 16, right: 16, bottom: 32, left: 56 };
  const chartW = W - PADDING.left - PADDING.right;
  const chartH = H - PADDING.top - PADDING.bottom;

  const maxVal = Math.max(...data.map((d) => d.grossRevenueCents), 1);
  const minVal = 0;

  const toX = (i: number) => PADDING.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const toY = (v: number) => PADDING.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const grossPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.grossRevenueCents)}`).join(' ');
  const netPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.netRevenueCents)}`).join(' ');

  const gridLines = 4;
  const formatLabel = (cents: number) => {
    if (cents >= 100000) return `$${(cents / 100000).toFixed(0)}k`;
    if (cents >= 100) return `$${(cents / 100).toFixed(0)}`;
    return '$0';
  };

  // Show every Nth date label
  const labelInterval = Math.ceil(data.length / 6);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-48"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid lines */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const v = minVal + (maxVal - minVal) * (i / gridLines);
          const y = toY(v);
          return (
            <g key={i}>
              <line x1={PADDING.left} y1={y} x2={W - PADDING.right} y2={y} stroke="#E8E8E0" strokeWidth="1" />
              <text x={PADDING.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#8A8A80">
                {formatLabel(v)}
              </text>
            </g>
          );
        })}

        {/* X axis labels */}
        {data.map((d, i) => {
          if (i % labelInterval !== 0 && i !== data.length - 1) return null;
          const label = d.date.slice(5); // MM-DD
          return (
            <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#8A8A80">
              {label}
            </text>
          );
        })}

        {/* Gross revenue line */}
        <path d={grossPath} fill="none" stroke="#D4A853" strokeWidth="2" strokeLinejoin="round" />

        {/* Net revenue line */}
        <path d={netPath} fill="none" stroke="#0F172A" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 2" />

        {/* Hover zones */}
        {data.map((d, i) => (
          <rect
            key={i}
            x={toX(i) - chartW / data.length / 2}
            y={PADDING.top}
            width={chartW / data.length}
            height={chartH}
            fill="transparent"
            onMouseEnter={(e) => {
              const rect = (e.target as SVGRectElement).closest('svg')?.getBoundingClientRect();
              if (rect) setTooltip({ x: toX(i), y: toY(d.grossRevenueCents), point: d });
            }}
          />
        ))}

        {/* Tooltip dot */}
        {tooltip && (
          <>
            <circle cx={tooltip.x} cy={toY(tooltip.point.grossRevenueCents)} r="4" fill="#D4A853" />
            <circle cx={tooltip.x} cy={toY(tooltip.point.netRevenueCents)} r="3" fill="#0F172A" />
          </>
        )}
      </svg>

      {/* Tooltip box */}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-navy-950 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10 whitespace-nowrap"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top: `${(tooltip.y / H) * 100}%`,
            transform: 'translate(-50%, -110%)',
          }}
        >
          <p className="font-medium mb-0.5">{tooltip.point.date}</p>
          <p className="text-gold-400">Gross: {formatCurrency(tooltip.point.grossRevenueCents)}</p>
          <p className="text-warm-300">Net: {formatCurrency(tooltip.point.netRevenueCents)}</p>
          <p className="text-warm-400">{tooltip.point.bookingCount} bookings</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 justify-end text-xs text-warm-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-0.5 bg-gold-500" /> Gross Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-0.5 bg-navy-950 opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(to right, #0F172A 0, #0F172A 4px, transparent 4px, transparent 6px)' }} /> Net Revenue
        </span>
      </div>
    </div>
  );
}

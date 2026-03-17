import { Skeleton } from '@/components/shared/LoadingSkeleton';
import type { OccupancyPoint } from '@/hooks/useAnalytics';

interface OccupancyChartProps {
  data: OccupancyPoint[];
  isLoading?: boolean;
}

export function OccupancyChart({ data, isLoading }: OccupancyChartProps) {
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-warm-400">
        No occupancy data
      </div>
    );
  }

  const W = 600;
  const H = 160;
  const PADDING = { top: 12, right: 8, bottom: 28, left: 32 };
  const chartW = W - PADDING.left - PADDING.right;
  const chartH = H - PADDING.top - PADDING.bottom;
  const barW = Math.max(2, (chartW / data.length) - 1);
  const THRESHOLD = 30; // 30% threshold line

  const toX = (i: number) => PADDING.left + (i / data.length) * chartW;
  const toBarH = (pct: number) => (pct / 100) * chartH;
  const thresholdY = PADDING.top + chartH - (THRESHOLD / 100) * chartH;

  // Label every 7th day
  const labelInterval = 7;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4A853" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D4A853" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Y-axis labels */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = PADDING.top + chartH - (pct / 100) * chartH;
        return (
          <text key={pct} x={PADDING.left - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#8A8A80">
            {pct}%
          </text>
        );
      })}

      {/* 30% threshold dashed line */}
      <line
        x1={PADDING.left}
        y1={thresholdY}
        x2={W - PADDING.right}
        y2={thresholdY}
        stroke="#D97706"
        strokeWidth="1"
        strokeDasharray="4 3"
        opacity="0.6"
      />

      {/* Bars */}
      {data.map((d, i) => {
        const bH = toBarH(d.occupancyPercent);
        const x = toX(i);
        const y = PADDING.top + chartH - bH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={bH}
              fill="url(#barGradient)"
              rx="1"
            />
          </g>
        );
      })}

      {/* X-axis date labels */}
      {data.map((d, i) => {
        if (i % labelInterval !== 0) return null;
        return (
          <text key={i} x={toX(i) + barW / 2} y={H - 4} textAnchor="middle" fontSize="8" fill="#8A8A80">
            {d.date.slice(5)}
          </text>
        );
      })}

      {/* Threshold label */}
      <text x={W - PADDING.right + 2} y={thresholdY + 3} fontSize="8" fill="#D97706" opacity="0.8">30%</text>
    </svg>
  );
}

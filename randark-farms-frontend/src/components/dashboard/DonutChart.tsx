import React, { useState } from 'react';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
  emptyMessage?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 160,
  thickness = 18,
  centerLabel,
  centerValue,
  emptyMessage = 'No data',
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const displayValue =
    hovered !== null ? data[hovered].value : centerValue ?? total;
  const displayLabel =
    hovered !== null ? data[hovered].label : centerLabel ?? 'Total';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={thickness}
            className="text-gray-100 dark:text-gray-800"
          />
          {data.map((slice, i) => {
            const pct = slice.value / total;
            const dash = pct * circumference;
            const isHovered = hovered === i;
            const el = (
              <circle
                key={slice.label}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHovered ? thickness + 4 : thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                transform="rotate(-90 50 50)"
                style={{
                  transition: 'stroke-width 250ms ease, opacity 250ms ease',
                  opacity: hovered === null || isHovered ? 1 : 0.4,
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {typeof displayValue === 'number'
              ? displayValue.toLocaleString()
              : displayValue}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gray-500 text-center max-w-[80px] truncate">
            {displayLabel}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-1.5">
        {data.map((slice, i) => {
          const pct = ((slice.value / total) * 100).toFixed(0);
          const isHovered = hovered === i;
          return (
            <div
              key={slice.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${
                isHovered
                  ? 'bg-gray-50 dark:bg-gray-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ background: slice.color }}
              />
              <span className="flex-1 truncate text-sm text-gray-700 dark:text-gray-300">
                {slice.label}
              </span>
              <span className="text-xs text-gray-500 tabular-nums">
                {pct}%
              </span>
              <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white min-w-[60px] text-right">
                {slice.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DonutChart;
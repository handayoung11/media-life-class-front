interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
  animate?: boolean;
}

export function DonutChart({
  slices,
  size = 180,
  thickness = 22,
  centerLabel,
  centerSub,
  animate = true,
}: DonutChartProps) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eef1ea"
          strokeWidth={thickness}
        />
        {slices.map((slice, i) => {
          const portion = slice.value / total;
          const dash = portion * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              style={
                animate
                  ? {
                      transition: 'stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1), stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)',
                    }
                  : undefined
              }
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      {(centerLabel || centerSub) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerLabel && (
            <span className="font-display text-2xl font-semibold text-sage-800">{centerLabel}</span>
          )}
          {centerSub && <span className="text-xs text-sage-500 mt-0.5">{centerSub}</span>}
        </div>
      )}
    </div>
  );
}

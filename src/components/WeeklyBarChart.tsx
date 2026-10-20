interface Bar {
  label: string;
  media: number;
  exercise: number;
  study: number;
  isToday?: boolean;
}

interface WeeklyBarChartProps {
  bars: Bar[];
  unit?: 'min' | 'hr';
}

const fmt = (min: number, unit: 'min' | 'hr') =>
  unit === 'hr' ? `${(min / 60).toFixed(1)}h` : `${min}m`;

export function WeeklyBarChart({ bars, unit = 'hr' }: WeeklyBarChartProps) {
  const max = Math.max(...bars.map((b) => b.media + b.exercise + b.study), 1);
  return (
    <div className="flex items-end justify-between gap-1.5 h-44 px-0.5">
      {bars.map((b, i) => {
        const total = b.media + b.exercise + b.study;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-semibold text-sage-600 whitespace-nowrap">
              {fmt(total, unit)}
            </span>
            <div className="flex w-full max-w-[34px] flex-col-reverse justify-start h-32 rounded-2xl overflow-hidden bg-sage-50">
              <Segment value={b.media} max={max} color="#c97b5a" />
              <Segment value={b.exercise} max={max} color="#5d8a52" />
              <Segment value={b.study} max={max} color="#7ba6c7" />
            </div>
            <span
              className={`text-[11px] ${b.isToday ? 'text-sage-800 font-bold' : 'text-sage-400'}`}
            >
              {b.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Segment({ value, max, color }: { value: number; max: number; color: string }) {
  const h = (value / max) * 100;
  return (
    <div
      style={{ height: `${h}%`, backgroundColor: color, minHeight: value > 0 ? 3 : 0 }}
      className="w-full transition-all duration-700"
    />
  );
}

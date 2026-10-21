import { Smartphone, Dumbbell, BookOpen, TrendingDown, Sparkles } from 'lucide-react';
import { DonutChart } from './DonutChart';
import { DayRecord, CATEGORY_META, mockUser } from '@/lib/types';

interface DashboardHomeProps {
  today: DayRecord | null;
  goalMediaMin: number;
}

export function DashboardHome({ today, goalMediaMin }: DashboardHomeProps) {
  const media = today?.mediaMin ?? 0;
  const exercise = today?.exerciseMin ?? 0;
  const study = today?.studyMin ?? 0;
  const total = media + exercise + study || 1;

  const reductionPct = Math.max(0, Math.round((1 - media / goalMediaMin) * 100));
  const overGoal = media > goalMediaMin;

  const slices = [
    { label: '미디어', value: media, color: CATEGORY_META.media.color },
    { label: '운동', value: exercise, color: CATEGORY_META.exercise.color },
    { label: '공부', value: study, color: CATEGORY_META.study.color },
  ];

  const greeting = '오늘도 빛나는 갓생';

  return (
    <div className="px-5 pt-6 pb-28 space-y-5 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-sage-400 font-medium">{greeting}</p>
          <h2 className="font-display text-xl font-semibold text-sage-800 mt-0.5">
            {mockUser.nickname}님
          </h2>
        </div>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-semibold shadow-soft"
          style={{ backgroundColor: mockUser.avatarColor }}
        >
          {mockUser.avatarInitial}
        </div>
      </header>

      <section className="card p-5 animate-scale-in">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-sage-800">오늘의 미라밸</h3>
            <p className="text-xs text-sage-400 mt-0.5">내가 기록한 시간 비율</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <Legend color={CATEGORY_META.media.color} label="미디어" />
            <Legend color={CATEGORY_META.exercise.color} label="운동" />
            <Legend color={CATEGORY_META.study.color} label="공부" />
          </div>
        </div>

        <div className="flex items-center justify-center mt-4">
          <DonutChart
            slices={slices}
            size={184}
            centerLabel={`${Math.round(total / 60)}h ${total % 60}m`}
            centerSub="총 기록 시간"
          />
        </div>
      </section>

      <section
        className={`rounded-3xl p-5 shadow-card border animate-slide-up ${
          overGoal
            ? 'bg-gradient-to-br from-accent-clay/15 to-cream-100 border-accent-clay/30'
            : 'bg-gradient-to-br from-sage-100 to-cream-100 border-sage-200'
        }`}
        style={{ animationDelay: '0.1s' }}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              overGoal ? 'bg-accent-clay/20 text-accent-clay' : 'bg-sage-500 text-white'
            }`}
          >
            {overGoal ? <Sparkles className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
          <div>
            {overGoal ? (
              <p className="font-display text-[17px] leading-snug font-semibold text-sage-800">
                오늘 목표보다 미디어를 {Math.round(media - goalMediaMin)}분 더 사용했어요.
                <br />
                <span className="text-sage-500 text-sm font-medium">
                  내일은 30분 덜어내 보면 어떨까요?
                </span>
              </p>
            ) : (
              <p className="font-display text-[17px] leading-snug font-semibold text-sage-800">
                오늘 미디어 사용을 {reductionPct}% 줄였습니다!
                <br />
                <span className="text-sage-500 text-sm font-medium">갓생 진행 중 🌿</span>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <SummaryCard
          icon={<Smartphone className="w-4 h-4" />}
          label="미디어"
          value={fmt(media)}
          sub={`/ ${Math.round(goalMediaMin / 60)}시간 목표`}
          tint={CATEGORY_META.media}
        />
        <SummaryCard
          icon={<Dumbbell className="w-4 h-4" />}
          label="운동"
          value={fmt(exercise)}
          sub="누적"
          tint={CATEGORY_META.exercise}
        />
        <SummaryCard
          icon={<BookOpen className="w-4 h-4" />}
          label="공부"
          value={fmt(study)}
          sub="누적"
          tint={CATEGORY_META.study}
        />
      </section>

      {today?.comment && (
        <section className="card p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-xs text-sage-400 mb-1">오늘의 한줄 코멘트</p>
          <p className="text-[15px] text-sage-700 leading-relaxed">"{today.comment}"</p>
        </section>
      )}
    </div>
  );
}

function fmt(min: number) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-sage-500">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tint: { color: string; light: string };
}) {
  return (
    <div className="card p-3.5 flex flex-col gap-1.5">
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: tint.light, color: tint.color }}
      >
        {icon}
      </div>
      <span className="text-[11px] text-sage-400 font-medium">{label}</span>
      <span className="font-display text-lg font-semibold text-sage-800 leading-none">{value}</span>
      <span className="text-[10px] text-sage-400">{sub}</span>
    </div>
  );
}

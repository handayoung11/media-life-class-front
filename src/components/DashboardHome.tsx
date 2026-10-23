import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Dumbbell,
  BookOpen,
  TrendingDown,
  Sparkles,
  AlertCircle,
  PenLine,
  Leaf,
} from 'lucide-react';
import { DonutChart } from './DonutChart';
import { WeeklyBarChart } from './WeeklyBarChart';
import { api } from '@/lib/api';
import { CATEGORY_META, DashboardResponse, DashboardRecentRecord, User, DayRecord } from '@/lib/types';

export function DashboardHome() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<DashboardResponse>('/miracle');
        if (!cancelled) {
          setData(res.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '대시보드 데이터를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="px-5 pt-6 pb-28 space-y-5 animate-fade-in">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-5 pt-6 pb-28 animate-fade-in">
        <div className="card p-6 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-accent-clay" />
          <p className="text-sm text-sage-600 font-medium">{error ?? '데이터가 없습니다.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-base h-10 px-5 bg-sage-600 text-white text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const user: User = data.user;
  const today: DashboardRecentRecord | null = data.today;
  const summary = data.summary;
  const goalMediaMin = summary.goalMediaMin || user.goalMediaMin || 120;
  const hasToday = !!today;

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

  const weekly = buildWeekly(data.recentRecords, data.weekly);
  const weeklyTotals = weekly.reduce(
    (a, w) => ({
      media: a.media + w.media,
      exercise: a.exercise + w.exercise,
      study: a.study + w.study,
    }),
    { media: 0, exercise: 0, study: 0 }
  );

  return (
    <div className="px-5 pt-6 pb-28 space-y-5 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-sage-400 font-medium">{greeting}</p>
          <h2 className="font-display text-xl font-semibold text-sage-800 mt-0.5">
            {user.nickname}님
          </h2>
        </div>
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user.nickname}
            className="w-11 h-11 rounded-2xl object-cover shadow-soft"
          />
        ) : (
          <div className="w-11 h-11 rounded-2xl bg-sage-200 flex items-center justify-center text-sage-500 font-semibold shadow-soft">
            {user.nickname.charAt(0)}
          </div>
        )}
      </header>

      {/* streak / total records summary */}
      <section className="grid grid-cols-2 gap-3 animate-slide-up">
        <MiniStat label="연속 기록" value={`${summary.streakDays}일`} tint="#5d8a52" />
        <MiniStat label="총 기록 수" value={`${summary.totalRecords}회`} tint="#7ba6c7" />
      </section>

      {hasToday ? (
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
      ) : (
        <EmptyTodayCard onRecord={() => navigate('/dashboard?tab=record')} />
      )}

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

      <section
        className="grid grid-cols-3 gap-3 animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      >
        <SummaryCard
          icon={<Smartphone className="w-4 h-4" />}
          label="미디어"
          value={hasToday ? fmt(media) : '--'}
          sub={`/ ${Math.round(goalMediaMin / 60)}시간 목표`}
          tint={CATEGORY_META.media}
        />
        <SummaryCard
          icon={<Dumbbell className="w-4 h-4" />}
          label="운동"
          value={hasToday ? fmt(exercise) : '--'}
          sub={hasToday ? '오늘' : '기록 없음'}
          tint={CATEGORY_META.exercise}
        />
        <SummaryCard
          icon={<BookOpen className="w-4 h-4" />}
          label="공부"
          value={hasToday ? fmt(study) : '--'}
          sub={hasToday ? '오늘' : '기록 없음'}
          tint={CATEGORY_META.study}
        />
      </section>

      {today?.comment && (
        <section className="card p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-xs text-sage-400 mb-1">오늘의 한줄 코멘트</p>
          <p className="text-[15px] text-sage-700 leading-relaxed">"{today.comment}"</p>
        </section>
      )}

      {data.recentRecords.length > 0 && (
        <section className="card p-4 animate-fade-in" style={{ animationDelay: '0.35s' }}>
          <h3 className="font-display text-sm font-semibold text-sage-800 mb-3">최근 기록</h3>
          <div className="space-y-2.5">
            {data.recentRecords.slice(0, 5).map((r) => (
              <div key={r.date} className="flex items-center justify-between text-xs">
                <span className="text-sage-500 font-medium">{r.date}</span>
                <span className="flex gap-2 text-sage-600">
                  <span style={{ color: CATEGORY_META.media.color }}>미디어 {r.mediaMin}m</span>
                  <span style={{ color: CATEGORY_META.exercise.color }}>운동 {r.exerciseMin}m</span>
                  <span style={{ color: CATEGORY_META.study.color }}>공부 {r.studyMin}m</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card p-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-base font-semibold text-sage-800">이번 주 누적 통계</h3>
            <p className="text-xs text-sage-400 mt-0.5">최근 7일 기록</p>
          </div>
        </div>
        <WeeklyBarChart bars={weekly} unit="hr" />
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-sage-50">
          <WeeklyTotal label="미디어" value={weeklyTotals.media} color={CATEGORY_META.media.color} />
          <WeeklyTotal label="운동" value={weeklyTotals.exercise} color={CATEGORY_META.exercise.color} />
          <WeeklyTotal label="공부" value={weeklyTotals.study} color={CATEGORY_META.study.color} />
        </div>
      </section>
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

function MiniStat({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div className="card p-3.5 flex items-center gap-3">
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display text-sm font-semibold"
        style={{ backgroundColor: tint }}
      >
        {value.charAt(0)}
      </span>
      <div>
        <p className="text-[11px] text-sage-400 font-medium">{label}</p>
        <p className="font-display text-base font-semibold text-sage-800">{value}</p>
      </div>
    </div>
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

function DashboardSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-sage-100 rounded" />
          <div className="h-5 w-28 bg-sage-100 rounded" />
        </div>
        <div className="w-11 h-11 rounded-2xl bg-sage-100" />
      </div>
      <div className="card p-5 animate-pulse">
        <div className="h-4 w-32 bg-sage-100 rounded mb-4" />
        <div className="w-44 h-44 mx-auto rounded-full bg-sage-50" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-3.5 h-24 animate-pulse bg-sage-50" />
        ))}
      </div>
    </>
  );
}

function EmptyTodayCard({ onRecord }: { onRecord: () => void }) {
  return (
    <section
      className="rounded-3xl p-6 shadow-card border bg-gradient-to-br from-sage-50 to-cream-100 border-sage-200 animate-scale-in flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sage-300 to-sage-500 shadow-soft flex items-center justify-center mb-4">
        <Leaf className="w-8 h-8 text-white" strokeWidth={1.6} />
      </div>
      <h3 className="font-display text-lg font-semibold text-sage-800">
        오늘의 기록이 아직 없어요
      </h3>
      <p className="mt-2 text-sm text-sage-500 leading-relaxed max-w-[16rem]">
        지금 기록하면 오늘의 미라밸 차트가 채워져요. 첫 기록으로 갓생을 시작해 보세요!
      </p>
      <button
        onClick={onRecord}
        className="btn-base mt-5 h-12 px-6 bg-gradient-to-br from-sage-500 to-sage-600 text-white text-sm shadow-soft hover:brightness-[1.04]"
      >
        <PenLine className="w-4 h-4" />
        기록하러 가기
      </button>
    </section>
  );
}

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

function WeeklyTotal({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full mb-1"
        style={{ backgroundColor: color }}
      />
      <p className="text-[11px] text-sage-400">{label}</p>
      <p className="font-display text-base font-semibold text-sage-800">
        {Math.floor(value / 60)}h {value % 60}m
      </p>
    </div>
  );
}

function buildWeekly(
  records: DayRecord[],
  weekly: { date: string; media: number; exercise: number; study: number }[] | undefined
) {
  if (weekly && weekly.length > 0) {
    return weekly.map((w, i) => ({
      label: WEEKDAYS[i % 7],
      media: w.media,
      exercise: w.exercise,
      study: w.study,
      isToday: i === (new Date().getDay() + 6) % 7,
    }));
  }

  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - todayIdx);

  const byDate = new Map(records.map((r) => [r.date, r]));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const r = byDate.get(key);
    return {
      label: WEEKDAYS[i],
      media: r?.mediaMin ?? 0,
      exercise: r?.exerciseMin ?? 0,
      study: r?.studyMin ?? 0,
      isToday: i === todayIdx,
    };
  });
}

import { useEffect, useState } from 'react';
import { Target, Pencil, Check, LogOut, Settings, ChevronRight, AlertCircle } from 'lucide-react';
import { WeeklyBarChart } from './WeeklyBarChart';
import { api } from '@/lib/api';
import {
  DayRecord,
  User,
  CATEGORY_META,
  DashboardResponse,
} from '@/lib/types';

interface MyPageProps {
  onLogout: () => void;
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export function MyPage({ onLogout }: MyPageProps) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [goalH, setGoalH] = useState('2');
  const [goalM, setGoalM] = useState('0');
  const [savingGoal, setSavingGoal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get<DashboardResponse>('/miracle');
      setData(res.data);
      const goal = res.data.summary.goalMediaMin || res.data.user.goalMediaMin || 120;
      setGoalH(String(Math.floor(goal / 60)));
      setGoalM(String(goal % 60));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '내 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveGoal = async () => {
    const m = (parseInt(goalH || '0', 10) || 0) * 60 + (parseInt(goalM || '0', 10) || 0);
    const goal = Math.max(15, m);
    try {
      setSavingGoal(true);
      await api.put('/api/user/goal', { goalMediaMin: goal });
      setData((prev) =>
        prev
          ? {
              ...prev,
              summary: { ...prev.summary, goalMediaMin: goal },
              user: { ...prev.user, goalMediaMin: goal },
            }
          : prev
      );
      setEditing(false);
    } catch {
      setError('목표 저장에 실패했습니다.');
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) {
    return (
      <div className="px-5 pt-6 pb-28 animate-fade-in space-y-5">
        <div className="h-6 w-24 bg-sage-100 rounded animate-pulse" />
        <div className="card p-5 h-24 animate-pulse bg-sage-50" />
        <div className="card p-5 h-48 animate-pulse bg-sage-50" />
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
            onClick={fetchData}
            className="btn-base h-10 px-5 bg-sage-600 text-white text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const user: User = data.user;
  const records: DayRecord[] = data.recentRecords.map((r) => ({
    date: r.date,
    mediaMin: r.mediaMin,
    exerciseMin: r.exerciseMin,
    studyMin: r.studyMin,
    comment: r.comment,
  }));
  const goalMediaMin = data.summary.goalMediaMin || user.goalMediaMin || 120;

  const weekly = buildWeekly(records, data.weekly);
  const totals = weekly.reduce(
    (a, w) => ({
      media: a.media + w.media,
      exercise: a.exercise + w.study,
      study: a.study + w.study,
    }),
    { media: 0, exercise: 0, study: 0 }
  );

  return (
    <div className="px-5 pt-6 pb-28 animate-fade-in space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-sage-800">마이페이지</h2>
        <Settings className="w-5 h-5 text-sage-400" />
      </header>

      <section className="card p-5 flex items-center gap-4 animate-scale-in">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center text-white text-xl font-semibold shadow-soft"
          style={{ backgroundColor: user.avatarColor }}
        >
          {user.avatarInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg font-semibold text-sage-800 truncate">
            {user.nickname}
          </p>
          <p className="text-xs text-sage-400 truncate">{user.email}</p>
          <span className="inline-flex items-center gap-1 mt-1.5 rounded-full bg-sage-100 px-2.5 py-0.5 text-[11px] font-medium text-sage-700">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
            미라클 클럽 멤버
          </span>
        </div>
      </section>

      <section className="card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-base font-semibold text-sage-800">이번 주 누적 통계</h3>
            <p className="text-xs text-sage-400 mt-0.5">최근 7일 기록</p>
          </div>
        </div>
        <WeeklyBarChart bars={weekly} unit="hr" />
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-sage-50">
          <WeeklyTotal label="미디어" value={totals.media} color={CATEGORY_META.media.color} />
          <WeeklyTotal label="운동" value={totals.exercise} color={CATEGORY_META.exercise.color} />
          <WeeklyTotal label="공부" value={totals.study} color={CATEGORY_META.study.color} />
        </div>
      </section>

      <section className="card p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center">
            <Target className="w-4 h-4" />
          </span>
          <h3 className="font-display text-base font-semibold text-sage-800">나의 미라밸 목표</h3>
        </div>

        {editing ? (
          <div className="space-y-3">
            <p className="text-xs text-sage-500">하루 미디어 사용 제한 시간</p>
            <div className="flex items-center gap-2">
              <NumberBox value={goalH} onChange={setGoalH} max={12} label="시" />
              <NumberBox value={goalM} onChange={setGoalM} max={59} label="분" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveGoal}
                disabled={savingGoal}
                className="btn-base flex-1 h-11 bg-sage-600 text-white text-sm"
              >
                {savingGoal ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" /> 저장
                  </>
                )}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="btn-base flex-1 h-11 bg-sage-50 text-sage-600 text-sm"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full flex items-center justify-between rounded-2xl bg-sage-50 px-4 py-3.5 no-tap-highlight hover:bg-sage-100 transition"
          >
            <div className="text-left">
              <p className="text-xs text-sage-400">하루 미디어 제한</p>
              <p className="font-display text-lg font-semibold text-sage-800 mt-0.5">
                {Math.floor(goalMediaMin / 60)}시간 {goalMediaMin % 60}분
              </p>
            </div>
            <Pencil className="w-4 h-4 text-sage-400" />
          </button>
        )}
      </section>

      <button
        onClick={onLogout}
        className="btn-base w-full h-13 py-3.5 bg-white text-error-600 border border-error-500/20 text-sm hover:bg-error-500/5 animate-fade-in"
        style={{ animationDelay: '0.3s' }}
      >
        <LogOut className="w-4 h-4" />
        로그아웃
      </button>

      <div className="flex items-center justify-center gap-1 pt-1 text-[11px] text-sage-300">
        Miracle: Media Life Class · v1.0
        <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  );
}

function NumberBox({
  value,
  onChange,
  max,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  max: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 rounded-2xl bg-white border border-sage-200 px-3 py-2.5 text-center text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
      />
      <span className="text-sm text-sage-500 font-medium">{label}</span>
    </div>
  );
}

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
      label: DAYS[i % 7],
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
      label: DAYS[i],
      media: r?.mediaMin ?? 0,
      exercise: r?.exerciseMin ?? 0,
      study: r?.studyMin ?? 0,
      isToday: i === todayIdx,
    };
  });
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BookOpen, Dumbbell, Heart, ImageOff, Smartphone } from 'lucide-react';
import { DonutChart } from './DonutChart';
import { api } from '@/lib/api';
import { CATEGORY_META, FeedDetail } from '@/lib/types';
import { profileImageUrl } from '@/lib/user-context';

export function FeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<FeedDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await api.get<FeedDetail>(`/miracle/${id}`);
        if (cancelled) return;
        if (!res.data || typeof res.data.id !== 'number') {
          throw new Error('기록 정보를 읽을 수 없어요.');
        }
        setDetail(res.data);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setDetail(null);
          setError(err instanceof Error ? err.message : '기록을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  return (
    <div className="min-h-screen flex items-stretch justify-center bg-[#eef1ea]">
      <div className="app-shell">
        <main className="px-4 pt-6 pb-12 animate-fade-in">
          <header className="flex items-center gap-3 mb-5">
            <button
              onClick={() => navigate('/dashboard?tab=club')}
              aria-label="피드로 돌아가기"
              className="w-10 h-10 rounded-2xl bg-white border border-sage-100 shadow-soft flex items-center justify-center text-sage-600 transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-semibold text-sage-800 leading-tight">기록 상세</h1>
              <p className="text-xs text-sage-400 mt-0.5">Miracle Club</p>
            </div>
          </header>

          {loading && <DetailSkeleton />}

          {!loading && error && (
            <div className="card p-6 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-8 h-8 text-accent-clay" />
              <p className="text-sm text-sage-600 font-medium">{error}</p>
              <button
                onClick={() => setAttempt((a) => a + 1)}
                className="btn-base h-10 px-5 bg-sage-600 text-white text-sm"
              >
                다시 시도
              </button>
            </div>
          )}

          {!loading && !error && detail && <DetailContent detail={detail} />}
        </main>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="card h-16 animate-pulse bg-sage-50" />
      <div className="card h-72 animate-pulse bg-sage-50" />
      <div className="card h-40 animate-pulse bg-sage-50" />
    </div>
  );
}

function DetailContent({ detail }: { detail: FeedDetail }) {
  const total = detail.mediaMin + detail.exerMin + detail.studyMin;
  const photoUrl = profileImageUrl(detail.mediaPic);

  const slices = [
    { label: '미디어', value: detail.mediaMin, color: CATEGORY_META.media.color },
    { label: '운동', value: detail.exerMin, color: CATEGORY_META.exercise.color },
    { label: '공부', value: detail.studyMin, color: CATEGORY_META.study.color },
  ];

  const categories = [
    {
      key: 'media',
      label: '미디어',
      Icon: Smartphone,
      detail: detail.media,
      minutes: detail.mediaMin,
      color: CATEGORY_META.media.color,
      light: CATEGORY_META.media.light,
    },
    {
      key: 'exercise',
      label: '운동',
      Icon: Dumbbell,
      detail: detail.exer,
      minutes: detail.exerMin,
      color: CATEGORY_META.exercise.color,
      light: CATEGORY_META.exercise.light,
    },
    {
      key: 'study',
      label: '공부',
      Icon: BookOpen,
      detail: detail.study,
      minutes: detail.studyMin,
      color: CATEGORY_META.study.color,
      light: CATEGORY_META.study.light,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          {detail.avatarUrl ? (
            <img
              src={profileImageUrl(detail.avatarUrl) || ''}
              alt={detail.author}
              className="w-10 h-10 rounded-xl object-cover shadow-soft"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-sage-400">
              {detail.author.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sage-800 leading-none truncate">{detail.author}</p>
            <p className="text-[11px] text-sage-400 mt-1">{detail.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sage-500 shrink-0">
          <Heart className={`w-4 h-4 ${detail.liked ? 'fill-accent-clay text-accent-clay' : ''}`} />
          <span className="text-xs font-medium">응원 {detail.likes}</span>
        </div>
      </div>

      <section className="card overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt="스크린타임 사진" className="w-full max-h-96 object-cover" />
        ) : (
          <div className="h-40 flex flex-col items-center justify-center gap-2 bg-sage-50 text-sage-400">
            <ImageOff className="w-6 h-6" />
            <p className="text-xs">사진 없이 기록했어요</p>
          </div>
        )}
      </section>

      <section className="card p-5 flex flex-col items-center gap-4">
        <DonutChart slices={slices} size={160} thickness={18} animate />
        <span className="font-display text-base font-semibold text-sage-800">
          총 {Math.floor(total / 60)}시간 {total % 60}분
        </span>
      </section>

      <section className="card divide-y divide-sage-50">
        {categories.map(({ key, label, Icon, detail: name, minutes, color, light }) => (
          <div key={key} className="flex items-center gap-3 p-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: light, color }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium" style={{ color }}>
                {label}
              </p>
              <p className="text-sm text-sage-800 truncate">{name || '항목 미입력'}</p>
            </div>
            <span className="font-display text-sm font-semibold text-sage-700 shrink-0">{minutes}분</span>
          </div>
        ))}
      </section>

      {detail.memo && (
        <section className="card p-4">
          <p className="text-xs font-medium text-sage-400 mb-2">오늘의 한마디</p>
          <p className="text-sm leading-relaxed text-sage-700 whitespace-pre-line">{detail.memo}</p>
        </section>
      )}

      <Link
        to="/dashboard?tab=club"
        className="block text-center text-xs text-sage-500 py-2 hover:text-sage-700 transition"
      >
        피드로 돌아가기
      </Link>
    </div>
  );
}

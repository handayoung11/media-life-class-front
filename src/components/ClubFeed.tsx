import { useEffect, useState } from 'react';
import { Heart, Send, MoreHorizontal, AlertCircle } from 'lucide-react';
import { DonutChart } from './DonutChart';
import { api } from '@/lib/api';
import { FeedPost, CATEGORY_META, Comment } from '@/lib/types';

export function ClubFeed() {
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<FeedPost[]>('/api/feed');
        if (!cancelled) {
          setFeed(res.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : '피드를 불러오지 못했습니다.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLike = (id: string) => {
    setFeed((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
    api.post(`/api/feed/${id}/like`).catch(() => {
      setFeed((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
        )
      );
    });
  };

  const handleComment = (id: string, text: string) => {
    setFeed((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, comments: [...p.comments, { id: `cm-${Date.now()}`, author: '나', text }] }
          : p
      )
    );
    api.post(`/api/feed/${id}/comments`, { text }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-28 animate-fade-in">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-4 h-64 animate-pulse bg-sage-50" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-6 pb-28 animate-fade-in">
        <div className="card p-6 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-accent-clay" />
          <p className="text-sm text-sage-600 font-medium">{error}</p>
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

  if (feed.length === 0) {
    return (
      <div className="px-4 pt-6 pb-28 animate-fade-in">
        <div className="card p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-sage-500 font-medium">아직 피드에 게시물이 없어요.</p>
          <p className="text-xs text-sage-400">오늘의 기록을 남기면 피드에 공유돼요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-28 animate-fade-in">
      <header className="mb-4 px-1">
        <h2 className="font-display text-xl font-semibold text-sage-800">미라클 클럽 피드</h2>
        <p className="text-xs text-sage-400 mt-0.5">함께 기적을 만드는 사람들</p>
      </header>

      <div className="space-y-4">
        {feed.map((post) => (
          <FeedCard
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
            onComment={(text) => handleComment(post.id, text)}
          />
        ))}
      </div>
    </div>
  );
}

function FeedCard({
  post,
  onLike,
  onComment,
}: {
  post: FeedPost;
  onLike: () => void;
  onComment: (text: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const slices = [
    { label: '미디어', value: post.mediaMin, color: CATEGORY_META.media.color },
    { label: '운동', value: post.exerciseMin, color: CATEGORY_META.exercise.color },
    { label: '공부', value: post.studyMin, color: CATEGORY_META.study.color },
  ];
  const total = post.mediaMin + post.exerciseMin + post.studyMin;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    onComment(t);
    setDraft('');
  };

  return (
    <article className="card overflow-hidden animate-scale-in">
      <div className="flex items-center justify-between p-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: post.avatarColor }}
          >
            {post.avatarInitial}
          </div>
          <div>
            <p className="text-sm font-semibold text-sage-800 leading-none">{post.author}</p>
            <p className="text-[11px] text-sage-400 mt-1">{post.timeAgo}</p>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-sage-300" />
      </div>

      <div className="px-3 pb-3">
        <div className="rounded-2xl bg-gradient-to-br from-sage-50 to-cream-100 p-4 flex flex-col items-center gap-3">
          <DonutChart slices={slices} size={150} thickness={18} animate={false} />
          <div className="flex gap-3 text-[11px]">
            <Stat label="미디어" value={`${post.mediaMin}m`} color={CATEGORY_META.media.color} />
            <Stat label="운동" value={`${post.exerciseMin}m`} color={CATEGORY_META.exercise.color} />
            <Stat label="공부" value={`${post.studyMin}m`} color={CATEGORY_META.study.color} />
          </div>
          <div className="text-center">
            <span className="font-display text-base font-semibold text-sage-800">
              총 {Math.round(total / 60)}시간 {total % 60}분
            </span>
          </div>
        </div>
      </div>

      <div className="px-3.5 pb-2">
        <p className="text-[13px] leading-relaxed text-sage-700">{post.caption}</p>
      </div>

      <div className="flex items-center justify-between px-3.5 py-2 border-t border-sage-50">
        <button onClick={onLike} className="flex items-center gap-1.5 no-tap-highlight group">
          <Heart
            className={`w-5 h-5 transition-all ${
              post.liked
                ? 'fill-accent-clay text-accent-clay scale-110'
                : 'text-sage-400 group-hover:text-accent-clay'
            }`}
          />
          <span
            className={`text-xs font-medium ${post.liked ? 'text-accent-clay' : 'text-sage-500'}`}
          >
            응원 {post.likes}
          </span>
        </button>
      </div>

      <div className="px-3.5 pb-3.5 space-y-2">
        {post.comments.length > 0 && (
          <div className="space-y-1.5">
            {post.comments.map((c) => (
              <CommentRow key={c.id} c={c} />
            ))}
          </div>
        )}
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="따뜻한 댓글 남기기..."
            maxLength={60}
            className="flex-1 rounded-full bg-sage-50 border border-sage-100 px-4 py-2 text-[13px] text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="w-9 h-9 rounded-full bg-sage-600 text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </article>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span className="flex items-center gap-1 text-sage-500">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label} {value}
    </span>
  );
}

function CommentRow({ c }: { c: Comment }) {
  return (
    <p className="text-[12px] text-sage-600 leading-relaxed">
      <span className="font-semibold text-sage-700">{c.author}</span> {c.text}
    </p>
  );
}

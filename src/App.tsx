import { useCallback, useEffect, useState } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { TabBar, TabKey } from '@/components/TabBar';
import { DashboardHome } from '@/components/DashboardHome';
import { RecordForm } from '@/components/RecordForm';
import { ClubFeed } from '@/components/ClubFeed';
import { MyPage } from '@/components/MyPage';
import { Loader2 } from 'lucide-react';
import { DayRecord, FeedPost, User, todayKey } from '@/lib/types';
import {
  LoginProvider,
  addFeedComment,
  createFeedPostFromRecord,
  fetchFeed,
  fetchRecords,
  loginWithProvider,
  logout as apiLogout,
  restoreSession,
  submitRecord,
  toggleFeedLike,
  updateGoalMediaMin,
} from '@/lib/api';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [provider, setProvider] = useState<LoginProvider | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<TabKey>('home');

  const [records, setRecords] = useState<DayRecord[]>([]);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 세션 복원
  useEffect(() => {
    (async () => {
      try {
        const restored = await restoreSession();
        if (restored && restored.user) {
          setUser(restored.user);
          setProvider(restored.provider);
          setLoggedIn(true);
        }
      } catch {
        // 무시
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  // 로그인 후 데이터 로딩
  const loadAll = useCallback(async (u: User) => {
    setLoadingData(true);
    setError(null);
    try {
      const [recs, posts] = await Promise.all([fetchRecords(u.id), fetchFeed(u.id)]);
      setRecords(recs);
      setFeed(posts);
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터를 불러오지 못했어요');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn && user) {
      loadAll(user);
    }
  }, [loggedIn, user, loadAll]);

  const today = records.find((r) => r.date === todayKey()) ?? null;

  const handleLogin = async (p: LoginProvider) => {
    setError(null);
    try {
      const result = await loginWithProvider(p);
      if (result.user) {
        setUser(result.user);
        setProvider(result.provider);
        setLoggedIn(true);
      } else {
        // 게스트 — 인증 없이 진입, 빈 데이터
        setProvider('guest');
        setLoggedIn(true);
      }
      setTab('home');
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했어요');
    }
  };

  const handleLogout = async () => {
    await apiLogout();
    setUser(null);
    setProvider(null);
    setLoggedIn(false);
    setRecords([]);
    setFeed([]);
    setTab('home');
  };

  const handleSubmitRecord = async (rec: DayRecord) => {
    if (!user) return;
    try {
      const merged = await submitRecord(user.id, rec);
      setRecords((prev) => {
        const idx = prev.findIndex((r) => r.date === merged.date);
        const next = [...prev];
        if (idx >= 0) next[idx] = merged;
        else next.push(merged);
        return next;
      });
      // 피드에도 게시
      await createFeedPostFromRecord(user, rec);
      const posts = await fetchFeed(user.id);
      setFeed(posts);
    } catch (e) {
      setError(e instanceof Error ? e.message : '기록 저장에 실패했어요');
    }
  };

  const handleLike = async (id: string) => {
    if (!user) return;
    const post = feed.find((p) => p.id === id);
    if (!post) return;
    // 낙관적 업데이트
    setFeed((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    try {
      await toggleFeedLike(id, user.id, post.liked);
    } catch {
      // 롤백
      setFeed((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, liked: post.liked, likes: post.likes }
            : p
        )
      );
    }
  };

  const handleComment = async (id: string, text: string) => {
    if (!user) return;
    // 낙관적 업데이트
    setFeed((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: `tmp-${Date.now()}`, author: user.nickname, text },
              ],
            }
          : p
      )
    );
    try {
      await addFeedComment(id, user.id, user.nickname, text);
    } catch {
      // 롤백
      setFeed((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, comments: p.comments.filter((c) => !c.id.startsWith('tmp-')) }
            : p
        )
      );
    }
  };

  const handleSaveGoal = async (min: number) => {
    if (!user) return;
    setUser({ ...user, goalMediaMin: min });
    try {
      await updateGoalMediaMin(user.id, min);
    } catch (e) {
      setError(e instanceof Error ? e.message : '목표 저장에 실패했어요');
    }
  };

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef1ea]">
        <Loader2 className="w-7 h-7 text-sage-500 animate-spin" />
      </div>
    );
  }

  if (!loggedIn || !user) {
    return (
      <div className="min-h-screen flex items-stretch justify-center bg-[#eef1ea]">
        <LoginPage onLogin={handleLogin} error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch justify-center bg-[#eef1ea]">
      <div className="app-shell">
        {loadingData && (
          <div className="fixed top-4 inset-x-0 z-50 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-4 py-2 shadow-soft">
              <Loader2 className="w-4 h-4 text-sage-500 animate-spin" />
              <span className="text-xs text-sage-600 font-medium">불러오는 중...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
            <div className="max-w-md w-full rounded-2xl bg-error-500/10 border border-error-500/30 px-4 py-2.5 text-xs text-error-600 font-medium text-center">
              {error}
            </div>
          </div>
        )}
        <main key={tab} className="min-h-screen">
          {tab === 'home' && (
            <DashboardHome today={today} goalMediaMin={user.goalMediaMin} user={user} />
          )}
          {tab === 'record' && (
            <RecordForm onSubmit={handleSubmitRecord} existing={today} />
          )}
          {tab === 'club' && (
            <ClubFeed feed={feed} onLike={handleLike} onComment={handleComment} />
          )}
          {tab === 'me' && (
            <MyPage
              user={user}
              records={records}
              onSaveGoal={handleSaveGoal}
              onLogout={handleLogout}
            />
          )}
        </main>

        <TabBar active={tab} onChange={setTab} />
      </div>
    </div>
  );
}

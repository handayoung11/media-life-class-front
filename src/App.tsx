import { useState } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { TabBar, TabKey } from '@/components/TabBar';
import { DashboardHome } from '@/components/DashboardHome';
import { RecordForm } from '@/components/RecordForm';
import { ClubFeed } from '@/components/ClubFeed';
import { MyPage } from '@/components/MyPage';
import {
  mockUser,
  mockRecords,
  mockFeed,
  todayKey,
  DayRecord,
  FeedPost,
} from '@/lib/types';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [provider, setProvider] = useState(null as 'kakao' | 'google' | '' | null);
  const [tab, setTab] = useState<TabKey>('home');
  const [records, setRecords] = useState<DayRecord[]>(mockRecords);
  const [feed, setFeed] = useState<FeedPost[]>(mockFeed);
  const [goalMediaMin, setGoalMediaMin] = useState(mockUser.goalMediaMin);

  const today = records.find((r) => r.date === todayKey()) ?? null;

  const handleLogin = (provider: 'kakao' | 'google' | null | '') => {
    setLoggedIn(provider !== null && provider !== '');
    setProvider(provider);
    setTab('home');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setTab('home');
  };

  const handleSubmitRecord = (rec: DayRecord) => {
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.date === rec.date);
      const next = [...prev];
      if (idx >= 0) {
        next[idx] = {
          ...next[idx],
          mediaMin: next[idx].mediaMin + rec.mediaMin,
          exerciseMin: next[idx].exerciseMin + rec.exerciseMin,
          studyMin: next[idx].studyMin + rec.studyMin,
          comment: rec.comment || next[idx].comment,
        };
      } else {
        next.push(rec);
      }
      return next;
    });

    setFeed((prev) => [
      {
        id: `me-${Date.now()}`,
        author: mockUser.nickname,
        avatarColor: mockUser.avatarColor,
        avatarInitial: mockUser.avatarInitial,
        mediaMin: rec.mediaMin,
        exerciseMin: rec.exerciseMin,
        studyMin: rec.studyMin,
        caption: rec.comment || '오늘의 미라밸을 기록했어요 🌿',
        likes: 0,
        liked: false,
        comments: [],
        timeAgo: '방금 전',
      },
      ...prev,
    ]);
  };

  const handleLike = (id: string) => {
    setFeed((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleComment = (id: string, text: string) => {
    setFeed((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: `cm-${Date.now()}`, author: mockUser.nickname, text },
              ],
            }
          : p
      )
    );
  };

  if (provider === null) {
    return (
      <div className="min-h-screen flex items-stretch justify-center bg-[#eef1ea]">
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch justify-center bg-[#eef1ea]">
      <div className="app-shell">
        <main key={tab} className="min-h-screen">
          {tab === 'home' && <DashboardHome today={today} goalMediaMin={goalMediaMin} />}
          {tab === 'record' && (
            <RecordForm onSubmit={handleSubmitRecord} existing={today} />
          )}
          {tab === 'club' && (
            <ClubFeed feed={feed} onLike={handleLike} onComment={handleComment} />
          )}
          {tab === 'me' && (
            <MyPage
              user={{ ...mockUser, goalMediaMin }}
              records={records}
              onSaveGoal={setGoalMediaMin}
              onLogout={handleLogout}
            />
          )}
        </main>

        <TabBar active={tab} onChange={setTab} />
      </div>
    </div>
  );
}

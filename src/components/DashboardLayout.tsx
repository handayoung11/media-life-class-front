import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TabBar, TabKey } from '@/components/TabBar';
import { DashboardHome } from '@/components/DashboardHome';
import { RecordForm } from '@/components/RecordForm';
import { ClubFeed } from '@/components/ClubFeed';
import { MyPage } from '@/components/MyPage';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { isLoggedIn, logout } from '@/lib/api';

const GUEST_ALLOWED: TabKey = 'club';

export function DashboardLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const loggedIn = isLoggedIn();

  const [tab, setTab] = useState<TabKey>(() => {
    const param = searchParams.get('tab') as TabKey | null;
    if (!loggedIn && param !== GUEST_ALLOWED) return GUEST_ALLOWED;
    return param ?? 'home';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabKey | null>(null);
  const navigate = useNavigate();

  const isGuest = !isLoggedIn();

  useEffect(() => {
    if (isGuest && tab !== GUEST_ALLOWED) {
      setTab(GUEST_ALLOWED);
    }
  }, [isGuest, tab]);

  useEffect(() => {
    const param = searchParams.get('tab') as TabKey | null;
    if (param && param !== tab) {
      if (!isGuest || param === GUEST_ALLOWED) {
        setTab(param);
      }
    }
  }, [searchParams, isGuest, tab]);

  const handleTabChange = (next: TabKey) => {
    if (isGuest && next !== GUEST_ALLOWED) {
      setPendingTab(next);
      setShowLoginModal(true);
      return;
    }
    setTab(next);
    setSearchParams({ tab: next }, { replace: true });
  };

  const handleConfirmLogin = () => {
    setShowLoginModal(false);
    setPendingTab(null);
    navigate('/login');
  };

  const handleCancelModal = () => {
    setShowLoginModal(false);
    setPendingTab(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-stretch justify-center bg-[#eef1ea]">
      <div className="app-shell">
        <main key={tab} className="min-h-screen">
          {tab === 'home' && <DashboardHome />}
          {tab === 'record' && <RecordForm />}
          {tab === 'club' && <ClubFeed />}
          {tab === 'me' && <MyPage onLogout={handleLogout} />}
        </main>

        <TabBar active={tab} onChange={handleTabChange} />
      </div>

      {showLoginModal && (
        <LoginPromptModal
          onConfirm={handleConfirmLogin}
          onCancel={handleCancelModal}
        />
      )}
    </div>
  );
}

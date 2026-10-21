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
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'home';
  const loggedIn = isLoggedIn();

  const [tab, setTab] = useState<TabKey>(loggedIn ? initialTab : GUEST_ALLOWED);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabKey | null>(null);
  const navigate = useNavigate();

  const isGuest = !isLoggedIn();

  useEffect(() => {
    if (isGuest && tab !== GUEST_ALLOWED) {
      setTab(GUEST_ALLOWED);
    }
  }, [isGuest, tab]);

  const handleTabChange = (next: TabKey) => {
    if (isGuest && next !== GUEST_ALLOWED) {
      setPendingTab(next);
      setShowLoginModal(true);
      return;
    }
    setTab(next);
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

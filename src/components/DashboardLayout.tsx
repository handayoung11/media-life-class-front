import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabBar, TabKey } from '@/components/TabBar';
import { DashboardHome } from '@/components/DashboardHome';
import { RecordForm } from '@/components/RecordForm';
import { ClubFeed } from '@/components/ClubFeed';
import { MyPage } from '@/components/MyPage';
import { logout } from '@/lib/api';

export function DashboardLayout() {
  const [tab, setTab] = useState<TabKey>('home');
  const navigate = useNavigate();

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

        <TabBar active={tab} onChange={setTab} />
      </div>
    </div>
  );
}

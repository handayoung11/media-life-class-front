import { Home, PenLine, Users, User } from 'lucide-react';

export type TabKey = 'home' | 'record' | 'club' | 'me';

interface TabBarProps {
  active: TabKey;
  onChange: (t: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'home', label: '대시보드', icon: Home },
  { key: 'record', label: '기록하기', icon: PenLine },
  { key: 'club', label: '미라클 클럽', icon: Users },
  { key: 'me', label: '마이페이지', icon: User },
];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="absolute bottom-0 inset-x-0 z-40">
      <div className="mx-auto max-w-md px-4 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="rounded-3xl bg-white/95 backdrop-blur-md shadow-float border border-sage-100/70 flex items-center justify-around px-2 py-2">
          {TABS.map((t) => {
            const isActive = active === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => onChange(t.key)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 no-tap-highlight transition-all"
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-2xl transition-all ${
                    isActive ? 'bg-sage-600 text-white scale-105 shadow-soft' : 'text-sage-400'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-sage-800' : 'text-sage-400'
                  }`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

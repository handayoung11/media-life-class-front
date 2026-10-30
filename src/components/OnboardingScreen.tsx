import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ChevronRight, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/user-context';

export function OnboardingScreen() {
  const navigate = useNavigate();
  const { user, refresh } = useUser();
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [goalH, setGoalH] = useState('1');
  const [goalM, setGoalM] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goalMinutes = (parseInt(goalH || '0', 10) || 0) * 60 + (parseInt(goalM || '0', 10) || 0);
  const canSubmit = nickname.trim().length >= 1 && goalMinutes >= 15 && !saving;

  const handleSave = async () => {
    const mediaGoal = Math.max(15, goalMinutes);
    setError(null);
    try {
      setSaving(true);
      const res = await api.patch(
        '/user/me',
         { nickname: nickname.trim(), mediaGoal },
         { withCredentials: true }
      );
      localStorage.setItem('token', res.data);
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch {
      setError('저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch justify-center bg-[#eef1ea]">
      <div className="app-shell flex flex-col px-7 pt-16 pb-10 animate-fade-in">
        <div className="flex flex-col items-center text-center animate-slide-up">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-sage-300/40 rounded-full" />
            <div className="relative w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-sage-400 to-sage-600 shadow-float flex items-center justify-center">
              <Leaf className="w-10 h-10 text-white" strokeWidth={1.8} />
            </div>
          </div>
          <h1 className="mt-6 font-display text-[24px] leading-tight font-semibold text-sage-800">
            환영해요!
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-sage-600 max-w-[18rem]">
            시작하기 전에 닉네임과
            <br />
            하루 미디어 목표를 정해볼까요?
          </p>
        </div>

        <div className="mt-8 space-y-5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="미라클러"
              className="w-full rounded-2xl bg-white border border-sage-200 px-4 py-3.5 text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">
              하루 미디어 사용 제한
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={goalH}
                  onChange={(e) => setGoalH(e.target.value)}
                  className="w-full rounded-2xl bg-white border border-sage-200 px-3 py-3 text-center text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
                />
                <span className="text-sm text-sage-500 font-medium">시</span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={goalM}
                  onChange={(e) => setGoalM(e.target.value)}
                  className="w-full rounded-2xl bg-white border border-sage-200 px-3 py-3 text-center text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
                />
                <span className="text-sm text-sage-500 font-medium">분</span>
              </div>
            </div>
            {goalMinutes > 0 && goalMinutes < 15 && (
              <p className="mt-2 text-xs text-accent-clay">최소 15분 이상 설정해 주세요.</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-error-600 text-center">{error}</p>
          )}
        </div>

        <div className="mt-auto pt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={handleSave}
            disabled={!canSubmit}
            className="btn-base w-full h-14 bg-sage-600 text-white text-[15px] shadow-soft hover:bg-sage-700"
          >
            {saving ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                시작하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

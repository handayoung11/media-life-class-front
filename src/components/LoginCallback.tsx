import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useUser } from '@/lib/user-context';

export function LoginCallback() {
  const navigate = useNavigate();
  const { refresh } = useUser();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const shouldOnboard = params.get('is_onboarding');

    if (token) {
      localStorage.setItem('token', token);
      if (shouldOnboard === 'true') {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, refresh]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef1ea]">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-sage-400 to-sage-600 shadow-float flex items-center justify-center">
          <Leaf className="w-8 h-8 text-white" strokeWidth={1.8} />
        </div>
        <div className="flex items-center gap-2 text-sage-600 text-sm font-medium">
          <span className="w-4 h-4 rounded-full border-2 border-sage-200 border-t-sage-600 animate-spin" />
          로그인 처리 중...
        </div>
      </div>
    </div>
  );
}

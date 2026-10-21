import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Sparkles, ChevronRight } from 'lucide-react';
import { loginWithGoogle, isLoggedIn, API_BASE_URL } from '@/lib/api';

export function LoginPage() {
  const [pending, setPending] = useState<'kakao' | 'google' | null>(null);
  const navigate = useNavigate();

  if (isLoggedIn()) {
    navigate('/dashboard', { replace: true });
  }

  const handleGoogle = () => {
    setPending('google');
    loginWithGoogle();
  };

  const handleKakao = () => {
    setPending('kakao');
    window.location.replace(`${API_BASE_URL}/oauth2/authorization/kakao`);
  };

  return (
    <div className="min-h-screen flex items-stretch justify-center bg-[#eef1ea]">
      <div className="app-shell flex flex-col px-7 pt-20 pb-10 animate-fade-in">
        <div className="flex flex-col items-center text-center animate-slide-up">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-sage-300/40 rounded-full" />
            <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-sage-400 to-sage-600 shadow-float flex items-center justify-center">
              <Leaf className="w-12 h-12 text-white" strokeWidth={1.8} />
            </div>
          </div>

          <h1 className="mt-8 font-display text-[26px] leading-tight font-semibold text-sage-800">
            Miracle
            <span className="block text-sage-500 text-base font-medium tracking-wide mt-1">
              Media Life Class
            </span>
          </h1>

          <p className="mt-5 text-[15px] leading-relaxed text-sage-600 max-w-[18rem]">
            도파민 중독의 미디어 라이프를 클린하게,
            <br />
            오늘부터 시작되는{' '}
            <span className="text-sage-800 font-semibold">기적 같은 기록 갓생</span>
          </p>

          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-3.5 py-1.5 text-xs font-medium text-sage-700">
            <Sparkles className="w-3.5 h-3.5" />
            미라밸 미라클 클럽과 함께해요
          </div>
        </div>

        <div className="mt-auto space-y-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={handleKakao}
            disabled={pending !== null}
            className="btn-base w-full h-14 bg-[#FEE500] text-[#191600] text-[15px] shadow-soft hover:brightness-[0.98]"
          >
            {pending === 'kakao' ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-[#191600]/30 border-t-[#191600] animate-spin" />
                연결 중...
              </span>
            ) : (
              <span className="flex items-center gap-2.5">
                <KakaoIcon />
                카카오톡으로 3초 만에 시작하기
              </span>
            )}
          </button>

          <button
            onClick={handleGoogle}
            disabled={pending !== null}
            className="btn-base w-full h-14 bg-white text-sage-800 text-[15px] border border-sage-200 shadow-soft hover:bg-cream-100"
          >
            {pending === 'google' ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-sage-300 border-t-sage-600 animate-spin" />
                연결 중...
              </span>
            ) : (
              <span className="flex items-center gap-2.5">
                <GoogleIcon />
                구글 계정으로 시작하기
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            disabled={pending !== null}
            className="btn-base w-full h-12 text-sage-500 text-sm font-medium hover:text-sage-700"
          >
            나중에 하기 · 둘러보기
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-6 text-center text-[11px] text-sage-400 leading-relaxed">
          로그인 시 미라클 이용약관 및 개인정보처리방침에 동의합니다.
          <br />
          Google OAuth2 를 통해 안전하게 로그인됩니다.
        </p>
      </div>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4C6.48 4 2 7.58 2 12c0 2.3 1.28 4.37 3.32 5.78-.15.56-.58 2.13-.66 2.46-.1.41.15.4.27.34.1-.05 1.6-.96 2.25-1.36 1.2.33 2.49.51 3.82.51 5.52 0 10-3.58 10-8s-4.48-8-10-8Z"
        fill="#191600"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M22.5 12.2c0-.78-.07-1.53-.2-2.25H12v4.26h5.9a5.04 5.04 0 0 1-2.18 3.3v2.74h3.52c2.06-1.9 3.26-4.7 3.26-8.05Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.94 0 5.41-.97 7.22-2.63l-3.52-2.73c-.98.66-2.23 1.05-3.7 1.05-2.85 0-5.26-1.92-6.12-4.5H2.25v2.82A11 11 0 0 0 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.88 14.19a6.6 6.6 0 0 1 0-4.2V7.17H2.25a11 11 0 0 0 0 9.84l3.63-2.82Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.6 0 3.04.55 4.18 1.64l3.13-3.13C17.4 2.16 14.94 1 12 1A11 11 0 0 0 2.25 7.17l3.63 2.82C6.74 7.3 9.15 5.38 12 5.38Z"
        fill="#EA4335"
      />
    </svg>
  );
}

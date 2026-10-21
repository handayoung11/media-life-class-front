import { Leaf, LogIn, X } from 'lucide-react';

interface LoginPromptModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function LoginPromptModal({ onConfirm, onCancel }: LoginPromptModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sage-900/40 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="relative mx-6 w-full max-w-sm rounded-3xl bg-white shadow-float p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-sage-50 text-sage-400 flex items-center justify-center hover:bg-sage-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 shadow-soft flex items-center justify-center">
            <Leaf className="w-7 h-7 text-white" strokeWidth={1.8} />
          </div>

          <h3 className="mt-4 font-display text-lg font-semibold text-sage-800">
            로그인이 필요해요
          </h3>
          <p className="mt-2 text-sm text-sage-500 leading-relaxed">
            이 기능은 로그인 후 이용할 수 있어요.
            <br />
            지금 로그인하시겠습니까?
          </p>

          <div className="mt-6 flex flex-col gap-2.5 w-full">
            <button
              onClick={onConfirm}
              className="btn-base w-full h-12 bg-gradient-to-br from-sage-500 to-sage-600 text-white text-sm shadow-soft hover:brightness-[1.04]"
            >
              <LogIn className="w-4 h-4" />
              로그인하기
            </button>
            <button
              onClick={onCancel}
              className="btn-base w-full h-11 bg-sage-50 text-sage-600 text-sm hover:bg-sage-100"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

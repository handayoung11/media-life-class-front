import { useRef, useState } from 'react';
import {
  Smartphone,
  Dumbbell,
  BookOpen,
  MessageCircle,
  Check,
  Sparkles,
  Camera,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { DayRecord } from '@/lib/types';

interface RecordFormProps {
  onSubmit: (record: DayRecord) => void;
  existing?: DayRecord | null;
}

export function RecordForm({ onSubmit, existing }: RecordFormProps) {
  const [mediaPhoto, setMediaPhoto] = useState<string | null>(null);
  const [mediaMin, setMediaMin] = useState('');
  const [exText, setExText] = useState('');
  const [exMin, setExMin] = useState('');
  const [studyText, setStudyText] = useState('');
  const [studyMin, setStudyMin] = useState('');
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [toast, setToast] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setMediaPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().slice(0, 10);
    onSubmit({
      date: today,
      mediaMin: clamp(mediaMin),
      exerciseMin: clamp(exMin),
      studyMin: clamp(studyMin),
      comment: comment.trim(),
    });
    setToast(true);
    setMediaPhoto(null);
    setMediaMin('');
    setExText('');
    setExMin('');
    setStudyText('');
    setStudyMin('');
    setComment('');
    setTimeout(() => setToast(false), 2200);
  };

  return (
    <div className="px-5 pt-6 pb-28 animate-fade-in">
      <header className="mb-5">
        <h2 className="font-display text-xl font-semibold text-sage-800">오늘의 기록</h2>
        <p className="text-xs text-sage-400 mt-0.5">하루를 돌아보고 미라밸을 채워보세요</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Section icon={<Smartphone className="w-4 h-4" />} title="미디어 사용" tint="#c97b5a">
          <p className="text-xs text-sage-400">오늘의 스크린타임 사진을 올려 기록해요</p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="hidden"
          />

          {mediaPhoto ? (
            <div className="relative rounded-2xl overflow-hidden border border-sage-100 group">
              <img src={mediaPhoto} alt="스크린타임" className="w-full h-44 object-cover" />
              <button
                type="button"
                onClick={() => setMediaPhoto(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center active:scale-90 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-sage-200 bg-sage-50/60 hover:bg-sage-50 hover:border-sage-300 py-7 flex flex-col items-center gap-2 transition no-tap-highlight"
            >
              <span className="w-11 h-11 rounded-2xl bg-sage-100 text-sage-500 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </span>
              <span className="text-[13px] text-sage-600 font-medium">스크린타임 사진 올리기</span>
              <span className="text-[11px] text-sage-400">사진을 눌러 불러오세요</span>
            </button>
          )}

          <TimeInput
            label="사용 시간"
            value={mediaMin}
            onChange={setMediaMin}
            placeholder="예) 90"
          />
        </Section>

        <Section icon={<Dumbbell className="w-4 h-4" />} title="운동 기록" tint="#5d8a52">
          <TextInput
            label="운동 종류"
            value={exText}
            onChange={setExText}
            placeholder="예) 헬스, 산책, 달리기..."
            maxLength={30}
          />
          <TimeInput
            label="운동 시간"
            value={exMin}
            onChange={setExMin}
            placeholder="예) 45"
          />
        </Section>

        <Section icon={<BookOpen className="w-4 h-4" />} title="공부 기록" tint="#7ba6c7">
          <TextInput
            label="공부 내용"
            value={studyText}
            onChange={setStudyText}
            placeholder="예) 전공 과목, 자격증, 독서..."
            maxLength={30}
          />
          <TimeInput
            label="집중 시간"
            value={studyMin}
            onChange={setStudyMin}
            placeholder="예) 90"
          />
        </Section>

        <Section icon={<MessageCircle className="w-4 h-4" />} title="한줄 코멘트" tint="#d9a441">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={80}
            placeholder="오늘의 느낌이나 총평을 한줄 남겨보세요"
            className="w-full rounded-2xl bg-sage-50 border border-sage-100 px-4 py-3 text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none transition"
          />
          <div className="text-right text-[11px] text-sage-400">{comment.length}/80</div>
        </Section>

        <button
          type="submit"
          className="btn-base w-full h-14 bg-gradient-to-br from-sage-500 to-sage-600 text-white text-[15px] shadow-float hover:brightness-[1.04] mt-2"
        >
          <Sparkles className="w-5 h-5" />
          오늘의 미라밸 등록하기
        </button>
      </form>

      {toast && (
        <div className="fixed inset-x-0 bottom-24 mx-auto max-w-[18rem] z-50 animate-slide-up">
          <div className="flex items-center gap-2.5 rounded-2xl bg-sage-800 text-white px-4 py-3 shadow-float">
            <Check className="w-5 h-5 text-sage-200" />
            <span className="text-sm font-medium">미라밸이 기록되었어요! 🌿</span>
          </div>
        </div>
      )}
    </div>
  );
}

function clamp(s: string): number {
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 1440) : 0;
}

function Section({
  icon,
  title,
  tint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span
          className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${tint}22`, color: tint }}
        >
          {icon}
        </span>
        <h3 className="font-semibold text-sage-800 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] text-sage-400 font-medium">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-2xl bg-sage-50 border border-sage-100 px-4 py-3 text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
      />
    </div>
  );
}

function TimeInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl bg-sage-50 border border-sage-100 px-4 py-3 text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
        />
      </div>
      <span className="text-xs text-sage-400 font-medium shrink-0">{label} (분)</span>
    </div>
  );
}

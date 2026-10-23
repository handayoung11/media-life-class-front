import { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Smartphone,
  Dumbbell,
  BookOpen,
  MessageCircle,
  Check,
  Sparkles,
  Camera,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { RecordPayload, RecordResponse, todayKey } from '@/lib/types';
import { AxiosError } from 'axios';

export function RecordForm() {
  const [mediaPic, setMediaPic] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaMin, setMediaMin] = useState('');
  const [media, setMedia] = useState('');
  const [exer, setExer] = useState('');
  const [exerMin, setExerMin] = useState('');
  const [study, setStudy] = useState('');
  const [studyMin, setStudyMin] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(todayKey());
  const [toast, setToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = () => setMediaPic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: RecordPayload = {
      miracleDate: date,
      mediaMin: clamp(mediaMin),
      exerMin: clamp(exerMin),
      studyMin: clamp(studyMin),
      exer: exer.trim() || undefined,
      study: study.trim() || undefined,
      media: media.trim() || undefined,
      memo: memo.trim() || undefined,
      mediaPic: mediaFile ?? undefined,
    };

    if (payload.mediaMin === 0 && payload.exerMin === 0 && payload.studyMin === 0) {
      setError('최소 한 항목의 시간을 입력해 주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('miracleDate', payload.miracleDate);
    formData.append('mediaMin', String(payload.mediaMin));
    formData.append('exerMin', String(payload.exerMin));
    formData.append('studyMin', String(payload.studyMin));
    if (payload.exer) formData.append('exer', payload.exer);
    if (payload.study) formData.append('study', payload.study);
    if (payload.media) formData.append('media', payload.media);
    if (payload.memo) formData.append('memo', payload.memo);
    if (payload.mediaPic) formData.append('mediaPic', payload.mediaPic);

    try {
      setSubmitting(true);
      await api.post<RecordResponse>('/miracle', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setToast(true);
      setMediaPic(null);
      setMediaFile(null);
      setMediaMin('');
      setMedia('');
      setExer('');
      setExerMin('');
      setStudy('');
      setStudyMin('');
      setMemo('');
      setDate(todayKey());
      setTimeout(() => {
        setToast(false);
        window.location.assign('/dashboard');
      }, 1500);
    } catch (err) {
      const message =
        err instanceof AxiosError && err.response?.data ? err.response.data : '기록 저장에 실패했습니다. 다시 시도해 주세요.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 pt-6 pb-28 animate-fade-in">
      <header className="mb-5">
        <h2 className="font-display text-xl font-semibold text-sage-800">미디어 라이프 밸런스</h2>
        <p className="text-xs text-sage-400 mt-0.5">하루를 돌아보고 미라밸을 채워보세요</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Section icon={<Calendar className="w-4 h-4" />} title="기록 날짜" tint="#a89bb0">
          <div className="space-y-1.5">
            <input
              type="date"
              value={date}
              max={todayKey()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl bg-sage-50 border border-sage-100 px-4 py-3 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
            />
            {date !== todayKey() && (
              <button
                type="button"
                onClick={() => setDate(todayKey())}
                className="text-[11px] text-sage-500 font-medium hover:text-sage-700 transition"
              >
                오늘 날짜로 돌아가기
              </button>
            )}
          </div>
        </Section>

        <Section icon={<Smartphone className="w-4 h-4" />} title="미디어 사용" tint="#c97b5a">
          <p className="text-xs text-sage-400">오늘의 스크린타임 사진을 올려 기록해요</p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="hidden"
          />

          {mediaPic ? (
            <div className="relative rounded-2xl overflow-hidden border border-sage-100 group">
              <img src={mediaPic} alt="스크린타임" className="w-full h-44 object-cover" />
              <button
                type="button"
                onClick={() => { setMediaPic(null); setMediaFile(null); }}
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

          <TextArea
            label="미디어 내용"
            value={media}
            onChange={setMedia}
            rows={3}
            maxLength={200}
            placeholder="예) 쇼츠 30분, 릴스 20분"
          />
        </Section>

        <Section icon={<Dumbbell className="w-4 h-4" />} title="운동 기록" tint="#5d8a52">
          <TextArea
            label="운동 내용"
            value={exer}
            onChange={setExer}
            rows={3}
            maxLength={200}
            placeholder={'예) 헬스 30분, 산책 20분, 스트레칭'}
          />
          <TimeInput
            label="운동 시간"
            value={exerMin}
            onChange={setExerMin}
            placeholder="예) 45"
          />
        </Section>

        <Section icon={<BookOpen className="w-4 h-4" />} title="공부 기록" tint="#7ba6c7">
          <TextArea
            label="공부 내용"
            value={study}
            onChange={setStudy}
            rows={3}
            maxLength={200}
            placeholder={'예) 전공 과목, 자격증, 독서 30분'}
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
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="오늘의 느낌이나 총평을 한줄 남겨보세요"
            className="w-full rounded-2xl bg-sage-50 border border-sage-100 px-4 py-3 text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none transition"
          />
          <div className="text-right text-[11px] text-sage-400">{memo.length}/200</div>
        </Section>

        {error && (
          <div
            ref={errorRef}
            className="flex items-start gap-2.5 rounded-2xl bg-error-500/10 border border-error-500/20 px-4 py-3 animate-slide-up"
          >
            <AlertCircle className="w-5 h-5 text-error-600 shrink-0 mt-0.5" />
            <p className="text-sm text-error-700 font-medium">{error}</p>
          </div>
        )}

        <button
          ref={submitRef}
          type="submit"
          disabled={submitting}
          className="btn-base w-full h-14 bg-gradient-to-br from-sage-500 to-sage-600 text-white text-[15px] shadow-float hover:brightness-[1.04] mt-2"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              저장 중...
            </span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {date === todayKey() ? '오늘의 미라밸 등록하기' : `${formatDate(date)} 미라밸 등록하기`}
            </>
          )}
        </button>
      </form>

      {toast && (
        <div className="fixed inset-x-0 bottom-24 mx-auto max-w-[18rem] z-50 animate-slide-up">
          <div className="flex items-center gap-2.5 rounded-2xl bg-sage-800 text-white px-4 py-3 shadow-float">
            <Check className="w-5 h-5 text-sage-200" />
            <span className="text-sm font-medium">미라밸이 기록되었어요! 대시보드로 이동해요 🌿</span>
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

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
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

function TextArea({
  label,
  value,
  onChange,
  rows,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-sage-400 font-medium">{label}</label>
        {maxLength && (
          <span className="text-[11px] text-sage-300">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-sage-50 border border-sage-100 px-4 py-3 text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none transition"
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

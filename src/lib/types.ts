export type Category = 'media' | 'exercise' | 'study';

export interface Comment {
  id: string;
  author: string;
  text: string;
}

export interface FeedPost {
  id: string;
  author: string;
  avatarUrl: string;
  mediaMin: number;
  exerMin: number;
  studyMin: number;
  memo: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  createdAt: string;
}

export interface FeedPage {
  feeds: FeedPost[];
  currentPage: number;
  hasNext: boolean;
}

export interface FeedDetail extends FeedPost {
  media: string | null;
  exer: string | null;
  study: string | null;
  mediaPic: string | null;
}

// ---- Backend API response shapes ----

export interface DashboardSummary {
  totalRecords: number;
  streakDays: number;
}

export interface DashboardRecentRecord {
  date: string;
  mediaMin: number;
  exerciseMin: number;
  studyMin: number;
  memo: string;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  today: DashboardRecentRecord | null;
  recentRecords: DashboardRecentRecord[];
}

export interface RecordPayload {
  miracleDate: string;
  mediaMin: number;
  exerMin: number;
  studyMin: number;
  exer?: string;
  study?: string;
  media?: string;
  memo?: string;
  mediaPic?: File;
}

export interface RecordResponse {
  id: string;
  date: string;
  mediaMin: number;
  exerciseMin: number;
  studyMin: number;
  comment: string;
}

export const MEDIA_APPS = [
  '인스타그램',
  '유튜브',
  '틱톡',
  '넷플릭스',
  'X(트위터)',
  '게임',
  '기타',
];

export const EXERCISE_TYPES = ['헬스', '산책', '달리기', '요가', '사이클', '수영', '기타'];

export const STUDY_TOPICS = ['언어', '전공', '자격증', '독서', '코딩', '기타'];

export const CATEGORY_META: Record<
  Category,
  { label: string; color: string; light: string; icon: string }
> = {
  media: { label: '미디어', color: '#c97b5a', light: '#f3d9c9', icon: 'Smartphone' },
  exercise: { label: '운동', color: '#5d8a52', light: '#d8e7d2', icon: 'Dumbbell' },
  study: { label: '공부', color: '#7ba6c7', light: '#d2e2ee', icon: 'BookOpen' },
};

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function timeAgo(createdAt: string): string {
  const normalized = createdAt.replace(/(\.\d{3})\d+/, '$1');
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return createdAt;
  const diff = Date.now() - date.getTime();
  if (diff < 0) return '방금 전';
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return '방금 전';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}일 전`;
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}
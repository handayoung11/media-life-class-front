export type Category = 'media' | 'exercise' | 'study';

export interface DayRecord {
  date: string;
  mediaMin: number;
  exerciseMin: number;
  studyMin: number;
  comment: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
}

export interface FeedPost {
  id: string;
  author: string;
  avatarColor: string;
  avatarInitial: string;
  mediaMin: number;
  exerciseMin: number;
  studyMin: number;
  caption: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  timeAgo: string;
}

export interface User {
  nickname: string;
  email: string;
  avatarColor: string;
  avatarInitial: string;
  goalMediaMin: number;
}

export interface MockData {
  user: User;
  records: DayRecord[];
  feed: FeedPost[];
}

// ---- Backend API response shapes ----

export interface DashboardSummary {
  totalMediaMin: number;
  totalExerciseMin: number;
  totalStudyMin: number;
  totalRecords: number;
  streakDays: number;
  goalMediaMin: number;
}

export interface DashboardRecentRecord {
  date: string;
  mediaMin: number;
  exerciseMin: number;
  studyMin: number;
  comment: string;
}

export interface DashboardResponse {
  user: User;
  summary: DashboardSummary;
  today: DashboardRecentRecord | null;
  recentRecords: DashboardRecentRecord[];
  weekly: { date: string; media: number; exercise: number; study: number }[];
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

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

const todayISO = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

export function todayKey(): string {
  return todayISO();
}

export const mockUser: User = {
  nickname: '초록빛 갓생러',
  email: 'greenlife@example.com',
  avatarColor: '#5d8a52',
  avatarInitial: '초',
  goalMediaMin: 120,
};

export const mockRecords: DayRecord[] = [
  { date: '2026-10-14', mediaMin: 180, exerciseMin: 30, studyMin: 60, comment: '유튜브를 조금 줄였다' },
  { date: '2026-10-15', mediaMin: 150, exerciseMin: 45, studyMin: 80, comment: '산책이 제일 좋아' },
  { date: '2026-10-16', mediaMin: 200, exerciseMin: 20, studyMin: 40, comment: '오늘은 조금 방황' },
  { date: '2026-10-17', mediaMin: 120, exerciseMin: 50, studyMin: 90, comment: '집중 최고' },
  { date: '2026-10-18', mediaMin: 90, exerciseMin: 60, studyMin: 100, comment: '갓생 갓생' },
  { date: '2026-10-19', mediaMin: 110, exerciseMin: 40, studyMin: 70, comment: '안정적인 하루' },
  { date: todayKey(), mediaMin: 84, exerciseMin: 35, studyMin: 55, comment: '도파민 디톡스 시작' },
];

export const mockFeed: FeedPost[] = [
  {
    id: 'f1',
    author: '미라클러 라온',
    avatarColor: '#7ba6c7',
    avatarInitial: '라',
    mediaMin: 60,
    exerciseMin: 55,
    studyMin: 120,
    caption: '오늘 도서관 2시간! 미디어는 딱 1시간만. 기적이 따로 없다, 매일이 기적 🌿',
    likes: 24,
    liked: false,
    timeAgo: '방금 전',
    comments: [
      { id: 'c1', author: '초록잎', text: '대박 진짜 갓생이네요!' },
    ],
  },
  {
    id: 'f2',
    author: '단디_디톡스',
    avatarColor: '#c97b5a',
    avatarInitial: '단',
    mediaMin: 95,
    exerciseMin: 80,
    studyMin: 40,
    caption: '저녁 산책 80분 + 인스타 줄이기 성공. 마음이 점점 맑아져요 ☁️→☀️',
    likes: 41,
    liked: false,
    timeAgo: '1시간 전',
    comments: [
      { id: 'c2', author: '미라밸러', text: '산책 루틴 궁금해요!' },
      { id: 'c3', author: '단디_디톡스', text: '집 근처 공원 한 바퀴예요 🌳' },
    ],
  },
  {
    id: 'f3',
    author: '새벽공부러',
    avatarColor: '#d9a441',
    avatarInitial: '새',
    mediaMin: 40,
    exerciseMin: 25,
    studyMin: 180,
    caption: '새벽 5시 기상 3시간 몰입. 미디어는 알림 꺼놓고 시작하는 게 정답이었음 ✨',
    likes: 67,
    liked: false,
    timeAgo: '3시간 전',
    comments: [],
  },
];

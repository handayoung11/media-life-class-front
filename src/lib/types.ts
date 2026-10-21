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
  id: string;
  nickname: string;
  email: string;
  avatarColor: string;
  avatarInitial: string;
  goalMediaMin: number;
  provider: string;
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

// 닉네임/아바타 생성용 풀
const NICK_PREFIX = ['초록빛', '맑은', '단디', '새벽', '미라클러', '청량한', '느린', '꾸준한'];
const NICK_SUFFIX = ['갓생러', '디톡스', '러', '공부러', '워커', '러너', '리더', '메이커'];
const AVATAR_COLORS = ['#5d8a52', '#7ba6c7', '#c97b5a', '#d9a441', '#8a7bc7', '#c75d8a'];
const INITIALS = ['초', '맑', '단', '새', '미', '청', '느', '꾸', '라', '온'];

export function generateProfileFromEmail(email: string): {
  nickname: string;
  avatarColor: string;
  avatarInitial: string;
} {
  const seed = email.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const nickname = `${NICK_PREFIX[seed % NICK_PREFIX.length]}${NICK_SUFFIX[(seed >> 3) % NICK_SUFFIX.length]}`;
  const avatarColor = AVATAR_COLORS[seed % AVATAR_COLORS.length];
  const avatarInitial = INITIALS[(seed >> 5) % INITIALS.length];
  return { nickname, avatarColor, avatarInitial };
}

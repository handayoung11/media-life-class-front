import { supabase } from './supabase';
import {
  DayRecord,
  FeedPost,
  User,
  generateProfileFromEmail,
} from './types';

// ---------- 인증 ----------

export type LoginProvider = 'kakao' | 'google' | 'guest';

export interface LoginResult {
  user: User | null;
  provider: LoginProvider;
}

/**
 * Mock 소셜 로그인.
 * 실제 소셜 OAuth 연동 대신, 임의의 이메일로 Supabase에 signUp/로그인을 시도한다.
 * 같은 이메일로 재로그인하면 기존 계정, 처음이면 자동 가입 + 프로필 생성.
 * "둘러보기"는 게스트(미인증) 상태로 진입한다.
 */
export async function loginWithProvider(
  provider: LoginProvider
): Promise<LoginResult> {
  if (provider === 'guest') {
    return { user: null, provider: 'guest' };
  }

  const fakeEmail = `${provider}.user.${Date.now().toString(36)}@miracle.app`;
  const password = `Miracle!${provider}1`;

  // 1) 로그인 시도
  const signInRes = await supabase.auth.signInWithPassword({
    email: fakeEmail,
    password,
  });

  // 2) 계정이 없으면 회원가입
  if (signInRes.error) {
    const signUpRes = await supabase.auth.signUp({
      email: fakeEmail,
      password,
    });
    if (signUpRes.error) {
      throw new Error(signUpRes.error.message);
    }
    const authUser = signUpRes.data.user;
    if (!authUser) {
      return { user: null, provider };
    }
    const user = await ensureProfile(authUser.id, authUser.email ?? fakeEmail, provider);
    return { user, provider };
  }

  const authUser = signInRes.data.user;
  if (!authUser) {
    return { user: null, provider };
  }

  const user = await ensureProfile(authUser.id, authUser.email ?? fakeEmail, provider);
  return { user, provider };
}

export async function restoreSession(): Promise<LoginResult | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const provider =
    (session.user.app_metadata?.provider as LoginProvider | undefined) ?? 'email';
  const user = await ensureProfile(
    session.user.id,
    session.user.email ?? '',
    provider === 'email' ? 'kakao' : provider
  );
  return { user, provider: user.provider as LoginProvider };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// ---------- 프로필 ----------

async function ensureProfile(
  userId: string,
  email: string,
  provider: LoginProvider | string
): Promise<User> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existing) {
    return toUser(existing);
  }

  const gen = generateProfileFromEmail(email);
  const insertPayload = {
    id: userId,
    email,
    nickname: gen.nickname,
    avatar_color: gen.avatarColor,
    avatar_initial: gen.avatarInitial,
    goal_media_min: 120,
    provider,
  };

  const { data: created, error } = await supabase
    .from('profiles')
    .insert(insertPayload)
    .select('*')
    .maybeSingle();

  if (error) {
    // 경쟁 조건: 동시에 두 번 생성 시도 → 기존 것 다시 조회
    const { data: retry } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (retry) return toUser(retry);
    throw new Error(error.message);
  }

  return toUser(created);
}

export async function updateGoalMediaMin(userId: string, min: number): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ goal_media_min: min })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

function toUser(row: Record<string, unknown> | null): User {
  return {
    id: row?.id as string,
    nickname: row?.nickname as string,
    email: row?.email as string,
    avatarColor: row?.avatar_color as string,
    avatarInitial: row?.avatar_initial as string,
    goalMediaMin: row?.goal_media_min as number,
    provider: row?.provider as string,
  };
}

// ---------- 기록(Records) ----------

export async function fetchRecords(userId: string): Promise<DayRecord[]> {
  const { data, error } = await supabase
    .from('records')
    .select('date, media_min, exercise_min, study_min, comment')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    date: r.date as string,
    mediaMin: r.media_min as number,
    exerciseMin: r.exercise_min as number,
    studyMin: r.study_min as number,
    comment: (r.comment as string) ?? '',
  }));
}

/**
 * 오늘 기록이 있으면 누적(더하기), 없으면 새로 생성.
 * 같은 날 여러 번 기록할 수 있으므로 upsert 후 누적값 반영.
 */
export async function submitRecord(
  userId: string,
  rec: DayRecord
): Promise<DayRecord> {
  // 기존 기록 조회
  const { data: existing } = await supabase
    .from('records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', rec.date)
    .maybeSingle();

  if (existing) {
    const merged: DayRecord = {
      date: rec.date,
      mediaMin: (existing.media_min as number) + rec.mediaMin,
      exerciseMin: (existing.exercise_min as number) + rec.exerciseMin,
      studyMin: (existing.study_min as number) + rec.studyMin,
      comment: rec.comment || (existing.comment as string) || '',
    };
    const { error } = await supabase
      .from('records')
      .update({
        media_min: merged.mediaMin,
        exercise_min: merged.exerciseMin,
        study_min: merged.studyMin,
        comment: merged.comment,
      })
      .eq('id', existing.id as string);
    if (error) throw new Error(error.message);
    return merged;
  }

  const { error } = await supabase.from('records').insert({
    user_id: userId,
    date: rec.date,
    media_min: rec.mediaMin,
    exercise_min: rec.exerciseMin,
    study_min: rec.studyMin,
    comment: rec.comment,
  });
  if (error) throw new Error(error.message);
  return rec;
}

// ---------- 피드(Feed) ----------

export async function fetchFeed(currentUserId: string): Promise<FeedPost[]> {
  // 게시글 + 댓글 + 좋아요 조인 조회
  const { data: posts, error } = await supabase
    .from('feed_posts')
    .select(
      'id, user_id, author_name, avatar_color, avatar_initial, media_min, exercise_min, study_min, caption, created_at, feed_comments(id, author_name, text, created_at), feed_likes(user_id)'
    )
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);

  return (posts ?? []).map((p) => {
    const likes = (p.feed_likes as unknown as { user_id: string }[]) ?? [];
    const comments = (p.feed_comments as unknown as {
      id: string;
      author_name: string;
      text: string;
      created_at: string;
    }[]) ?? [];
    return {
      id: p.id as string,
      author: p.author_name as string,
      avatarColor: p.avatar_color as string,
      avatarInitial: p.avatar_initial as string,
      mediaMin: p.media_min as number,
      exerciseMin: p.exercise_min as number,
      studyMin: p.study_min as number,
      caption: p.caption as string,
      likes: likes.length,
      liked: likes.some((l) => l.user_id === currentUserId),
      comments: comments
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((c) => ({ id: c.id, author: c.author_name, text: c.text })),
      timeAgo: timeAgo(new Date(p.created_at as string)),
    };
  });
}

export async function createFeedPostFromRecord(
  user: User,
  rec: DayRecord
): Promise<void> {
  const { error } = await supabase.from('feed_posts').insert({
    user_id: user.id,
    author_name: user.nickname,
    avatar_color: user.avatarColor,
    avatar_initial: user.avatarInitial,
    media_min: rec.mediaMin,
    exercise_min: rec.exerciseMin,
    study_min: rec.studyMin,
    caption: rec.comment || '오늘의 미라밸을 기록했어요 🌿',
  });
  if (error) throw new Error(error.message);
}

export async function toggleFeedLike(
  postId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<void> {
  if (currentlyLiked) {
    const { error } = await supabase
      .from('feed_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('feed_likes').insert({
      post_id: postId,
      user_id: userId,
    });
    if (error) throw new Error(error.message);
  }
}

export async function addFeedComment(
  postId: string,
  userId: string,
  authorName: string,
  text: string
): Promise<void> {
  const { error } = await supabase.from('feed_comments').insert({
    post_id: postId,
    user_id: userId,
    author_name: authorName,
    text,
  });
  if (error) throw new Error(error.message);
}

// ---------- 유틸 ----------

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}

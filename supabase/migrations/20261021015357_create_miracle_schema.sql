/*
# Miracle Media Life Class — initial schema (fixed)

데모/시드 데이터는 인증 세션이 없으므로 feed_comments.user_id 를 nullable 로 설정.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL DEFAULT '갓생러',
  email text NOT NULL DEFAULT '',
  avatar_color text NOT NULL DEFAULT '#5d8a52',
  avatar_initial text NOT NULL DEFAULT '갓',
  goal_media_min int NOT NULL DEFAULT 120,
  provider text NOT NULL DEFAULT 'email',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- records
CREATE TABLE IF NOT EXISTS records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  media_min int NOT NULL DEFAULT 0,
  exercise_min int NOT NULL DEFAULT 0,
  study_min int NOT NULL DEFAULT 0,
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "records_select_own" ON records;
CREATE POLICY "records_select_own" ON records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "records_insert_own" ON records;
CREATE POLICY "records_insert_own" ON records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "records_update_own" ON records;
CREATE POLICY "records_update_own" ON records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- feed_posts
CREATE TABLE IF NOT EXISTS feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT '익명 갓생러',
  avatar_color text NOT NULL DEFAULT '#7ba6c7',
  avatar_initial text NOT NULL DEFAULT '익',
  media_min int NOT NULL DEFAULT 0,
  exercise_min int NOT NULL DEFAULT 0,
  study_min int NOT NULL DEFAULT 0,
  caption text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feed_posts_select_all" ON feed_posts;
CREATE POLICY "feed_posts_select_all" ON feed_posts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "feed_posts_insert_own" ON feed_posts;
CREATE POLICY "feed_posts_insert_own" ON feed_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "feed_posts_update_own" ON feed_posts;
CREATE POLICY "feed_posts_update_own" ON feed_posts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "feed_posts_delete_own" ON feed_posts;
CREATE POLICY "feed_posts_delete_own" ON feed_posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- feed_comments (user_id nullable: 데모 댓글은 인증 사용자 없음)
CREATE TABLE IF NOT EXISTS feed_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT '갓생러',
  text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feed_comments_select_all" ON feed_comments;
CREATE POLICY "feed_comments_select_all" ON feed_comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "feed_comments_insert_own" ON feed_comments;
CREATE POLICY "feed_comments_insert_own" ON feed_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "feed_comments_delete_own" ON feed_comments;
CREATE POLICY "feed_comments_delete_own" ON feed_comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- feed_likes
CREATE TABLE IF NOT EXISTS feed_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
ALTER TABLE feed_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feed_likes_select_all" ON feed_likes;
CREATE POLICY "feed_likes_select_all" ON feed_likes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "feed_likes_insert_own" ON feed_likes;
CREATE POLICY "feed_likes_insert_own" ON feed_likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "feed_likes_delete_own" ON feed_likes;
CREATE POLICY "feed_likes_delete_own" ON feed_likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_records_user_date ON records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created ON feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_comments_post ON feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_likes_post ON feed_likes(post_id);

-- 시드: 데모 피드 게시글
INSERT INTO feed_posts (author_name, avatar_color, avatar_initial, media_min, exercise_min, study_min, caption, created_at)
SELECT '미라클러 라온', '#7ba6c7', '라', 60, 55, 120, '오늘 도서관 2시간! 미디어는 딱 1시간만. 기적이 따로 없다, 매일이 기적 🌿', now() - interval '20 minutes'
WHERE NOT EXISTS (SELECT 1 FROM feed_posts WHERE author_name = '미라클러 라온');

INSERT INTO feed_posts (author_name, avatar_color, avatar_initial, media_min, exercise_min, study_min, caption, created_at)
SELECT '단디_디톡스', '#c97b5a', '단', 95, 80, 40, '저녁 산책 80분 + 인스타 줄이기 성공. 마음이 점점 맑아져요 ☁️→☀️', now() - interval '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM feed_posts WHERE author_name = '단디_디톡스');

INSERT INTO feed_posts (author_name, avatar_color, avatar_initial, media_min, exercise_min, study_min, caption, created_at)
SELECT '새벽공부러', '#d9a441', '새', 40, 25, 180, '새벽 5시 기상 3시간 몰입. 미디어는 알림 꺼놓고 시작하는 게 정답이었음 ✨', now() - interval '3 hours'
WHERE NOT EXISTS (SELECT 1 FROM feed_posts WHERE author_name = '새벽공부러');

-- 시드: 데모 댓글
INSERT INTO feed_comments (post_id, author_name, text)
SELECT p.id, '초록잎', '대박 진짜 갓생이네요!'
FROM feed_posts p
WHERE p.author_name = '미라클러 라온'
  AND NOT EXISTS (SELECT 1 FROM feed_comments fc WHERE fc.post_id = p.id AND fc.author_name = '초록잎');

INSERT INTO feed_comments (post_id, author_name, text)
SELECT p.id, '미라밸러', '산책 루틴 궁금해요!'
FROM feed_posts p
WHERE p.author_name = '단디_디톡스'
  AND NOT EXISTS (SELECT 1 FROM feed_comments fc WHERE fc.post_id = p.id AND fc.author_name = '미라밸러');

INSERT INTO feed_comments (post_id, author_name, text)
SELECT p.id, '단디_디톡스', '집 근처 공원 한 바퀴예요 🌳'
FROM feed_posts p
WHERE p.author_name = '단디_디톡스'
  AND NOT EXISTS (SELECT 1 FROM feed_comments fc WHERE fc.post_id = p.id AND fc.author_name = '단디_디톡스');

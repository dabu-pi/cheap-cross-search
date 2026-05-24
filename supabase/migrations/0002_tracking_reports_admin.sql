-- ============================================================
-- Phase 8 — admin_users / click_events / reported_products /
--            affiliate_settings / blocked_keywords
-- ============================================================
-- 適用方法:
--   Supabase ダッシュボード > SQL Editor に貼り付けて実行
--   0001_auth_favorites.sql を先に適用済みであること。
--
-- ⚠️ 本番 DB には手動で適用すること。自動適用しない。
-- ⚠️ affiliate_settings の affiliate_id は Git に入れない。
--    適用後 Supabase ダッシュボードの SQL Editor で手動 UPDATE すること。
--
-- 再実行安全化:
--   CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS
--   DROP POLICY IF EXISTS → CREATE POLICY
--   DROP TRIGGER IF EXISTS → CREATE TRIGGER
--   CREATE OR REPLACE FUNCTION
--   INSERT ... ON CONFLICT DO NOTHING
-- ============================================================


-- ──────────────────────────────────────────────────────────
-- STEP 1: admin_users（管理者）
-- ──────────────────────────────────────────────────────────
-- ⚠️ 他テーブルの RLS policy が admin_users を参照するため、
--    必ず最初に作成する。
-- ⚠️ 手動で INSERT するか、Supabase ダッシュボードから追加すること。
-- ⚠️ 自動登録ロジックを実装しない（セキュリティ上の理由）。

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text        not null default 'admin',  -- 'admin' | 'viewer'
  notes      text,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is '管理者ユーザーリスト（手動管理）';

-- RLS: 自分の行のみ読み取り可（管理者確認用）
alter table public.admin_users enable row level security;

drop policy if exists "admin_users: self read" on public.admin_users;
create policy "admin_users: self read"
  on public.admin_users for select
  using (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE は Supabase ダッシュボードで手動管理
-- （service role key を持つ操作のみ許可）


-- ──────────────────────────────────────────────────────────
-- STEP 2: shared helper function（更新日時自動セット）
-- ──────────────────────────────────────────────────────────
-- affiliate_settings / blocked_keywords の updated_at トリガーが使う。
-- CREATE OR REPLACE で冪等（再実行安全）。

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ──────────────────────────────────────────────────────────
-- STEP 3: click_events（クリックログ）
-- ──────────────────────────────────────────────────────────
-- /api/click 経由のクリックを記録するアフィリエイト計測テーブル。
-- 未ログインユーザーも記録する（user_id は nullable）。
-- セキュリティ: INSERT は誰でも可・SELECT/DELETE は管理者のみ。

create table if not exists public.click_events (
  id               bigserial primary key,
  shop_code        text        not null,       -- 'amazon' | 'shein' | 'aliexpress' | 'temu'
  offer_id         text,                       -- ProductOffer.id（任意）
  query            text,                       -- 検索ワード（任意）
  clicked_url      text        not null,       -- リダイレクト先の完全 URL
  destination_host text        not null,       -- リダイレクト先ホスト名
  source           text,                       -- 'search' | 'favorites' 等（任意）
  user_id          uuid references auth.users(id) on delete set null,
  session_id       text,                       -- 未ログインユーザー用セッション識別子
  clicked_at       timestamptz not null default now()
);

comment on table public.click_events is 'アフィリエイトクリックログ（Phase 6+）';

create index if not exists click_events_shop_code_idx  on public.click_events(shop_code);
create index if not exists click_events_clicked_at_idx on public.click_events(clicked_at desc);
create index if not exists click_events_user_id_idx    on public.click_events(user_id) where user_id is not null;

-- RLS: INSERT は全員可、SELECT/DELETE は管理者のみ
alter table public.click_events enable row level security;

drop policy if exists "click_events: anyone insert" on public.click_events;
create policy "click_events: anyone insert"
  on public.click_events for insert
  with check (true);

drop policy if exists "click_events: admin read" on public.click_events;
create policy "click_events: admin read"
  on public.click_events for select
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

drop policy if exists "click_events: admin delete" on public.click_events;
create policy "click_events: admin delete"
  on public.click_events for delete
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );


-- ──────────────────────────────────────────────────────────
-- STEP 4: reported_products（問題報告）
-- ──────────────────────────────────────────────────────────
-- /report ページからの商品問題報告を保存する。
-- 未ログインでも報告可能（reporter_user_id は nullable）。

create table if not exists public.reported_products (
  id                 bigserial primary key,
  offer_id           text,                        -- ProductOffer.id（任意）
  shop_code          text,                        -- 'amazon' 等（任意）
  title_snapshot     text,                        -- 報告時の商品タイトル
  reason             text        not null,        -- 'counterfeit' | 'dangerous' | ... (ReportReason)
  comment            text,                        -- ユーザーの任意コメント（最大500文字）
  reporter_user_id   uuid references auth.users(id) on delete set null,
  reporter_ip_hash   text,                        -- IPのハッシュ（スパム対策・任意）
  status             text        not null default 'pending',
                                                  -- 'pending' | 'reviewed' | 'actioned' | 'dismissed'
  admin_notes        text,                        -- 管理者メモ
  created_at         timestamptz not null default now(),
  reviewed_at        timestamptz
);

comment on table public.reported_products is '商品問題報告（Phase 7+）';

create index if not exists reported_products_status_idx     on public.reported_products(status);
create index if not exists reported_products_created_at_idx on public.reported_products(created_at desc);
create index if not exists reported_products_shop_code_idx  on public.reported_products(shop_code) where shop_code is not null;

-- RLS: INSERT は全員可、SELECT/UPDATE は管理者のみ
alter table public.reported_products enable row level security;

drop policy if exists "reported_products: anyone insert" on public.reported_products;
create policy "reported_products: anyone insert"
  on public.reported_products for insert
  with check (true);

drop policy if exists "reported_products: admin read" on public.reported_products;
create policy "reported_products: admin read"
  on public.reported_products for select
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

drop policy if exists "reported_products: admin update" on public.reported_products;
create policy "reported_products: admin update"
  on public.reported_products for update
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );


-- ──────────────────────────────────────────────────────────
-- STEP 5: affiliate_settings（アフィリエイト設定）
-- ──────────────────────────────────────────────────────────
-- ショップ別のアフィリエイト設定を管理する。
-- ⚠️ affiliate_id は絶対に Git に入れない。DB のみで管理。
-- ⚠️ 初期データ INSERT 後、affiliate_id は手動 UPDATE すること。

create table if not exists public.affiliate_settings (
  id                     uuid        primary key default gen_random_uuid(),
  shop_code              text        not null unique,
  shop_name              text        not null,
  enabled                boolean     not null default false,
  affiliate_id           text        not null default '',  -- ⚠️ 実 ID は Git に入れない
  link_template          text        not null default '',
  tracking_params        jsonb       not null default '{}',
  price_display_allowed  boolean     not null default true,
  image_display_allowed  boolean     not null default true,
  cache_ttl_minutes      integer     not null default 60,
  notes                  text        not null default '',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.affiliate_settings is 'アフィリエイト設定（Phase 6+）— affiliate_id はGit禁止';

drop trigger if exists affiliate_settings_updated_at on public.affiliate_settings;
create trigger affiliate_settings_updated_at
  before update on public.affiliate_settings
  for each row execute function public.set_updated_at();

-- RLS: 一般ユーザーは enabled=true のみ読み取り、管理者は全操作
alter table public.affiliate_settings enable row level security;

drop policy if exists "affiliate_settings: public read enabled" on public.affiliate_settings;
create policy "affiliate_settings: public read enabled"
  on public.affiliate_settings for select
  using (enabled = true);

drop policy if exists "affiliate_settings: admin all" on public.affiliate_settings;
create policy "affiliate_settings: admin all"
  on public.affiliate_settings for all
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

-- 初期データ（affiliate_id は空文字列 — 後で手動 UPDATE）
insert into public.affiliate_settings
  (shop_code, shop_name, enabled, affiliate_id, link_template, tracking_params, notes)
values
  ('amazon',
   'Amazon',
   false,
   '',
   'https://www.amazon.co.jp/dp/{asin}?tag={affiliate_id}',
   '{}',
   'Amazon アソシエイト ID を設定。PA-API は別途申請が必要。'),
  ('shein',
   'SHEIN',
   false,
   '',
   '',
   '{"ref": "{affiliate_id}"}',
   'SHEIN アフィリエイトプログラム参加が必要。'),
  ('aliexpress',
   'AliExpress',
   false,
   '',
   'https://s.click.aliexpress.com/e/{affiliate_id}?productUrl={product_url}',
   '{}',
   'AliExpress Affiliate Program API 経由のトラッキングリンク。'),
  ('temu',
   'Temu',
   false,
   '',
   '',
   '{"refer_source": "{affiliate_id}"}',
   'Temu アフィリエイト申請が必要。画像利用条件は要確認。')
on conflict (shop_code) do nothing;


-- ──────────────────────────────────────────────────────────
-- STEP 6: blocked_keywords（除外・注意キーワードルール）
-- ──────────────────────────────────────────────────────────
-- rules.ts（ハードコード）の補完として DB に動的ルールを追加できる構造。
-- Phase 8 では初期データなし（rules.ts のルールが正本）。
-- 将来的に管理画面から動的追加できるようにする。

create table if not exists public.blocked_keywords (
  id          bigserial   primary key,
  keyword     text        not null,
  level       text        not null default 'blocked',  -- 'blocked' | 'caution'
  category    text        not null default 'other',
  reason      text        not null default '',
  enabled     boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.blocked_keywords is 'DB 管理の動的キーワードルール（rules.ts を補完）';

create unique index if not exists blocked_keywords_keyword_level_idx
  on public.blocked_keywords(keyword, level);

create index if not exists blocked_keywords_enabled_idx
  on public.blocked_keywords(enabled) where enabled = true;

drop trigger if exists blocked_keywords_updated_at on public.blocked_keywords;
create trigger blocked_keywords_updated_at
  before update on public.blocked_keywords
  for each row execute function public.set_updated_at();

-- RLS: 一般ユーザーは enabled のみ読み取り、管理者は全操作
alter table public.blocked_keywords enable row level security;

drop policy if exists "blocked_keywords: public read enabled" on public.blocked_keywords;
create policy "blocked_keywords: public read enabled"
  on public.blocked_keywords for select
  using (enabled = true);

drop policy if exists "blocked_keywords: admin all" on public.blocked_keywords;
create policy "blocked_keywords: admin all"
  on public.blocked_keywords for all
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );


-- ============================================================
-- 実行後の確認 SQL — SQL Editor でこれを実行してテーブルを確認する
-- ============================================================

-- [確認1] 5テーブルの存在確認（全て NOT NULL なら成功）
-- select
--   to_regclass('public.admin_users')       as admin_users,
--   to_regclass('public.click_events')      as click_events,
--   to_regclass('public.reported_products') as reported_products,
--   to_regclass('public.affiliate_settings') as affiliate_settings,
--   to_regclass('public.blocked_keywords')  as blocked_keywords;
--
-- 期待: 全列に 'admin_users', 'click_events', ... と表示される（null でない）

-- [確認2] RLS 有効確認（rowsecurity = true が5行）
-- select schemaname, tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
--   and tablename in (
--     'admin_users', 'click_events', 'reported_products',
--     'affiliate_settings', 'blocked_keywords'
--   )
-- order by tablename;
--
-- 期待: 5行すべて rowsecurity = true

-- [確認3] 全テーブル一覧（0001 + 0002 合計 9テーブル）
-- select table_name from information_schema.tables
-- where table_schema = 'public'
-- order by table_name;
--
-- 期待:
--   admin_users
--   affiliate_settings
--   blocked_keywords
--   click_events
--   favorite_products
--   favorite_queries
--   profiles
--   reported_products
--   search_queries

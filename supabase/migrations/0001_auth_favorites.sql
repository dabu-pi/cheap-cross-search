-- ============================================================
-- Phase 3 Auth + お気に入り — DB スキーマ
-- ============================================================
-- 適用方法:
--   Supabase ダッシュボード > SQL Editor に貼り付けて実行
--   または supabase CLI: supabase db push
--
-- 注意:
--   本番 Supabase プロジェクト作成後、ダッシュボードで実行すること。
--   このファイルをそのまま自動適用しない。
-- ============================================================


-- ──────────────────────────────────────────────────────────
-- 1. profiles（ユーザープロフィール）
-- ──────────────────────────────────────────────────────────
-- auth.users の拡張テーブル。
-- auth.users への INSERT トリガーで自動作成する。

create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  avatar_url     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.profiles is 'ユーザープロフィール（auth.users の拡張）';

-- RLS: 自分のプロフィールのみ読み書き可能
alter table public.profiles enable row level security;

create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: self update"
  on public.profiles for update
  using (auth.uid() = id);

-- auth.users INSERT 時に profiles を自動作成するトリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ──────────────────────────────────────────────────────────
-- 2. search_queries（検索履歴）
-- ──────────────────────────────────────────────────────────
-- ログインユーザーの検索ワードを記録。
-- Phase 3 では重複チェックなし（毎回 insert）。
-- Phase 4 以降で upsert / 重複排除を検討。

create table if not exists public.search_queries (
  id               bigserial primary key,
  user_id          uuid not null references auth.users(id) on delete cascade,
  query            text not null,           -- 入力ワード（元の大小文字）
  normalized_query text not null,           -- trim + 連続スペース圧縮後
  locale           text not null default 'ja',
  currency         text not null default 'JPY',
  created_at       timestamptz not null default now()
);

comment on table public.search_queries is 'ログインユーザーの検索履歴';

create index if not exists search_queries_user_id_idx on public.search_queries(user_id);
create index if not exists search_queries_created_at_idx on public.search_queries(created_at desc);

-- RLS: 自分の検索履歴のみ操作可能
alter table public.search_queries enable row level security;

create policy "search_queries: self read"
  on public.search_queries for select
  using (auth.uid() = user_id);

create policy "search_queries: self insert"
  on public.search_queries for insert
  with check (auth.uid() = user_id);

create policy "search_queries: self delete"
  on public.search_queries for delete
  using (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────
-- 3. favorite_products（お気に入り商品）
-- ──────────────────────────────────────────────────────────
-- ProductOffer のスナップショットを保存。
-- 実 API テーブルが未実装のため、Phase 3 では商品情報を直接保持する。
-- Phase 5 以降で product_offers テーブルに正規化予定。

create table if not exists public.favorite_products (
  id                     bigserial primary key,
  user_id                uuid not null references auth.users(id) on delete cascade,
  shop_code              text not null,
  title                  text not null,
  image_url              text,
  product_url            text not null,
  affiliate_url          text,
  item_price             numeric,
  shipping_price         numeric,
  estimated_total_price  numeric,
  currency               text not null default 'JPY',
  price_confidence       text,  -- 'high' | 'medium' | 'low' | 'unknown'
  created_at             timestamptz not null default now()
);

comment on table public.favorite_products is 'お気に入り商品（ProductOffer スナップショット）';

-- 同一ユーザー・同一 product_url の重複お気に入りを防ぐ
create unique index if not exists favorite_products_user_url_idx
  on public.favorite_products(user_id, product_url);

create index if not exists favorite_products_user_id_idx on public.favorite_products(user_id);

-- RLS: 自分のお気に入りのみ操作可能
alter table public.favorite_products enable row level security;

create policy "favorite_products: self read"
  on public.favorite_products for select
  using (auth.uid() = user_id);

create policy "favorite_products: self insert"
  on public.favorite_products for insert
  with check (auth.uid() = user_id);

create policy "favorite_products: self delete"
  on public.favorite_products for delete
  using (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────
-- 4. favorite_queries（お気に入り検索ワード）
-- ──────────────────────────────────────────────────────────

create table if not exists public.favorite_queries (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  query      text not null,
  created_at timestamptz not null default now()
);

comment on table public.favorite_queries is 'お気に入り検索ワード';

-- 同一ユーザー・同一クエリの重複を防ぐ
create unique index if not exists favorite_queries_user_query_idx
  on public.favorite_queries(user_id, query);

create index if not exists favorite_queries_user_id_idx on public.favorite_queries(user_id);

-- RLS: 自分のお気に入りのみ操作可能
alter table public.favorite_queries enable row level security;

create policy "favorite_queries: self read"
  on public.favorite_queries for select
  using (auth.uid() = user_id);

create policy "favorite_queries: self insert"
  on public.favorite_queries for insert
  with check (auth.uid() = user_id);

create policy "favorite_queries: self delete"
  on public.favorite_queries for delete
  using (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────
-- 5. click_events（クリックログ — Phase 6 向け案）
-- ──────────────────────────────────────────────────────────
-- Phase 3 では未使用。Phase 6 収益化時に実装予定。
-- 構造だけ参考として記載（コメントアウト）。

/*
create table if not exists public.click_events (
  id              bigserial primary key,
  user_id         uuid references auth.users(id) on delete set null,
  session_id      text,           -- 未ログインユーザー用
  shop_code       text not null,
  product_url     text not null,
  affiliate_url   text,
  clicked_at      timestamptz not null default now()
);
*/

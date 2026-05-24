-- ============================================================
-- 0003_fix_reported_products_insert_policy.sql
-- /report 送信失敗修正: reported_products / click_events の
-- anon / authenticated ロールへの明示的 GRANT 追加
--
-- 背景:
--   0002 migration で RLS policy ("with check (true)") は設定済みだが、
--   Supabase SQL Editor 経由で作成したテーブルには
--   ALTER DEFAULT PRIVILEGES が自動適用されない場合がある。
--   anon ロールが INSERT 権限を持たないため /report 送信が 403/RLS エラーで失敗。
--
-- 安全性:
--   - 既存テーブルの DROP / データ削除なし
--   - べき等（何度実行しても同じ結果）
--   - 既存 RLS policy は DROP IF EXISTS → 再作成で idempotent に保つ
--
-- 適用方法:
--   Supabase Dashboard > SQL Editor > New query
--   このファイルの内容を貼り付けて「Run」
--
-- 適用後の確認 SQL:
--   SELECT grantee, table_name, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE table_name IN ('reported_products', 'click_events')
--     AND grantee IN ('anon', 'authenticated')
--   ORDER BY table_name, grantee, privilege_type;
-- ============================================================

-- ── STEP 1: schema usage 権限（念のため再付与） ─────────────────
grant usage on schema public to anon;
grant usage on schema public to authenticated;

-- ── STEP 2: reported_products — 明示的 GRANT ─────────────────────
-- anon: INSERT のみ（誰でも通報可能にする）
grant insert on public.reported_products to anon;
-- authenticated: INSERT + SELECT（ログインユーザーは自分の通報を参照可能）
grant insert, select on public.reported_products to authenticated;

-- ── STEP 3: click_events — 明示的 GRANT ──────────────────────────
-- anon: INSERT のみ（クリック計測は未ログインでも記録）
grant insert on public.click_events to anon;
-- authenticated: INSERT + SELECT
grant insert, select on public.click_events to authenticated;

-- ── STEP 4: affiliate_settings — anon SELECT GRANT ───────────────
-- アフィリエイト設定の読み取り（将来の公開取得用）
grant select on public.affiliate_settings to anon;
grant select on public.affiliate_settings to authenticated;

-- ── STEP 5: blocked_keywords — anon SELECT GRANT ────────────────
-- 検索フィルター適用時に必要
grant select on public.blocked_keywords to anon;
grant select on public.blocked_keywords to authenticated;

-- ── STEP 6: admin_users — authenticated SELECT GRANT ────────────
-- 管理者判定チェック（service_role からしか書き込まない）
grant select on public.admin_users to authenticated;

-- ── STEP 7: reported_products RLS policy 再作成（idempotent） ────
-- 既存 policy を DROP して再作成（内容は同じだが GRANT とセットで適用）
drop policy if exists "reported_products: anyone insert" on public.reported_products;
create policy "reported_products: anyone insert"
  on public.reported_products
  for insert
  with check (true);

drop policy if exists "reported_products: owner select" on public.reported_products;
create policy "reported_products: owner select"
  on public.reported_products
  for select
  using (auth.uid() = user_id);

-- ── STEP 8: click_events RLS policy 再作成（idempotent） ─────────
drop policy if exists "click_events: anyone insert" on public.click_events;
create policy "click_events: anyone insert"
  on public.click_events
  for insert
  with check (true);

drop policy if exists "click_events: admin select" on public.click_events;
create policy "click_events: admin select"
  on public.click_events
  for select
  using (
    exists (
      select 1
      from public.admin_users
      where user_id = auth.uid()
        and is_active = true
    )
  );

-- ── 完了確認クエリ（実行後に別クエリとして確認） ──────────────────
-- 以下を別途実行して INSERT / SELECT が grantee に表示されることを確認:
--
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_name IN (
--   'reported_products', 'click_events',
--   'affiliate_settings', 'blocked_keywords', 'admin_users'
-- )
--   AND grantee IN ('anon', 'authenticated')
-- ORDER BY table_name, grantee, privilege_type;

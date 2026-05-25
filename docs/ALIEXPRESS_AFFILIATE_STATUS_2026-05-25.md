# AliExpress Affiliate 審査結果記録・再申請 HOLD（2026-05-25）

ECサイト比較.com / cheap-cross-search の AliExpress Affiliate Program 登録結果と、今後の再申請方針の記録。

## 1. 審査結果：不承認

AliExpress Affiliate Program から登録不承認メールを受領した。

| 項目 | 内容 |
|---|---|
| 件名 | AliExpress Affiliate Program - Your affiliate account registration failed |
| 結果 | 不承認（registration was not approved / registration failed）|
| 受領日 | 2026-05-25 |
| 申請日（参考）| 2026-05-23 提出（PROJECT_STATUS 記録より）|

### メール内容要約

- Your affiliate account registration failed.
- Unfortunately, your registration was not approved.
- The site information that you have submitted is invalid or non-compliant.
- Please check the site information, such as the "URL", "Media type" and "Description", etc.
- Reapply from https://portals.aliexpress.com/ by modifying the site information.

## 2. 推定原因

API 実装の問題ではなく、**申請時のサイト情報（site information）の不備**で落ちた可能性が高い。

- 申請時の **URL / Media type / Description** が invalid または non-compliant と判定された
- 公開サイトとしての信頼性・説明・運営者情報・問い合わせ・アフィリエイト表記などが
  審査担当者から見て不十分だった可能性

> サイトのコード・アダプタ実装（`aliexpress-portals.ts` スタブ等）は審査落ちの原因ではない。
> 現状 AliExpress は `link_only` fallback で動作しており、サービス自体は問題なく稼働している。

## 3. 方針：今回はすぐに再申請しない（HOLD）

今回はすぐに再申請しない。以下の理由による。

- まだサイト**運用開始前・運用実績が少ない**
- 公開サイトとしての信頼性・説明・運営者情報・問い合わせ・アフィリエイト表記などを
  **整えてから**再申請する方が承認されやすい
- AliExpress 再申請は、**サイトが実際に運用されてから**行う

## 4. 再申請の条件（これらが整ってから再申請する）

再申請前に以下を整備する。現状の有無を併記する。

| 整備項目 | 現状 | 補足 |
|---|---|---|
| 正式URLまたは安定した公開URL | △ 仮ドメイン稼働中（`https://cheap-cross-search.vercel.app`）| 審査上は正式ドメインの方が有利な可能性。ドメイン取得・DNS は人側作業 |
| サイト説明 | ◯ トップ / OGP に記載あり | 審査向けに英語 Description も用意予定 |
| 運営者情報 | ✗ 専用ページ未作成 | `/about` 等の運営者情報ページが未整備 |
| お問い合わせ | △ `/disclaimer` 内に「準備中」記載のみ | `/contact` 等の問い合わせ導線が未整備 |
| プライバシーポリシー | ◯ `/privacy` あり | — |
| 利用規約 | ◯ `/terms` あり | — |
| アフィリエイト広告表記（PR / 開示）| ◯ `/disclaimer` 内に開示あり | AliExpress は「申請中・審査結果待ち」表記。再申請時に文言更新が必要 |
| AliExpress を含む外部ECサイトへの遷移説明 | ◯ トップ / `/disclaimer` に外部検索モード・外部遷移の説明あり | 「ユーザーは商品リンクから外部販売サイトへ移動して購入する」旨をより明確化予定 |
| 違法・アダルト・偽ブランド・危険物を扱わない方針 | ◯ `/safety-policy` / `/terms` に明記 | — |

凡例: ◯=あり / △=部分的 / ✗=未整備

### 再申請時に AliExpress Portals へ入力する想定（メモ・確定値ではない）

実際の入力は再申請判断時に最新のサイト状態に合わせて確定する。

- **URL**: 正式ドメイン取得済みならそれを優先。未取得なら `https://cheap-cross-search.vercel.app`
- **Media type**: Portals の選択肢から Website / Content Website / Shopping comparison site に最も近いもの
- **Description**: 日本語ユーザー向けの商品検索・価格比較サービスであること、Amazon / 楽天 / Yahoo / SHEIN / AliExpress / Temu 等を横断比較すること、AliExpress 商品も選択肢として比較対象に含めユーザーが公式商品ページへ遷移して購入すること、アフィリエイト開示・プライバシー・利用規約・問い合わせを備えること、最終的な価格・在庫・送料は各販売サイトで確認する旨を明記する

> 上記の「再申請準備（ページ実装・英文 Description 案・正式ドメイン検討）」は **本記録時点では未実施**。
> 再申請を行うフェーズで別途実施する。

## 5. 今回実施・不実施の判断

| 項目 | 実施 | 判断理由 |
|---|---|---|
| PROJECT_STATUS.md 更新 | 実施 | 審査結果・HOLD 方針を記録 |
| ROADMAP.md 更新 | 実施 | AliExpress 再申請を HOLD として明記 |
| 本ドキュメント作成 | 実施 | 審査結果・再申請条件の一次記録 |
| サイトページ実装（/about, /contact 等）| **不実施** | 再申請をしない方針のため、運用開始フェーズで実施 |
| `npm run build` / `lint` / `typecheck` | **不実施** | コード変更なし（docs のみ）のため不要 |
| live-check-runner | **不実施** | コード変更なし。かつ他 Claude セッション稼働 + Chrome CDP 9222 占有のため Single Writer Rule 上も起動しない |
| AliExpress への再申請 | **不実施** | ユーザー指示により HOLD |

## 6. AliExpress 再申請ステータス

**HOLD（保留）** — サイト運用開始 + 上記「再申請の条件」整備後に再申請する。

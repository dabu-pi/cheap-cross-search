@AGENTS.md

<!-- HIRAYAMA_WORKSPACE_WORKFLOW:START -->

## Hirayama Workspace 共通作業ルール

このrepoでの作業では、Personal Skill
`hirayama-workspace-repo-workflow`
を必ず使用する。

共通ルールの正本：

`C:\hirayama-ai-workspace\CLAUDE_WORKFLOW_STANDARD.md`

ユーザーからの作業プロンプトは、原則として
「今回の差分指示」として扱う。

毎回プロンプトに共通ルールが再掲されていなくても、
以下を自動適用すること。

- Git最新確認
- dirty時停止
- repo内必須Markdown読込
- Skills確認
- 安全・禁止事項
- 検証
- 記録
- Dashboard参照元同期
- JBIZ handoff
- commit / push
- 最終報告

適用順：

1. 現在のユーザー明示指示
2. このrepoの固有ルール
3. `hirayama-workspace-repo-workflow`
4. Workspace共通正本
5. Git同期後の最新管理Markdown
6. 過去のプロンプト・古い報告

このrepo固有のルールが共通ルールより厳しい場合は、
厳しい方を適用する。

共通正本にないrepo固有事項は、
この `CLAUDE.md` を正本とする。

ユーザーへ共通ルールの再掲を求めない。
不足情報はrepo内の最新正本から確認する。

<!-- HIRAYAMA_WORKSPACE_WORKFLOW:END -->

---

<!-- HIRAYAMA_BUSINESS_ENTITY_BOUNDARY_START -->
## 事業主体・屋号（中央正本を必ず読む）

| 項目 | 内容 |
|---|---|
| 中央正本 | `C:\hirayama-ai-workspace\BUSINESS_ENTITY_BOUNDARY_STANDARD.md` |
| repo 対応表 | `C:\hirayama-ai-workspace\BUSINESS_ENTITY_REPO_MAP.md` |

- **作業開始時に必ず中央正本を読む。** 区分の本文はここへ複製しない（正本を 2 つにしない）。
- **この repo の事業主体:** **未確定（`OWNER_CONFIRMATION_REQUIRED`）。** EC 横断検索・アフィリエイト収益モデルだが、対外提供主体・サイト運営主体・アフィリエイト契約主体は owner 未決定。AI 利用・EC 形態を理由に法人事業と判断しない。
- 主体が確定できない場合は、推測せず **`OWNER_CONFIRMATION_REQUIRED`** で停止し、owner 確認まで進めない。
- **法人事業（株式会社ひらやま）と個人事業（マシンやさんグループ／ワイルドボア／ひらやま接骨院／あさご暮らしサポート）を推測で変更しない。**
- **あさご暮らしサポート（個人事業・生活支援／一般廃棄物収集運搬）は、マシンやさんグループとも株式会社ひらやまとも別主体。** 売上・請求・台帳・会計主体を混在させない（正本 §2 / §2.0 / §2.1 W-1・2026-08-04 確定）。
  repo 名・ドメイン・メールアドレス・口座・既存文面を主体の根拠にしない。既存の正しい屋号表記を法人名へ統一しない。
<!-- HIRAYAMA_BUSINESS_ENTITY_BOUNDARY_END -->

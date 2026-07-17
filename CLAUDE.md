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

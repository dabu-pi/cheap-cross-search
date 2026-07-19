---
name: kwp-testing-strategy
description: 仕様と変更範囲から、必要なテストだけを選んでテスト戦略を作る。既存testsを先に調査し、過剰なテスト追加を避け、回帰リスクの高い箇所を優先する。unit／integration／E2E／visual／manualを使い分け、Preview確認とProduction前確認を分離する。変更概要・既存テスト状況・回帰リスク・必須／推奨／不要テスト・手動確認・Preview確認・Production前確認・合格条件を構造化して出力する。Anthropic公式testing-strategyの平山版下位テンプレート。disable-model-invocationにより自動発火せず、平山が /kwp-testing-strategy で明示起動したときだけ使う。
disable-model-invocation: true
---

# kwp-testing-strategy（平山版・テスト戦略）

> **このSkillは平山独自開発ルールの下位テンプレートである。**
> `CLAUDE.md`、`CLAUDE_WORKFLOW_STANDARD.md`、
> Personal Skill `hirayama-workspace-repo-workflow`、
> および対象repo固有ルールが常に優先される。
> 本Skillの指示が上位ルールと矛盾する場合は、常に上位ルールを採る。

このSkillは、Anthropic公式 `knowledge-work-plugins` の `engineering/skills/testing-strategy`
を出発点に、平山ワークスペースの運用へ合わせて作り直したテスト戦略テンプレートである。
公式原本は `upstream-snapshot/94e1a08/` に改変なしで保管している。

外部Connector・MCP・OAuth・Slack・GitHub API・Notion・Datadog・Gmail 等は前提にしない。
これらが接続されていなくても、repo内の情報だけで完結させる。

---

## 目的

仕様または変更内容を受け取り、**その変更に必要なテストだけ**を選定して戦略を返す。

```text
仕様・変更範囲
→ 既存testsの調査
→ 回帰リスクの特定
→ 必要なテストの選定（過剰を避ける）
→ Preview確認とProduction前確認の分離
→ 合格条件
```

すべてのテストを毎回必須にはしない。変更内容に必要なものだけを選び、**選定理由を必ず示す**。

---

## 開始時に調べること（存在するものだけ）

対象repo内で次を探して読む。**無いファイルの新規作成を自動で要求しない。**

```text
CLAUDE.md
PROJECT_STATUS.md
NEXT_ACTIONS.md
RUN_LOG.md
HUMAN_NEXT_ACTIONS.md
README.md
package.json（test / lint / build / typecheck スクリプト、CI設定）
tests / __tests__ / *.test.* / *.spec.* / e2e / playwright 等
既存のテスト設定（jest / vitest / playwright.config 等）
```

既存testsを先に調査してから戦略を組む。既にカバーされている領域へ重複を足さない。

---

## 選定の考え方

- 回帰リスクの高い箇所を優先する。壊れたときの影響が大きい／変更が触れる中心を先に守る。
- 過剰なテスト追加を避ける。trivialなgetter/setter・framework code・一度きりのscriptは対象にしない。
- unit／integration／E2E／visual／manual を使い分ける。速く多く回せるものを土台に、E2E・visualは要所へ絞る。
- **Preview確認とProduction確認を分離する。** Previewで見るもの／Production前に最後に確かめるものを分けて書く。

---

## 最低限、要否を検討する項目

次の各項目について「必要／不要」と**その理由**を判定する。全部を必須にはしない。

```text
- typecheck
- lint
- unit tests
- integration tests
- build
- E2E
- visual確認
- accessibility
- Supabase schema／RLSへの影響
- Vercel Preview
- ロールバック確認
```

Supabase schema／RLS・本番DBに影響しうる変更は、影響有無を必ず明記する（変更の実行はしない）。

---

## 平山ワークスペース固有の制約

- 本番書込み・外部送信につながる検証は戦略に含めない（typecheck/lint/test/build/read-only/Preview に留める）。
- Vercel は Protected Preview → owner visual確認 → main merge → Production の順序を前提にする。
- Supabase・本番DBへの変更を検証手段として実行する計画を書かない。
- 実行しなかった検証は、省略した理由を記録する（黙って省略しない）。

---

## 出力形式

ALWAYS 次の見出し構成で出力する。

```text
1. 変更概要
   - 何がどう変わるか（仕様・変更範囲の要約）
2. 既存テスト状況
   - 調査で分かった現在のテスト構成・カバー範囲・使用フレームワーク
3. 主な回帰リスク
   - この変更で壊れやすい箇所・影響が大きい箇所
4. 必須テスト
   - 今回必ず実施するもの＋各選定理由
5. 推奨テスト
   - 余力があれば実施するもの＋理由
6. 不要なテスト
   - 今回あえてやらないもの＋理由（過剰を避ける判断を明示）
7. 手動確認
   - 自動化しない／できない確認手順
8. Preview確認
   - Vercel Preview（Protected）で確認する項目
9. Production前の確認
   - main merge 後・Production 反映前に最後に確かめる項目・ロールバック確認
10. 合格条件
    - これを満たせばマージ／反映してよいと言える条件
```

---

## 出力のコツ

- カバレッジ・速度・保守コストのバランスを取る。速いテストを多く、遅いテストは要所へ。
- 「なぜそのテストが必要か／不要か」を毎回言語化する。理由の無い網羅は保守負債になる。
- Preview で見ればよいものと、Production 直前でしか確認できないものを混同しない。

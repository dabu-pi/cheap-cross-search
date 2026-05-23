# 開発ワークフロー — 安買い横断サーチ

> 最終更新: 2026-05-24  
> このファイルは Claude 複数起動・同時作業を安全に行うためのルールを定めます。

---

## リポジトリ構成

| 項目 | 内容 |
|---|---|
| repo | `dabu-pi/cheap-cross-search` |
| URL | https://github.com/dabu-pi/cheap-cross-search |
| ローカルパス | `C:\hirayama-ai-workspace\workspace\cheap-cross-search` |
| 親 workspace との関係 | `C:\hirayama-ai-workspace\workspace` の **サブディレクトリ**。独立 Git repo として運用 |

### workspace 親 repo との分離ルール

- cheap-cross-search のアプリ本体コードは **この独立 repo のみで管理** する
- workspace 親 repo（`hirayama-ai-workspace`）は共通ツール・横断管理用
- workspace 親 repo に安買い横断サーチのアプリコードを混ぜない
- `tools/live-check-runner/` 等の共通ツールを使う場合は、workspace 側の変更範囲を明確にする

---

## ブランチ戦略

```
main
  └─ Phase 0-1 完了済み安定版（保護対象）
     └─ feature/phase2-product-card-ui  ← Phase 2 作業ブランチ
     └─ feature/phase3-xxx              ← Phase 3 作業ブランチ（将来）
```

### ルール

| ルール | 内容 |
|---|---|
| **1 Claude = 1 branch = 1 scope** | Claude 1 セッション = 1 フィーチャーブランチ = 1 Phase スコープ |
| **main 直接作業禁止** | main への直接 commit・push は禁止。必ず feature branch 経由で PR merge |
| **Phase ごとに branch を分ける** | Phase2 は `feature/phase2-*`、Phase3 は `feature/phase3-*` |
| **merge 後は branch 削除** | マージ済みブランチは削除して汚染を防ぐ |

---

## 作業開始前の必須チェック

```powershell
cd C:\hirayama-ai-workspace\workspace\cheap-cross-search

# 1. 最新状態に同期
git fetch --all --prune
git pull --ff-only

# 2. 状態確認
git status -sb
git log --oneline -5

# 3. missing tracked files チェック
git ls-files -d

# 4. 並行 Claude プロセス確認
Get-Process | Where-Object {
  $_.ProcessName -match 'claude|node|npm|npx|tsx'
} | Select-Object Id, ProcessName, StartTime | Format-Table -AutoSize
```

### 止まる条件

以下のいずれかに該当する場合は **作業を開始しない**。

- `git status` が dirty（未コミット変更あり）
- `git ls-files -d` に出力あり（missing tracked files）
- `git pull --ff-only` が失敗（fast-forward できない = conflict の可能性）
- ahead/behind が予期しない値（push 漏れ・force push の可能性）
- 別 Claude セッションが同一 branch に作業中

---

## 作業手順（標準フロー）

```powershell
# 1. 作業開始前チェック（上記）
git fetch --all --prune
git pull --ff-only
git status -sb
git ls-files -d

# 2. feature branch に切り替え
git checkout feature/phase2-product-card-ui

# 3. 実装

# 4. 検証
npm run lint
npm run build

# 5. commit
git add -A
git commit -m "feat(phase2): ..."

# 6. push
git push origin feature/phase2-product-card-ui

# 7. clean 確認
git status -sb
git ls-files -d
```

---

## 完了条件（CLOSED とは）

以下を全て満たすまで完了としない。

- [ ] 実装完了
- [ ] `npm run lint` 警告 0
- [ ] `npm run build` 成功
- [ ] `git status -sb` clean（dirty なし）
- [ ] `git ls-files -d` 0 件
- [ ] commit / push 完了
- [ ] ahead/behind 0/0
- [ ] Markdown 記録完了（PROJECT_STATUS.md / ROADMAP.md）
- [ ] 作業内容・検証結果・残課題を docs に記録済み

---

## Phase 管理

| Phase | ブランチ | 状態 | 内容 |
|---|---|---|---|
| Phase 0 | main | ✅ 完了 | プロジェクト基盤・設計 |
| Phase 1 | main | ✅ 完了 | 4ショップ横断検索基盤（link-only adapter）|
| Phase 2 | `feature/phase2-product-card-ui` | 🔜 次 | 商品カードUI・比較表示 |
| Phase 3 | TBD | - | 実 API 接続（Amazon PA-API等）|
| Phase 4 | TBD | - | Supabase Auth・管理画面 |
| Phase 5 | TBD | - | アフィリエイト設定・収益化 |

---

## 並行作業の禁止事項

| 項目 | 理由 |
|---|---|
| 同一 feature branch への並行 commit | last-writer-wins でコードが壊れる |
| main への直接 push | 安定版が壊れる |
| `package-lock.json` の並行変更 | merge 不可能 |
| 同一 Markdown ファイルへの並行追記 | merge conflict |

---

## live-check-runner との連携

- workspace の `tools/live-check-runner/` を使う場合は、single writer 運用（CLAUDE.md 参照）
- spec ファイルは `tools/live-check-runner/specs/cheap-cross-search/` に配置する（予定）
- `auth.json` 更新中は他 Claude の verify を停止する

---

## 緊急時の対処

```powershell
# dirty になった場合 — 原因確認してから判断
git diff --stat
git status --short

# 想定外の変更があれば止まって報告
# git reset --hard は原因確認なしに実行しない
```

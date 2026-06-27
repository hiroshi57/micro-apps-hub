# 足軽 指示書

## 役割
割り当てられたコーディングタスクを実装し、報告する。

## 禁止事項
- 家老への send-keys 禁止（reports ファイルのみで報告）
- 他の足軽のタスクファイルを触らない
- .env / state/ をコミットしない
- task に書かれていない変更を加えない

## 実行フロー
1. 家老から通知を受けたら queue/tasks/ashigaru{自分の番号}.yaml を読む
2. base_dir に cd して実装する
3. npm run build で確認
4. 完了したら queue/reports/ashigaru{番号}_report.yaml に結果を書く
5. 次の通知を待つ（ポーリング禁止）

## 報告フォーマット
```yaml
ashigaru: N
task_id: task-xxx
status: completed  # or failed
files_changed:
  - path/to/file.tsx
build_ok: true
notes: "特記事項があれば"
skill_candidate: "再利用できそうなパターンがあれば記述"
```

## 作業ディレクトリ
/path/to/micro-apps-hub

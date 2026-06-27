#!/bin/bash
# ============================================================
# MicroApps Hub — Shogun 出陣スクリプト
# 使い方: bash .shogun/start-shogun.sh
# ============================================================

WORK_DIR="/path/to/micro-apps-hub"
CLAUDE_CMD="claude"

echo "🏯 将軍システム 起動中..."

# ── 将軍セッション ──────────────────────────────────────
tmux new-session -d -s shogun -x 220 -y 50
tmux send-keys -t shogun:0.0 "cd $WORK_DIR" Enter
tmux send-keys -t shogun:0.0 "echo '将軍ペイン起動済み。claude を起動してください。'" Enter

# ── マルチエージェントセッション（9ペイン）──────────────
tmux new-session -d -s multiagent -x 220 -y 50

# 家老ペイン(0.0)は最初から存在
tmux send-keys -t multiagent:0.0 "cd $WORK_DIR && echo '家老ペイン(0.0)'" Enter

# 足軽1〜6 のペインを追加（水平分割）
for i in 1 2 3 4 5 6; do
  tmux split-window -t multiagent -v
  tmux send-keys -t multiagent:0.$i "cd $WORK_DIR && echo '足軽${i}ペイン(0.${i})'" Enter
done

# タイルレイアウトに整える
tmux select-layout -t multiagent tiled

echo ""
echo "✅ tmux セッション起動完了！"
echo ""
echo "接続方法:"
echo "  将軍ペイン: tmux attach -t shogun"
echo "  家老・足軽: tmux attach -t multiagent"
echo ""
echo "各ペインで以下を実行して Claude Code を起動:"
echo "  claude"
echo ""
echo "起動後の最初の指示:"
echo "  将軍: '.shogun/instructions/shogun.md を読み、家老に出陣指示を出せ'"
echo "  家老(0.0): '.shogun/instructions/karo.md を読み、queue/shogun_to_karo.yaml の指示に従え'"
echo "  足軽N(0.N): '.shogun/instructions/ashigaru.md を読み、queue/tasks/ashigaru{N}.yaml を実行せよ'"

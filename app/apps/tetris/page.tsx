'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import { FlowEngine, type RewardEvent } from '@/lib/flow-engine';
import { FreemiumGate, GAME_FREEMIUM_CONFIGS } from '@/lib/freemium-gate';
import { ProWallModal, ScorePopup, FlowIndicator } from '@/app/components/ProWallModal';
import { recordGameResult } from '@/lib/learning';

// ============================================================
// テトリス定数
// ============================================================
const COLS = 10;
const ROWS = 20;
const FREE_MAX_LEVEL = 5;

const SHAPES: number[][][] = [
  [[1,1,1,1]],                      // I
  [[1,1],[1,1]],                    // O
  [[0,1,0],[1,1,1]],                // T
  [[1,0,0],[1,1,1]],                // L
  [[0,0,1],[1,1,1]],                // J
  [[0,1,1],[1,1,0]],                // S
  [[1,1,0],[0,1,1]],                // Z
];

const COLORS = ['#06b6d4','#eab308','#a855f7','#f97316','#3b82f6','#22c55e','#ef4444'];

type Board = (string | null)[][];

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece() {
  const i = Math.floor(Math.random() * SHAPES.length);
  return { shape: SHAPES[i], color: COLORS[i], x: 3, y: 0 };
}

type Piece = ReturnType<typeof randomPiece>;

function rotate(shape: number[][]): number[][] {
  return shape[0].map((_, c) => shape.map(r => r[c]).reverse());
}

function collides(board: Board, piece: Piece, dx = 0, dy = 0, shape = piece.shape): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function merge(board: Board, piece: Piece): Board {
  const b = board.map(row => [...row]);
  piece.shape.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) b[piece.y + r][piece.x + c] = piece.color;
    })
  );
  return b;
}

function clearLines(board: Board): [Board, number] {
  const filtered = board.filter(row => row.some(c => !c));
  const cleared = ROWS - filtered.length;
  const newBoard = [
    ...Array.from({ length: cleared }, () => Array(COLS).fill(null)),
    ...filtered,
  ];
  return [newBoard, cleared];
}

// ============================================================
// Component
// ============================================================
export default function TetrisPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    board: emptyBoard(),
    piece: randomPiece(),
    next: randomPiece(),
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    paused: false,
  });

  const [display, setDisplay] = useState({ score: 0, level: 1, lines: 0, gameOver: false });
  const [showProWall, setShowProWall] = useState(false);
  const [rewardEvents, setRewardEvents] = useState<RewardEvent[]>([]);
  const [flowState, setFlowState] = useState({ streak: 0, level: 1, xp: 0, hookMsg: '' });
  const flowRef = useRef<FlowEngine | null>(null);
  const gateRef = useRef<FreemiumGate | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // FlowEngine & FreemiumGate 初期化
  useEffect(() => {
    flowRef.current = new FlowEngine('tetris');
    const cfg = GAME_FREEMIUM_CONFIGS['tetris'];
    gateRef.current = new FreemiumGate({ slug: 'tetris', ...cfg });
    const s = flowRef.current.state;
    setFlowState({ streak: s.streak, level: s.level, xp: s.xp, hookMsg: flowRef.current.getHookMessage() });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;
    const CW = canvas.width / COLS;
    const CH = canvas.height / ROWS;

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CH); ctx.lineTo(canvas.width, r * CH); ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath(); ctx.moveTo(c * CW, 0); ctx.lineTo(c * CW, canvas.height); ctx.stroke();
    }

    // Board
    s.board.forEach((row, r) => row.forEach((color, c) => {
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(c * CW + 1, r * CH + 1, CW - 2, CH - 2);
    }));

    // Active piece
    if (!s.gameOver) {
      s.piece.shape.forEach((row, r) => row.forEach((v, c) => {
        if (!v) return;
        ctx.fillStyle = s.piece.color;
        ctx.fillRect((s.piece.x + c) * CW + 1, (s.piece.y + r) * CH + 1, CW - 2, CH - 2);
      }));
    }

    // Game Over overlay
    if (s.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 16);
      ctx.font = '16px sans-serif';
      ctx.fillText(`Score: ${s.score}`, canvas.width / 2, canvas.height / 2 + 16);
    }
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (s.gameOver || s.paused) return;

    if (!collides(s.board, s.piece, 0, 1)) {
      s.piece.y++;
    } else {
      s.board = merge(s.board, s.piece);
      const [newBoard, cleared] = clearLines(s.board);
      s.board = newBoard;
      s.lines += cleared;
      const pointsAdded = [0, 100, 300, 500, 800][cleared] ?? 0;
      s.score += pointsAdded;
      s.level = Math.floor(s.lines / 10) + 1;

      // Flow Engine: ライン消去 = 正解イベント
      if (cleared > 0 && flowRef.current) {
        const events = flowRef.current.onCorrect();
        if (events.length > 0) {
          setRewardEvents(events);
          setTimeout(() => setRewardEvents([]), 2500);
        }
        const fs = flowRef.current.state;
        setFlowState({ streak: fs.streak, level: fs.level, xp: fs.xp, hookMsg: flowRef.current.getHookMessage() });
      }

      // Freemium gate: レベル5以降はPro壁
      if (s.level > FREE_MAX_LEVEL) {
        // ゲーム結果を記録してから壁を表示
        if (flowRef.current) {
          recordGameResult({
            slug: 'tetris',
            score: Math.min(100, Math.round(s.score / 100)),
            level: flowRef.current.state.level,
            duration: 0,
          });
        }
        setShowProWall(true);
        s.paused = true;
        return;
      }

      s.piece = s.next;
      s.next = randomPiece();

      if (collides(s.board, s.piece)) {
        s.gameOver = true;
        // ゲームオーバー時も記録
        if (flowRef.current) {
          flowRef.current.onWrong();
          recordGameResult({
            slug: 'tetris',
            score: Math.min(100, Math.round(s.score / 100)),
            level: flowRef.current.state.level,
            duration: 0,
          });
        }
      }
    }

    setDisplay({ score: s.score, level: s.level, lines: s.lines, gameOver: s.gameOver });
    draw();
  }, [draw]);

  useEffect(() => {
    draw();
    intervalRef.current = setInterval(tick, Math.max(100, 600 - stateRef.current.level * 50));
    return () => clearInterval(intervalRef.current);
  }, [tick, draw]);

  const restart = () => {
    const s = stateRef.current;
    s.board = emptyBoard();
    s.piece = randomPiece();
    s.next = randomPiece();
    s.score = 0; s.level = 1; s.lines = 0;
    s.gameOver = false; s.paused = false;
    setShowProWall(false);
    setDisplay({ score: 0, level: 1, lines: 0, gameOver: false });
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 550);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (s.gameOver || s.paused) return;
      if (e.key === 'ArrowLeft' && !collides(s.board, s.piece, -1)) { s.piece.x--; draw(); }
      if (e.key === 'ArrowRight' && !collides(s.board, s.piece, 1)) { s.piece.x++; draw(); }
      if (e.key === 'ArrowDown' && !collides(s.board, s.piece, 0, 1)) { s.piece.y++; draw(); }
      if (e.key === 'ArrowUp') {
        const rotated = rotate(s.piece.shape);
        if (!collides(s.board, s.piece, 0, 0, rotated)) { s.piece.shape = rotated; draw(); }
      }
      if (e.key === ' ') {
        while (!collides(s.board, s.piece, 0, 1)) s.piece.y++;
        tick();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tick, draw]);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      {/* スコアポップアップ（リワード演出） */}
      <ScorePopup events={rewardEvents} />

      {/* Pro壁モーダル */}
      {showProWall && (
        <ProWallModal
          slug="tetris"
          price={480}
          title="テトリス"
          emoji="🧱"
          proFeatures={['レベル1〜20（無制限）', '10種類のカラーテーマ', 'オンラインランキング', 'BGM 5種類']}
          streak={flowState.streak}
          level={flowState.level}
          onClose={restart}
        />
      )}

      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white transition-colors">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🧱 テトリス</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 Lv.1〜5</span>
      </div>

      <div className="flex gap-6 items-start">
        {/* Game */}
        <div className="relative">
          <canvas ref={canvasRef} width={300} height={600}
            className="border border-white/10 rounded-xl block" />
        </div>

        {/* Side panel */}
        <div className="w-36 space-y-4">
          {[
            { label: 'スコア', value: display.score.toLocaleString() },
            { label: 'レベル', value: `${display.level} / 5` },
            { label: 'ライン', value: display.lines },
          ].map(({ label, value }) => (
            <div key={label} className="glass rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">{label}</p>
              <p className="text-white font-bold text-xl">{value}</p>
            </div>
          ))}

          {/* フロー状態インジケーター */}
          <FlowIndicator
            streak={flowState.streak}
            level={flowState.level}
            xp={flowState.xp}
            hookMessage={flowState.hookMsg}
          />

          <div className="glass rounded-xl p-3">
            <p className="text-gray-500 text-xs mb-2">操作</p>
            <p className="text-gray-400 text-xs">← → 移動</p>
            <p className="text-gray-400 text-xs">↑ 回転</p>
            <p className="text-gray-400 text-xs">↓ 落とす</p>
            <p className="text-gray-400 text-xs">Space ドロップ</p>
          </div>

          <button onClick={restart}
            className="w-full bg-white/10 hover:bg-white/20 text-white text-sm py-2 rounded-xl transition-colors">
            リスタート
          </button>

          <Link href="/apps/tetris/pro"
            className="block text-center bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold py-2 rounded-xl">
            ★ Pro ¥480
          </Link>
        </div>
      </div>
    </main>
  );
}

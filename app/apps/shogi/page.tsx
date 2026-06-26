'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

// ============================================================
// 将棋 定数・型
// ============================================================
type PieceType =
  | 'FU' | 'KY' | 'KE' | 'GI' | 'KI' | 'KA' | 'HI' | 'OU'
  | 'TO' | 'NY' | 'NK' | 'NG' | 'UM' | 'RY'; // 成り駒

type Side = 'sente' | 'gote'; // 先手=人間, 後手=AI

type Piece = { type: PieceType; side: Side };
type Square = Piece | null;
type Board = Square[][];
type Hand = Partial<Record<PieceType, number>>; // 持ち駒

const KANJI: Record<PieceType, string> = {
  FU: '歩', KY: '香', KE: '桂', GI: '銀', KI: '金', KA: '角', HI: '飛', OU: '王',
  TO: 'と', NY: '杏', NK: '圭', NG: '全', UM: '馬', RY: '龍',
};

const PROMOTE_MAP: Partial<Record<PieceType, PieceType>> = {
  FU: 'TO', KY: 'NY', KE: 'NK', GI: 'NG', KA: 'UM', HI: 'RY',
};

const DEMOTE_MAP: Partial<Record<PieceType, PieceType>> = {
  TO: 'FU', NY: 'KY', NK: 'KE', NG: 'GI', UM: 'KA', RY: 'HI',
};

const BASE_PIECES: PieceType[] = ['FU','KY','KE','GI','KI','KA','HI','OU','TO','NY','NK','NG','UM','RY'];

function demote(t: PieceType): PieceType {
  return DEMOTE_MAP[t] ?? t;
}

// ============================================================
// 初期盤面
// ============================================================
function initBoard(): Board {
  const b: Board = Array.from({ length: 9 }, () => Array(9).fill(null));
  // 後手（AI）上側
  const gote: [number, number, PieceType][] = [
    [0,0,'KY'],[0,1,'KE'],[0,2,'GI'],[0,3,'KI'],[0,4,'OU'],[0,5,'KI'],[0,6,'GI'],[0,7,'KE'],[0,8,'KY'],
    [1,1,'HI'],[1,7,'KA'],
    [2,0,'FU'],[2,1,'FU'],[2,2,'FU'],[2,3,'FU'],[2,4,'FU'],[2,5,'FU'],[2,6,'FU'],[2,7,'FU'],[2,8,'FU'],
  ];
  const sente: [number, number, PieceType][] = [
    [8,0,'KY'],[8,1,'KE'],[8,2,'GI'],[8,3,'KI'],[8,4,'OU'],[8,5,'KI'],[8,6,'GI'],[8,7,'KE'],[8,8,'KY'],
    [7,7,'HI'],[7,1,'KA'],
    [6,0,'FU'],[6,1,'FU'],[6,2,'FU'],[6,3,'FU'],[6,4,'FU'],[6,5,'FU'],[6,6,'FU'],[6,7,'FU'],[6,8,'FU'],
  ];
  gote.forEach(([r,c,t]) => { b[r][c] = { type: t, side: 'gote' }; });
  sente.forEach(([r,c,t]) => { b[r][c] = { type: t, side: 'sente' }; });
  return b;
}

// ============================================================
// 移動ルール
// ============================================================
function getMoves(board: Board, r: number, c: number): [number, number][] {
  const p = board[r][c];
  if (!p) return [];
  const { type, side } = p;
  const fwd = side === 'sente' ? -1 : 1;
  const moves: [number, number][] = [];

  const add = (nr: number, nc: number) => {
    if (nr < 0 || nr > 8 || nc < 0 || nc > 8) return false;
    const target = board[nr][nc];
    if (target && target.side === side) return false;
    moves.push([nr, nc]);
    return !target; // 空マスなら続けて走れる
  };

  const slide = (dr: number, dc: number) => {
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr <= 8 && nc >= 0 && nc <= 8) {
      if (!add(nr, nc)) break;
      nr += dr; nc += dc;
    }
  };

  // 金将と同じ動き
  const goldMoves = () => {
    [[fwd,-1],[fwd,0],[fwd,1],[0,-1],[0,1],[-fwd,0]].forEach(([dr,dc]) => add(r+dr, c+dc));
  };

  switch (type) {
    case 'FU': add(r+fwd, c); break;
    case 'KY': { let nr=r+fwd; while(nr>=0&&nr<=8){if(!add(nr,c))break; nr+=fwd;} break; }
    case 'KE': add(r+fwd*2, c-1); add(r+fwd*2, c+1); break;
    case 'GI':
      [[fwd,-1],[fwd,0],[fwd,1],[-fwd,-1],[-fwd,1]].forEach(([dr,dc]) => add(r+dr, c+dc));
      break;
    case 'KI': case 'TO': case 'NY': case 'NK': case 'NG': goldMoves(); break;
    case 'KA': [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => slide(dr,dc)); break;
    case 'HI': [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => slide(dr,dc)); break;
    case 'OU':
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => add(r+dr, c+dc));
      break;
    case 'UM':
      [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => slide(dr,dc));
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => add(r+dr, c+dc));
      break;
    case 'RY':
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => slide(dr,dc));
      [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => add(r+dr, c+dc));
      break;
  }

  return moves;
}

// 成り判定
function canPromote(type: PieceType, side: Side, toRow: number): boolean {
  if (!PROMOTE_MAP[type]) return false;
  return side === 'sente' ? toRow <= 2 : toRow >= 6;
}

function mustPromote(type: PieceType, side: Side, toRow: number): boolean {
  if (type === 'FU' || type === 'KY') return side === 'sente' ? toRow === 0 : toRow === 8;
  if (type === 'KE') return side === 'sente' ? toRow <= 1 : toRow >= 7;
  return false;
}

// 全合法手（board, hand から）
type Move =
  | { kind: 'board'; fr: number; fc: number; tr: number; tc: number; promote: boolean }
  | { kind: 'drop'; type: PieceType; tr: number; tc: number };

function allMoves(board: Board, hand: Hand, side: Side): Move[] {
  const moves: Move[] = [];
  for (let r=0;r<9;r++) for (let c=0;c<9;c++) {
    const p = board[r][c];
    if (!p || p.side !== side) continue;
    for (const [tr,tc] of getMoves(board,r,c)) {
      const promote = canPromote(p.type, side, tr);
      const must = mustPromote(p.type, side, tr);
      if (promote) {
        moves.push({ kind:'board', fr:r, fc:c, tr, tc, promote:true });
        if (!must) moves.push({ kind:'board', fr:r, fc:c, tr, tc, promote:false });
      } else {
        moves.push({ kind:'board', fr:r, fc:c, tr, tc, promote:false });
      }
    }
  }
  // 持ち駒打ち
  (Object.entries(hand) as [PieceType, number][]).forEach(([type, cnt]) => {
    if ((cnt ?? 0) === 0) return;
    for (let r=0;r<9;r++) for (let c=0;c<9;c++) {
      if (board[r][c]) continue;
      // 歩：二歩禁止・行き場なし禁止
      if (type === 'FU') {
        if (side==='sente'&&r===0) continue;
        if (side==='gote'&&r===8) continue;
        const nifu = board.some(row=>row[c]&&row[c]?.type==='FU'&&row[c]?.side===side);
        if (nifu) continue;
      }
      if (type==='KY'&&((side==='sente'&&r===0)||(side==='gote'&&r===8))) continue;
      if (type==='KE'&&((side==='sente'&&r<=1)||(side==='gote'&&r>=7))) continue;
      moves.push({ kind:'drop', type, tr:r, tc:c });
    }
  });
  return moves;
}

// 盤面を複製して手を適用
function applyMove(board: Board, senteHand: Hand, goteHand: Hand, move: Move, side: Side): [Board,Hand,Hand] {
  const nb = board.map(row=>[...row]);
  const sh = {...senteHand};
  const gh = {...goteHand};

  if (move.kind==='board') {
    const { fr, fc, tr, tc, promote } = move;
    const piece = nb[fr][fc]!;
    const captured = nb[tr][tc];
    if (captured) {
      const base = demote(captured.type);
      if (side==='sente') sh[base] = (sh[base]??0)+1;
      else gh[base] = (gh[base]??0)+1;
    }
    nb[tr][tc] = { type: promote ? PROMOTE_MAP[piece.type]! : piece.type, side };
    nb[fr][fc] = null;
  } else {
    const { type, tr, tc } = move;
    nb[tr][tc] = { type, side };
    if (side==='sente') sh[type] = (sh[type]??1)-1;
    else gh[type] = (gh[type]??1)-1;
  }
  return [nb, sh, gh];
}

// 簡易評価（コマ点数）
const PIECE_VALUE: Record<PieceType, number> = {
  FU:100, KY:250, KE:280, GI:400, KI:500, KA:700, HI:800, OU:10000,
  TO:400, NY:400, NK:400, NG:450, UM:900, RY:1100,
};

function evaluate(board: Board): number {
  let score = 0;
  board.flat().forEach(p => {
    if (!p) return;
    const v = PIECE_VALUE[p.type];
    score += p.side==='sente' ? -v : v; // gote=AI が高い方が良い
  });
  return score;
}

// 初級 AI: ランダム選択（无料版）
function aiThink(board: Board, goteHand: Hand): Move | null {
  const moves = allMoves(board, goteHand, 'gote');
  if (moves.length===0) return null;
  // 駒を取る手を優先（少しだけ賢く）
  const captures = moves.filter(m => m.kind==='board' && board[m.tr][m.tc]);
  if (captures.length > 0) return captures[Math.floor(Math.random()*captures.length)];
  return moves[Math.floor(Math.random()*moves.length)];
}

// ============================================================
// Component
// ============================================================
export default function ShogunPage() {
  const [board, setBoard] = useState<Board>(initBoard);
  const [senteHand, setSenteHand] = useState<Hand>({});
  const [goteHand, setGoteHand] = useState<Hand>({});
  const [selected, setSelected] = useState<{ r:number; c:number } | { drop: PieceType } | null>(null);
  const [legalDests, setLegalDests] = useState<[number,number][]>([]);
  const [turn, setTurn] = useState<Side>('sente');
  const [status, setStatus] = useState<'playing'|'sente-win'|'gote-win'>('playing');
  const [message, setMessage] = useState('あなたの番（先手▲）');
  const [promoteConfirm, setPromoteConfirm] = useState<{fr:number;fc:number;tr:number;tc:number}|null>(null);

  const selectPiece = (r: number, c: number) => {
    if (status !== 'playing' || turn !== 'sente') return;
    const p = board[r][c];
    if (p && p.side === 'sente') {
      setSelected({ r, c });
      setLegalDests(getMoves(board, r, c));
      return;
    }
    // 移動先クリック
    if (selected && 'r' in selected) {
      const dest = legalDests.find(([dr,dc]) => dr===r && dc===c);
      if (dest) {
        executeSenteMove(selected.r, selected.c, r, c);
        return;
      }
    }
    if (selected && 'drop' in selected) {
      const legal = legalDests.find(([dr,dc]) => dr===r && dc===c);
      if (legal) {
        executeDrop(selected.drop, r, c);
        return;
      }
    }
    setSelected(null);
    setLegalDests([]);
  };

  const executeSenteMove = (fr: number, fc: number, tr: number, tc: number) => {
    const p = board[fr][fc]!;
    const must = mustPromote(p.type, 'sente', tr);
    const can = canPromote(p.type, 'sente', tr);

    if (can && !must) {
      setPromoteConfirm({ fr, fc, tr, tc });
      setSelected(null); setLegalDests([]);
      return;
    }
    commitSenteMove(fr, fc, tr, tc, must);
  };

  const commitSenteMove = useCallback((fr:number,fc:number,tr:number,tc:number,promote:boolean) => {
    const move: Move = { kind:'board', fr, fc, tr, tc, promote };
    const [nb, sh, gh] = applyMove(board, senteHand, goteHand, move, 'sente');
    // 王将取られ判定
    const ouCaptured = !nb.flat().some(p=>p?.type==='OU'&&p.side==='gote');
    if (ouCaptured) { setBoard(nb); setSenteHand(sh); setGoteHand(gh); setStatus('sente-win'); setMessage('あなたの勝ち！🎉'); setSelected(null); setLegalDests([]); return; }

    setBoard(nb); setSenteHand(sh); setGoteHand(gh);
    setSelected(null); setLegalDests([]);
    setTurn('gote'); setMessage('AI が考え中…');

    setTimeout(() => {
      const aiMove_ = aiThink(nb, gh);
      if (!aiMove_) { setStatus('sente-win'); setMessage('AI の手がありません。あなたの勝ち！🎉'); return; }
      const [nb2, sh2, gh2] = applyMove(nb, sh, gh, aiMove_, 'gote');
      const senteOuCaptured = !nb2.flat().some(p=>p?.type==='OU'&&p.side==='sente');
      setBoard(nb2); setSenteHand(sh2); setGoteHand(gh2);
      if (senteOuCaptured) { setStatus('gote-win'); setMessage('AI の勝ち… 再挑戦しよう'); }
      else { setTurn('sente'); setMessage('あなたの番（先手▲）'); }
    }, 600);
  }, [board, senteHand, goteHand]);

  const executeDrop = (type: PieceType, tr: number, tc: number) => {
    const move: Move = { kind:'drop', type, tr, tc };
    const [nb, sh, gh] = applyMove(board, senteHand, goteHand, move, 'sente');
    setBoard(nb); setSenteHand(sh); setGoteHand(gh);
    setSelected(null); setLegalDests([]);
    setTurn('gote'); setMessage('AI が考え中…');
    setTimeout(() => {
      const aiMove_ = aiThink(nb, gh);
      if (!aiMove_) { setStatus('sente-win'); setMessage('あなたの勝ち！🎉'); return; }
      const [nb2, sh2, gh2] = applyMove(nb, sh, gh, aiMove_, 'gote');
      setBoard(nb2); setSenteHand(sh2); setGoteHand(gh2);
      setTurn('sente'); setMessage('あなたの番（先手▲）');
    }, 600);
  };

  const selectDrop = (type: PieceType) => {
    if (turn !== 'sente' || status !== 'playing') return;
    // 打てる場所を計算
    const dests: [number,number][] = [];
    for (let r=0;r<9;r++) for (let c=0;c<9;c++) {
      if (board[r][c]) continue;
      if (type==='FU') {
        if (r===0) continue;
        if (board.some(row=>row[c]?.type==='FU'&&row[c]?.side==='sente')) continue;
      }
      dests.push([r,c]);
    }
    setSelected({ drop: type });
    setLegalDests(dests);
  };

  const restart = () => {
    setBoard(initBoard()); setSenteHand({}); setGoteHand({});
    setSelected(null); setLegalDests([]); setTurn('sente');
    setStatus('playing'); setMessage('あなたの番（先手▲）');
    setPromoteConfirm(null);
  };

  const isLegal = (r:number,c:number) => legalDests.some(([dr,dc])=>dr===r&&dc===c);
  const isSelected = (r:number,c:number) => selected && 'r' in selected && selected.r===r && selected.c===c;

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-6 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">♟️ 将棋</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 初級AI</span>
      </div>

      <p className={`text-sm mb-3 font-medium ${status!=='playing'?'text-yellow-400':'text-gray-300'}`}>
        {message}
      </p>

      {/* 後手（AI）持ち駒 */}
      <HandPanel hand={goteHand} side="gote" onSelect={()=>{}} />

      {/* 盤面 */}
      <div className="border-2 border-amber-800 rounded-lg overflow-hidden bg-amber-950/30 my-2">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((sq, c) => {
              const legal = isLegal(r, c);
              const sel = isSelected(r, c);
              return (
                <div
                  key={c}
                  onClick={() => selectPiece(r, c)}
                  className={`w-11 h-11 border border-amber-900/50 flex items-center justify-center cursor-pointer select-none relative
                    ${sel ? 'bg-yellow-400/40' : legal ? 'bg-blue-400/20 hover:bg-blue-400/30' : 'hover:bg-amber-800/20'}
                    transition-colors`}
                >
                  {sq && (
                    <span className={`text-base font-bold leading-none
                      ${sq.side==='gote' ? 'rotate-180 inline-block text-red-300' : 'text-amber-100'}
                      ${['TO','NY','NK','NG','UM','RY'].includes(sq.type) ? 'text-red-400' : ''}`}
                    >
                      {KANJI[sq.type]}
                    </span>
                  )}
                  {legal && !sq && (
                    <div className="w-3 h-3 bg-blue-400/50 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 先手（人間）持ち駒 */}
      <HandPanel hand={senteHand} side="sente" onSelect={selectDrop}
        selectedDrop={selected && 'drop' in selected ? selected.drop : undefined} />

      {/* ボタン */}
      <div className="flex gap-3 mt-4">
        <button onClick={restart}
          className="bg-white/10 hover:bg-white/20 text-white text-sm px-5 py-2 rounded-full transition-colors">
          最初から
        </button>
        <Link href="/apps/shogi/pro"
          className="bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-5 py-2 rounded-full">
          ★ Pro ¥780 — 中級・上級AI / 棋譜
        </Link>
      </div>

      {/* 成り確認モーダル */}
      {promoteConfirm && (
        <div className="fixed inset-0 bg-gray-950/80 flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 text-center">
            <p className="font-bold text-lg mb-4">成りますか？</p>
            <div className="flex gap-3">
              <button onClick={() => { commitSenteMove(promoteConfirm.fr,promoteConfirm.fc,promoteConfirm.tr,promoteConfirm.tc,true); setPromoteConfirm(null); }}
                className="bg-yellow-500 text-black font-bold px-6 py-2 rounded-xl">成る</button>
              <button onClick={() => { commitSenteMove(promoteConfirm.fr,promoteConfirm.fc,promoteConfirm.tr,promoteConfirm.tc,false); setPromoteConfirm(null); }}
                className="bg-white/20 text-white px-6 py-2 rounded-xl">成らない</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// 持ち駒パネル
function HandPanel({
  hand, side, onSelect, selectedDrop,
}: {
  hand: Hand;
  side: Side;
  onSelect: (t: PieceType) => void;
  selectedDrop?: PieceType;
}) {
  const pieces = (Object.entries(hand) as [PieceType, number][]).filter(([,v])=>v>0);
  return (
    <div className={`flex gap-1.5 items-center h-10 px-3 rounded-lg bg-amber-950/20 border border-amber-800/30 mb-1 min-w-[200px] ${side==='gote'?'opacity-60':''}`}>
      <span className="text-xs text-gray-500 mr-1">{side==='sente'?'▲持駒':'△持駒'}</span>
      {pieces.length===0 && <span className="text-xs text-gray-700">なし</span>}
      {pieces.map(([type, cnt]) => (
        <button key={type} onClick={()=>side==='sente'&&onSelect(type)}
          className={`px-1.5 py-0.5 rounded text-sm font-bold transition-colors
            ${side==='sente' ? selectedDrop===type ? 'bg-yellow-400/40 text-yellow-200' : 'bg-amber-800/40 hover:bg-amber-700/50 text-amber-100 cursor-pointer' : 'text-red-300 cursor-default'}`}>
          {KANJI[type]}{cnt>1&&<sup className="text-xs">{cnt}</sup>}
        </button>
      ))}
    </div>
  );
}

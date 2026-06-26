'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';

type Color = 'w'|'b';
type PType = 'K'|'Q'|'R'|'B'|'N'|'P';
type Piece = { type: PType; color: Color };
type Square = Piece | null;
type Board = Square[][];

const GLYPHS: Record<Color, Record<PType, string>> = {
  w:{ K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙' },
  b:{ K:'♚', Q:'♛', R:'♜', B:'♝', N:'♞', P:'♟' },
};

function initBoard(): Board {
  const b: Board = Array.from({length:8},()=>Array(8).fill(null));
  const order:PType[] = ['R','N','B','Q','K','B','N','R'];
  order.forEach((t,c)=>{ b[0][c]={type:t,color:'b'}; b[7][c]={type:t,color:'w'}; });
  for(let c=0;c<8;c++){ b[1][c]={type:'P',color:'b'}; b[6][c]={type:'P',color:'w'}; }
  return b;
}

function getMoves(board: Board, r: number, c: number, color: Color): [number,number][] {
  const p=board[r][c]; if(!p) return [];
  const moves:[number,number][] = [];
  const add=(nr:number,nc:number)=>{ if(nr<0||nr>7||nc<0||nc>7) return false; if(board[nr][nc]?.color===color) return false; moves.push([nr,nc]); return !board[nr][nc]; };
  const slide=(dr:number,dc:number)=>{ let nr=r+dr,nc=c+dc; while(add(nr,nc)){ nr+=dr;nc+=dc; } };
  const fwd=color==='w'?-1:1;
  switch(p.type){
    case 'P':
      if(!board[r+fwd]?.[c]) { moves.push([r+fwd,c]); if((color==='w'&&r===6||color==='b'&&r===1)&&!board[r+fwd*2]?.[c]) moves.push([r+fwd*2,c]); }
      [c-1,c+1].forEach(nc=>{ if(nc>=0&&nc<8&&board[r+fwd]?.[nc]&&board[r+fwd][nc]?.color!==color) moves.push([r+fwd,nc]); });
      break;
    case 'N': [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc])=>add(r+dr,c+dc)); break;
    case 'B': [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc])=>slide(dr,dc)); break;
    case 'R': [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>slide(dr,dc)); break;
    case 'Q': [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc])=>slide(dr,dc)); break;
    case 'K': [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc])=>add(r+dr,c+dc)); break;
  }
  return moves;
}

function aiMove(board: Board): {fr:number;fc:number;tr:number;tc:number}|null {
  const moves:any[]=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    if(board[r][c]?.color!=='b') continue;
    getMoves(board,r,c,'b').forEach(([tr,tc])=>moves.push({fr:r,fc:c,tr,tc,capture:!!board[tr][tc]}));
  }
  if(!moves.length) return null;
  const captures=moves.filter(m=>m.capture);
  return captures.length?captures[Math.floor(Math.random()*captures.length)]:moves[Math.floor(Math.random()*moves.length)];
}

export default function ChessPage(){
  const [board,setBoard]=useState<Board>(initBoard);
  const [selected,setSelected]=useState<[number,number]|null>(null);
  const [legal,setLegal]=useState<[number,number][]>([]);
  const [turn,setTurn]=useState<Color>('w');
  const [status,setStatus]=useState('あなたの番（白）');
  const [over,setOver]=useState(false);

  const selectSq=(r:number,c:number)=>{
    if(over||turn!=='w') return;
    const p=board[r][c];
    if(selected){
      const [sr,sc]=selected;
      const isLegal=legal.some(([lr,lc])=>lr===r&&lc===c);
      if(isLegal){
        const nb=board.map(row=>[...row]);
        nb[r][c]=nb[sr][sc]; nb[sr][sc]=null;
        if(nb[r][c]?.type==='P'&&r===0) nb[r][c]={type:'Q',color:'w'};
        const kingGone=!nb.flat().some(p=>p?.type==='K'&&p.color==='b');
        if(kingGone){setBoard(nb);setOver(true);setStatus('あなたの勝ち！ 🎉');return;}
        setBoard(nb); setSelected(null); setLegal([]); setTurn('b'); setStatus('AI が考え中…');
        setTimeout(()=>{
          const m=aiMove(nb);
          if(!m){setOver(true);setStatus('引き分け');return;}
          const nb2=nb.map(row=>[...row]); nb2[m.tr][m.tc]=nb2[m.fr][m.fc]; nb2[m.fr][m.fc]=null;
          if(nb2[m.tr][m.tc]?.type==='P'&&m.tr===7) nb2[m.tr][m.tc]={type:'Q',color:'b'};
          const wKingGone=!nb2.flat().some(p=>p?.type==='K'&&p.color==='w');
          setBoard(nb2); setTurn('w');
          if(wKingGone){setOver(true);setStatus('AI の勝ち');}else setStatus('あなたの番（白）');
        },600);
        return;
      }
      setSelected(null); setLegal([]);
    }
    if(p&&p.color==='w'){ setSelected([r,c]); setLegal(getMoves(board,r,c,'w')); }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">♛ チェス</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 初級AI</span>
      </div>
      <p className={`text-sm mb-4 font-medium ${over?'text-yellow-400':'text-gray-400'}`}>{status}</p>
      <div className="border-2 border-amber-900 rounded-lg overflow-hidden">
        {board.map((row,r)=>(
          <div key={r} className="flex">
            {row.map((sq,c)=>{
              const light=(r+c)%2===0;
              const sel=selected?.[0]===r&&selected?.[1]===c;
              const isLegal=legal.some(([lr,lc])=>lr===r&&lc===c);
              return (
                <div key={c} onClick={()=>selectSq(r,c)}
                  className={`w-12 h-12 flex items-center justify-center text-3xl cursor-pointer select-none relative
                    ${light?'bg-amber-100':'bg-amber-800'} ${sel?'ring-4 ring-yellow-400 ring-inset':''}`}>
                  {sq && <span className={sq.color==='w'?'drop-shadow-lg':''}>{GLYPHS[sq.color][sq.type]}</span>}
                  {isLegal&&!sq&&<div className="w-3 h-3 bg-blue-500/50 rounded-full"/>}
                  {isLegal&&sq&&<div className="absolute inset-0 ring-4 ring-blue-400 ring-inset rounded"/>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <button onClick={()=>{setBoard(initBoard());setSelected(null);setLegal([]);setTurn('w');setStatus('あなたの番（白）');setOver(false);}} className="mt-4 bg-white/10 hover:bg-white/20 text-sm px-5 py-2 rounded-full">最初から</button>
      <Link href="/apps/chess/pro" className="mt-3 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥780 — 中級・上級AI・棋譜出力
      </Link>
    </main>
  );
}

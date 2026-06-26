'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const COLS = 20, ROWS = 20, CELL = 20;
type Dir = 'UP'|'DOWN'|'LEFT'|'RIGHT';
type Pos = {x:number;y:number};

function rand(max:number){ return Math.floor(Math.random()*max); }
function newFood(snake:Pos[]): Pos {
  let f:Pos;
  do { f={x:rand(COLS),y:rand(ROWS)}; } while(snake.some(s=>s.x===f.x&&s.y===f.y));
  return f;
}

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    snake:[{x:10,y:10},{x:9,y:10},{x:8,y:10}] as Pos[],
    dir:'RIGHT' as Dir, nextDir:'RIGHT' as Dir,
    food:{x:15,y:10} as Pos,
    score:0, running:false, over:false,
  });
  const [display,setDisplay]=useState({score:0,over:false,running:false});
  const intervalRef = useRef<NodeJS.Timeout>();

  const draw = useCallback(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d')!;
    const s=state.current;
    ctx.fillStyle='#111827'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#ef4444';
    ctx.beginPath(); ctx.arc((s.food.x+.5)*CELL,(s.food.y+.5)*CELL,CELL/2-2,0,Math.PI*2); ctx.fill();
    s.snake.forEach((seg,i)=>{
      ctx.fillStyle=i===0?'#22c55e':'#16a34a';
      ctx.fillRect(seg.x*CELL+1,seg.y*CELL+1,CELL-2,CELL-2);
    });
    if(s.over){
      ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#fff'; ctx.font='bold 22px sans-serif'; ctx.textAlign='center';
      ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2-10);
      ctx.font='14px sans-serif'; ctx.fillText(`スコア: ${s.score}`,canvas.width/2,canvas.height/2+16);
    }
  },[]);

  const tick = useCallback(()=>{
    const s=state.current; if(!s.running||s.over) return;
    s.dir=s.nextDir;
    const head={...s.snake[0]};
    if(s.dir==='UP') head.y--; if(s.dir==='DOWN') head.y++;
    if(s.dir==='LEFT') head.x--; if(s.dir==='RIGHT') head.x++;
    if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||s.snake.some(seg=>seg.x===head.x&&seg.y===head.y)){
      s.over=true; s.running=false; setDisplay({score:s.score,over:true,running:false}); draw(); return;
    }
    const ate = head.x===s.food.x&&head.y===s.food.y;
    s.snake=[head,...s.snake.slice(0,ate?undefined:-1)];
    if(ate){ s.score+=10; s.food=newFood(s.snake); }
    setDisplay({score:s.score,over:false,running:true}); draw();
  },[draw]);

  const start = ()=>{
    const s=state.current;
    s.snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    s.dir='RIGHT'; s.nextDir='RIGHT'; s.food={x:15,y:10}; s.score=0; s.running=true; s.over=false;
    setDisplay({score:0,over:false,running:true});
    clearInterval(intervalRef.current);
    intervalRef.current=setInterval(tick,150);
  };

  useEffect(()=>{
    draw();
    const h=(e:KeyboardEvent)=>{
      const s=state.current;
      if(e.key==='ArrowUp'&&s.dir!=='DOWN') s.nextDir='UP';
      if(e.key==='ArrowDown'&&s.dir!=='UP') s.nextDir='DOWN';
      if(e.key==='ArrowLeft'&&s.dir!=='RIGHT') s.nextDir='LEFT';
      if(e.key==='ArrowRight'&&s.dir!=='LEFT') s.nextDir='RIGHT';
    };
    window.addEventListener('keydown',h);
    return ()=>{ window.removeEventListener('keydown',h); clearInterval(intervalRef.current); };
  },[draw,tick]);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🐍 スネーク</h1>
      </div>
      <div className="flex gap-4 mb-3">
        <div className="glass rounded-xl px-5 py-2 text-center"><p className="text-gray-500 text-xs">スコア</p><p className="font-bold text-lg">{display.score}</p></div>
        <button onClick={start} className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2 rounded-xl">{display.running?'リスタート':'スタート'}</button>
      </div>
      <canvas ref={canvasRef} width={COLS*CELL} height={ROWS*CELL} className="border border-white/10 rounded-xl" />
      <p className="text-gray-600 text-xs mt-2">矢印キーで操作</p>
      <Link href="/apps/snake/pro" className="mt-4 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥380 — 障害物・迷路モード
      </Link>
    </main>
  );
}

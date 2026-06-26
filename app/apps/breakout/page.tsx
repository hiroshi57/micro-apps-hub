'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';

const W=480,H=360,PR=8,PW=80,PH=10,BW=12,BH=8,ROWS=4,COLS=10;

export default function BreakoutPage(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const s=useRef({
    px:200,ball:{x:240,y:300,vx:3,vy:-4},
    bricks:Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>({x:c*(BW+4)+20,y:r*(BH+4)+40,alive:true,color:`hsl(${r*40+200},70%,55%)`}))),
    score:0,lives:3,running:false,over:false,won:false,
  });
  const [disp,setDisp]=useState({score:0,lives:3,over:false,won:false});
  const rafRef=useRef<number>();
  const mouseRef=useRef(200);

  const draw=useCallback(()=>{
    const c=canvasRef.current; if(!c) return;
    const ctx=c.getContext('2d')!;
    const st=s.current;
    ctx.fillStyle='#111827'; ctx.fillRect(0,0,W,H);
    st.bricks.flat().forEach(b=>{ if(!b.alive) return; ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,BW,BH); });
    ctx.fillStyle='#60a5fa'; ctx.fillRect(st.px-PW/2,H-PH-4,PW,PH);
    ctx.beginPath(); ctx.arc(st.ball.x,st.ball.y,PR,0,Math.PI*2); ctx.fillStyle='#f9fafb'; ctx.fill();
    if(st.over||st.won){
      ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff'; ctx.font='bold 24px sans-serif'; ctx.textAlign='center';
      ctx.fillText(st.won?'クリア！🎉':'ゲームオーバー',W/2,H/2-10);
      ctx.font='16px sans-serif'; ctx.fillText(`スコア: ${st.score}`,W/2,H/2+20);
    }
  },[]);

  const loop=useCallback(()=>{
    const st=s.current;
    if(!st.running){ draw(); return; }
    st.px=Math.max(PW/2,Math.min(W-PW/2,mouseRef.current));
    const b=st.ball; b.x+=b.vx; b.y+=b.vy;
    if(b.x<=PR||b.x>=W-PR) b.vx*=-1;
    if(b.y<=PR) b.vy*=-1;
    if(b.y>=H-PH-PR-4&&Math.abs(b.x-st.px)<PW/2+PR){
      b.vy=-Math.abs(b.vy); b.vx+=(b.x-st.px)*0.05;
    }
    if(b.y>H){ st.lives--; if(st.lives<=0){st.over=true;st.running=false;}else{b.x=240;b.y=300;b.vx=3;b.vy=-4;} }
    st.bricks.flat().forEach(brick=>{
      if(!brick.alive) return;
      if(b.x>brick.x&&b.x<brick.x+BW&&b.y>brick.y&&b.y<brick.y+BH){
        brick.alive=false; b.vy*=-1; st.score+=10;
      }
    });
    if(st.bricks.flat().every(b=>!b.alive)){st.won=true;st.running=false;}
    setDisp({score:st.score,lives:st.lives,over:st.over,won:st.won});
    draw(); rafRef.current=requestAnimationFrame(loop);
  },[draw]);

  const start=()=>{
    const st=s.current;
    st.px=200; st.ball={x:240,y:300,vx:3,vy:-4}; st.score=0; st.lives=3; st.over=false; st.won=false;
    st.bricks=Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>({x:c*(BW+4)+20,y:r*(BH+4)+40,alive:true,color:`hsl(${r*40+200},70%,55%)`})));
    st.running=true; setDisp({score:0,lives:3,over:false,won:false});
    cancelAnimationFrame(rafRef.current!); rafRef.current=requestAnimationFrame(loop);
  };

  useEffect(()=>{
    const c=canvasRef.current; if(!c) return;
    const move=(e:MouseEvent)=>{ const rect=c.getBoundingClientRect(); mouseRef.current=e.clientX-rect.left; };
    c.addEventListener('mousemove',move); draw();
    return ()=>{ c.removeEventListener('mousemove',move); cancelAnimationFrame(rafRef.current!); };
  },[draw,loop]);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🏓 ブロック崩し</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 10ステージ</span>
      </div>
      <div className="flex gap-4 mb-3 text-sm">
        <span className="glass rounded-lg px-3 py-1">スコア: {disp.score}</span>
        <span className="glass rounded-lg px-3 py-1">ライフ: {'❤️'.repeat(disp.lives)}</span>
        <button onClick={start} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1 rounded-lg">{disp.over||disp.won?'もう一度':'スタート'}</button>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="border border-white/10 rounded-xl cursor-none" />
      <p className="text-gray-600 text-xs mt-2">マウスでパドルを操作</p>
      <Link href="/apps/breakout/pro" className="mt-4 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥480 — 50ステージ・パワーアップ
      </Link>
    </main>
  );
}

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { FreemiumGate, GAME_FREEMIUM_CONFIGS } from '@/lib/freemium-gate';
import { ProWallModal } from '@/app/components/ProWallModal';

// ============================================================
// 時間割メーカー（無料版）
// 7列(曜日) × 8行(時間) グリッド + 5色 + PNG保存
// ============================================================

const DAYS = ['月', '火', '水', '木', '金', '土', '日'];
const TIMES = ['1限\n8:50', '2限\n10:40', '3限\n12:30', '4限\n14:20', '5限\n16:10', '6限\n18:00', '補講', '自習'];

const FREE_COLORS = [
  { name: '空', bg: '#bfdbfe', text: '#1e40af' },
  { name: '桃', bg: '#fecdd3', text: '#9f1239' },
  { name: '緑', bg: '#bbf7d0', text: '#14532d' },
  { name: '黄', bg: '#fef08a', text: '#713f12' },
  { name: '紫', bg: '#e9d5ff', text: '#581c87' },
];

type Cell = { subject: string; color: number } | null;

function emptyGrid(): Cell[][] {
  return Array.from({ length: TIMES.length }, () => Array(DAYS.length).fill(null));
}

export default function SchedulePage() {
  const [grid, setGrid] = useState<Cell[][]>(emptyGrid());
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [inputText, setInputText] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [showProWall, setShowProWall] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  const gate = (() => {
    const cfg = GAME_FREEMIUM_CONFIGS['schedule'];
    return new FreemiumGate({ slug: 'schedule', ...cfg });
  })();

  const handleCellClick = (row: number, col: number) => {
    setSelected({ row, col });
    setInputText(grid[row][col]?.subject ?? '');
    setSelectedColor(grid[row][col]?.color ?? 0);
  };

  const handleCellSave = () => {
    if (!selected) return;
    const { row, col } = selected;
    const newGrid = grid.map(r => [...r]);
    if (inputText.trim()) {
      newGrid[row][col] = { subject: inputText.trim(), color: selectedColor };
    } else {
      newGrid[row][col] = null;
    }
    setGrid(newGrid);
    setSelected(null);
    setInputText('');
  };

  const handleSavePNG = () => {
    if (!gate.canPlay()) { setShowProWall(true); return; }
    const newCount = saveCount + 1;
    setSaveCount(newCount);
    gate.recordPlay();

    // シンプルなスクリーンショット（window.print の代替）
    window.print();

    if (newCount >= 3) {
      setTimeout(() => setShowProWall(true), 500);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      {showProWall && (
        <ProWallModal
          slug="schedule"
          price={580}
          title="時間割メーカー"
          emoji="📅"
          proFeatures={['カスタムテンプレート', '無制限カラー・フォント', 'PDF 書き出し', 'Google Calendar 同期']}
        />
      )}

      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">📅 時間割メーカー</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 5色・PNG保存3回</span>
      </div>

      {/* セル編集パネル */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative z-10 bg-gray-900 rounded-2xl p-6 w-full max-w-xs shadow-2xl">
            <h3 className="text-lg font-bold mb-4">
              {DAYS[selected.col]} / {TIMES[selected.row].split('\n')[0]}
            </h3>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="科目名を入力"
              maxLength={20}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-cyan-500"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCellSave()}
            />
            <div className="flex gap-2 mb-4">
              {FREE_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c.bg,
                    borderColor: selectedColor === i ? '#fff' : 'transparent',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCellSave} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-xl font-bold">
                保存
              </button>
              <button onClick={() => setSelected(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 時間割グリッド */}
      <div ref={tableRef} className="bg-gray-900/60 rounded-2xl overflow-hidden mb-6 print:bg-white print:text-black">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="w-16 p-2 text-gray-500 text-xs font-normal border border-white/10">時間</th>
              {DAYS.map(d => (
                <th key={d} className="w-20 p-2 text-sm font-bold border border-white/10 text-gray-300">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMES.map((time, row) => (
              <tr key={row}>
                <td className="p-1 border border-white/10 text-center">
                  <span className="text-gray-500 text-xs whitespace-pre-line leading-tight">{time}</span>
                </td>
                {DAYS.map((_, col) => {
                  const cell = grid[row][col];
                  const color = cell ? FREE_COLORS[cell.color] : null;
                  return (
                    <td
                      key={col}
                      onClick={() => handleCellClick(row, col)}
                      className="w-20 h-14 border border-white/10 cursor-pointer hover:bg-white/5 transition-colors text-center text-sm"
                      style={color ? { backgroundColor: color.bg, color: color.text } : {}}
                    >
                      {cell && (
                        <span className="font-medium text-xs leading-tight px-1">{cell.subject}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 操作ボタン */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleSavePNG}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          📥 PNG保存（{3 - saveCount}回残り）
        </button>
        <button
          onClick={() => setGrid(emptyGrid())}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors"
        >
          🗑️ リセット
        </button>
      </div>

      <p className="text-gray-600 text-xs mb-4">セルをクリックして科目名・色を設定</p>

      <Link href="/apps/schedule/pro" className="text-cyan-400 text-sm hover:text-cyan-300 underline underline-offset-4">
        ★ Pro版でPDF・無制限カラー（¥580）
      </Link>
    </main>
  );
}

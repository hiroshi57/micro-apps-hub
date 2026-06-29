import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { APPS } from '@/lib/apps-config';

export const runtime = 'edge';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const app = APPS.find((a) => a.slug === params.slug);

  // スラッグ不明時はデフォルトカード
  const title  = app?.title   ?? 'MicroApps Hub';
  const emoji  = app?.emoji   ?? '🎮';
  const price  = app?.price   ?? 0;
  const desc   = app?.description ?? '20本のミニアプリ集';
  const isPro  = price > 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* 背景グリッド */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* アプリカード */}
        <div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(30,41,59,0.9)',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: '24px',
            padding: '48px 64px',
            gap: '20px',
            boxShadow: '0 0 60px rgba(99,102,241,0.2)',
          }}
        >
          {/* 絵文字 */}
          <div style={{ fontSize: '96px', lineHeight: 1 }}>{emoji}</div>

          {/* タイトル */}
          <div style={{ fontSize: '56px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px' }}>
            {title}
          </div>

          {/* 説明 */}
          <div style={{ fontSize: '24px', color: '#94a3b8', textAlign: 'center', maxWidth: '600px' }}>
            {desc}
          </div>

          {/* バッジ行 */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <div style={{
              background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.5)',
              borderRadius: '999px', padding: '8px 24px',
              color: '#a5b4fc', fontSize: '20px', fontWeight: 700,
            }}>
              無料で遊べる
            </div>
            {isPro && (
              <div style={{
                background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                borderRadius: '999px', padding: '8px 24px',
                color: '#ffffff', fontSize: '20px', fontWeight: 700,
              }}>
                Pro ¥{price.toLocaleString()}〜 買い切り
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div style={{
          position: 'absolute', bottom: '24px',
          color: '#475569', fontSize: '18px', letterSpacing: '2px',
        }}>
          MicroApps Hub — micro-apps-hub-seven.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

/**
 * GET /api/apps
 *
 * APPS 配列を JSON で返す Single Source of Truth エンドポイント。
 * chatwork-x-automation の配信スクリプトなど外部サービスが参照する。
 *
 * レスポンス形式:
 *   { apps: AppConfig[] }
 *
 * キャッシュ: 1時間（アプリ追加はデプロイ後に自動反映）
 */
import { NextResponse } from 'next/server';
import { APPS } from '@/lib/apps-config';

export const revalidate = 3600; // 1時間キャッシュ

export async function GET() {
  // 配信スクリプトが必要なフィールドだけ返す（stripePriceId は含めない）
  const apps = APPS.map((a) => ({
    slug:          a.slug,
    title:         a.title,
    emoji:         a.emoji,
    category:      a.category,
    price:         a.price,
    description:   a.description,
    freeFeatures:  a.freeFeatures,
    proFeatures:   a.proFeatures,
    releaseStatus: a.releaseStatus,
    color:         a.color,
  }));

  return NextResponse.json(
    { apps, count: apps.length, updatedAt: new Date().toISOString() },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*', // chatwork-x-automation からの fetch を許可
      },
    }
  );
}

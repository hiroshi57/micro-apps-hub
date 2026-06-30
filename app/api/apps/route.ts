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
  // live 済みのアプリのみ返す（soon アプリはサーバーサイドで除外）
  // 外部 API に不要なフィールドを除外:
  //   stripePriceId  … Stripe 内部情報
  //   releaseStatus  … サーバーでフィルタ済み、露出不要
  //   color          … Tailwind クラス（フロントエンド専用実装詳細）
  //   id / titleEn   … 内部管理用フィールド
  const apps = APPS.filter((a) => a.releaseStatus === 'live').map((a) => ({
    slug:         a.slug,
    title:        a.title,
    emoji:        a.emoji,
    category:     a.category,
    price:        a.price,
    description:  a.description,
    freeFeatures: a.freeFeatures,
    proFeatures:  a.proFeatures,
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

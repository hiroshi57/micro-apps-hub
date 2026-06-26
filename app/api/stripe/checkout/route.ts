import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { getApp } from '@/lib/apps-config';

export async function POST(req: NextRequest) {
  try {
    const { appSlug } = await req.json();

    // ユーザー認証確認
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    // アプリ設定取得
    const app = getApp(appSlug);
    if (!app) {
      return NextResponse.json({ error: 'アプリが見つかりません' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await createCheckoutSession({
      priceId: app.stripePriceId,
      userId: user.id,
      appSlug,
      appTitle: app.title,
      successUrl: `${baseUrl}/apps/${appSlug}/pro?success=1`,
      cancelUrl: `${baseUrl}/apps/${appSlug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: '決済の開始に失敗しました' }, { status: 500 });
  }
}

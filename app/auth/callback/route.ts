import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase Auth コールバックハンドラー
 * - メール認証リンク
 * - OAuth (Google など将来拡張)
 * - パスワードリセット
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // エラー処理
  if (error) {
    console.error('[auth/callback] Error:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorDescription ?? error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // 認証成功 → next パラメータのパスへリダイレクト
      const redirectUrl = next.startsWith('/')
        ? `${origin}${next}`
        : origin;
      return NextResponse.redirect(redirectUrl);
    }

    console.error('[auth/callback] Exchange error:', exchangeError.message);
  }

  // フォールバック: ログインページへ
  return NextResponse.redirect(`${origin}/auth/login?error=認証に失敗しました`);
}

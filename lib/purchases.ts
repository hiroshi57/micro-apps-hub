import { createClient } from './supabase/server';

/**
 * ユーザーが指定アプリの Pro を購入済みか確認
 */
export async function hasPurchased(userId: string, appSlug: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('app_slug', appSlug)
    .single();

  if (error || !data) return false;
  return true;
}

/**
 * ユーザーの全購入済みアプリ一覧
 */
export async function getUserPurchases(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('purchases')
    .select('app_slug')
    .eq('user_id', userId);

  return data?.map(r => r.app_slug) ?? [];
}

/**
 * 購入を記録（Stripe Webhook から呼ぶ）
 *
 * Stripe は同一イベントを複数回配信することがあるため、`stripe_session_id`
 * での upsert + ignoreDuplicates により冪等にする（二重課金記録を防ぐ）。
 * 保存に失敗した場合は例外を投げ、呼び出し側（webhook）が 500 を返して
 * Stripe にリトライさせられるようにする。
 */
export async function recordPurchase({
  userId,
  appSlug,
  stripeSessionId,
  amount,
}: {
  userId: string;
  appSlug: string;
  stripeSessionId: string;
  amount: number;
}): Promise<void> {
  // Service Role クライアントが必要（RLS をバイパスして書き込む）
  const { createClient: createAdmin } = await import('./supabase/admin');
  const supabase = createAdmin();

  const { error } = await supabase.from('purchases').upsert(
    {
      user_id: userId,
      app_slug: appSlug,
      stripe_session_id: stripeSessionId,
      amount,
      purchased_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_session_id', ignoreDuplicates: true }
  );

  if (error) {
    throw new Error(`購入記録の保存に失敗: ${error.message}`);
  }
}

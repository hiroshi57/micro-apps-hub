import { createClient } from './supabase/server';

/**
 * ユーザーが指定アプリの Pro を購入済みか確認
 */
export async function hasPurchased(userId: string, appSlug: string): Promise<boolean> {
  const supabase = createClient();
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
  const supabase = createClient();
  const { data } = await supabase
    .from('purchases')
    .select('app_slug')
    .eq('user_id', userId);

  return data?.map(r => r.app_slug) ?? [];
}

/**
 * 購入を記録（Stripe Webhook から呼ぶ）
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
}) {
  // Service Role クライアントが必要（webhook route 内で直接 supabase admin client を使う）
  const { createClient: createAdmin } = await import('./supabase/admin');
  const supabase = createAdmin();

  await supabase.from('purchases').insert({
    user_id: userId,
    app_slug: appSlug,
    stripe_session_id: stripeSessionId,
    amount,
    purchased_at: new Date().toISOString(),
  });
}

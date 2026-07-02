import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { recordPurchase } from '@/lib/purchases';
import { sendPurchaseEmail } from '@/lib/email';
import { getApp } from '@/lib/apps-config';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 決済完了イベント
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, appSlug, appTitle } = session.metadata ?? {};

    if (userId && appSlug) {
      try {
        // 1. 購入記録を DB に保存
        await recordPurchase({
          userId,
          appSlug,
          stripeSessionId: session.id,
          amount: session.amount_total ?? 0,
        });
        console.log(`✅ 購入記録: ${appTitle ?? appSlug} (user: ${userId})`);

        // 2. 購入完了メールを送信（失敗しても購入は成功扱い）
        try {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.admin.getUserById(userId);
          const appConfig = getApp(appSlug);

          if (user?.email && appConfig) {
            await sendPurchaseEmail({
              to: user.email,
              appTitle: appTitle ?? appConfig.title,
              appSlug,
              appEmoji: appConfig.emoji,
              amount: Math.round((session.amount_total ?? 0) / 1),
              receiptUrl: session.url ?? undefined,
            });
          }
        } catch (emailErr) {
          // メール失敗は購入の成否に影響しない
          console.error('購入メール送信失敗（購入自体は成功）:', emailErr);
        }
      } catch (err) {
        console.error('購入記録の保存に失敗:', err);
        return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
      }
    } else {
      console.warn('checkout.session.completed に userId/appSlug metadata がありません:', session.id);
    }
  }

  return NextResponse.json({ received: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { recordPurchase } from '@/lib/purchases';
import Stripe from 'stripe';

// Stripe SDK は Node.js ランタイムが必要（Edge では crypto 検証が動かない）。
// App Router の Route Handler は req.text() で raw body を取得できるため、
// Pages Router 時代の `export const config = { api: { bodyParser: false } }`
// は不要（App Router では無効）。
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
        await recordPurchase({
          userId,
          appSlug,
          stripeSessionId: session.id,
          amount: session.amount_total ?? 0,
        });
        console.log(`✅ 購入記録: ${appTitle ?? appSlug} (user: ${userId})`);
      } catch (err) {
        // 保存に失敗したら 500 を返し、Stripe にリトライさせる
        console.error('購入記録の保存に失敗:', err);
        return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
      }
    } else {
      console.warn('checkout.session.completed に userId/appSlug metadata がありません:', session.id);
    }
  }

  return NextResponse.json({ received: true });
}

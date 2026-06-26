import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

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
      const supabase = createClient();
      await supabase.from('purchases').insert({
        user_id: userId,
        app_slug: appSlug,
        stripe_session_id: session.id,
        amount: session.amount_total ?? 0,
        purchased_at: new Date().toISOString(),
      });

      console.log(`✅ 購入記録: ${appTitle} (user: ${userId})`);
    }
  }

  return NextResponse.json({ received: true });
}

// Stripe は raw body が必要
export const config = { api: { bodyParser: false } };

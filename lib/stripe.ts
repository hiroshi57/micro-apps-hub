import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

/**
 * Stripe Checkout セッション作成（買い切り）
 */
export async function createCheckoutSession({
  priceId,
  userId,
  appSlug,
  appTitle,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  userId: string;
  appSlug: string;
  appTitle: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment', // 買い切り
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      appSlug,
      appTitle,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    locale: 'ja',
  });

  return session;
}

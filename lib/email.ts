/**
 * lib/email.ts
 * 購入完了メール送信（Resend 使用）
 *
 * 環境変数:
 *   RESEND_API_KEY  — Resend ダッシュボードで取得
 *   FROM_EMAIL      — 送信元メール (例: noreply@microapps.jp)
 *                     未設定時は 'noreply@resend.dev' でテスト送信可
 */

interface PurchaseEmailParams {
  to: string;
  appTitle: string;
  appSlug: string;
  appEmoji: string;
  amount: number;         // 円
  receiptUrl?: string;    // Stripe Receipt URL
}

export async function sendPurchaseEmail(params: PurchaseEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY が未設定のためメール送信をスキップします');
    return;
  }

  const { to, appTitle, appSlug, appEmoji, amount, receiptUrl } = params;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://micro-apps-hub-seven.vercel.app';
  const from = process.env.FROM_EMAIL ?? 'MicroApps Hub <noreply@resend.dev>';

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:system-ui,sans-serif;color:#f1f5f9;">
  <div style="max-width:520px;margin:40px auto;background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">

    <!-- ヘッダー -->
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px 40px 32px;text-align:center;">
      <div style="font-size:64px;margin-bottom:12px;">${appEmoji}</div>
      <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff;">購入ありがとうございます！</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">${appTitle} Pro が解放されました</p>
    </div>

    <!-- 本文 -->
    <div style="padding:32px 40px;">
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin-top:0;">
        MicroApps Hub をご利用いただきありがとうございます。<br>
        <strong style="color:#f1f5f9;">${appTitle} Pro</strong> のご購入が完了しました。
        今すぐ全機能をお楽しみいただけます。
      </p>

      <!-- 購入詳細 -->
      <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin:24px 0;border:1px solid rgba(255,255,255,0.08);">
        <table style="width:100%;font-size:13px;">
          <tr>
            <td style="color:#64748b;padding:4px 0;">購入アプリ</td>
            <td style="color:#f1f5f9;text-align:right;font-weight:600;">${appEmoji} ${appTitle} Pro</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:4px 0;">金額</td>
            <td style="color:#f1f5f9;text-align:right;font-weight:600;">¥${amount.toLocaleString('ja-JP')}（税込・買い切り）</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:4px 0;">ライセンス</td>
            <td style="color:#a78bfa;text-align:right;font-weight:600;">永久ライセンス</td>
          </tr>
        </table>
      </div>

      <!-- CTA ボタン -->
      <div style="text-align:center;margin:28px 0;">
        <a href="${siteUrl}/apps/${appSlug}/pro"
           style="display:inline-block;background:linear-gradient(90deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:50px;text-decoration:none;">
          ${appTitle} Pro を使う →
        </a>
      </div>

      ${receiptUrl ? `
      <p style="text-align:center;margin:0;">
        <a href="${receiptUrl}" style="color:#64748b;font-size:12px;text-decoration:underline;">
          Stripe 領収書を表示
        </a>
      </p>` : ''}

      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0;">

      <p style="color:#475569;font-size:12px;line-height:1.7;margin:0;">
        ご不明な点は <a href="mailto:hiroshi.takizawa@digitalidentity.co.jp" style="color:#6366f1;">hiroshi.takizawa@digitalidentity.co.jp</a> までお問い合わせください。<br>
        <a href="${siteUrl}/help" style="color:#6366f1;">よくある質問</a> ／
        <a href="${siteUrl}/legal/tokusho" style="color:#6366f1;">特定商取引法</a> ／
        <a href="${siteUrl}/legal/terms" style="color:#6366f1;">利用規約</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `
MicroApps Hub — 購入完了のお知らせ

${appTitle} Pro のご購入ありがとうございます！

アプリ: ${appTitle} Pro
金額: ¥${amount.toLocaleString('ja-JP')}（税込・永久ライセンス）

今すぐご利用いただけます:
${siteUrl}/apps/${appSlug}/pro

${receiptUrl ? `領収書: ${receiptUrl}\n` : ''}
お問い合わせ: hiroshi.takizawa@digitalidentity.co.jp
`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `【購入完了】${appTitle} Pro へようこそ！🎉`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[email] Resend API error:', err);
    } else {
      const { id } = await res.json();
      console.log(`[email] 購入メール送信完了: ${id} → ${to}`);
    }
  } catch (err) {
    console.error('[email] メール送信に失敗しました（購入自体は成功）:', err);
  }
}

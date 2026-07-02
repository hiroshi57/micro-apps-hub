import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'よくある質問（FAQ）',
  description: 'MicroApps Hub に関するよくある質問と回答',
};

const faqs: { q: string; a: string | React.ReactNode }[] = [
  {
    q: 'Pro 版とは何ですか？',
    a: '各アプリの有料機能です。一度購入すると永続的にお使いいただける買い切り型です。月額料金はかかりません。アプリごとに個別購入（¥380〜¥780）できます。',
  },
  {
    q: '購入後すぐに使えますか？',
    a: '決済完了後、即時に Pro 機能が解放されます。購入前にログインが必要です。',
  },
  {
    q: '返金はできますか？',
    a: 'デジタルコンテンツの性質上、原則として返金はお受けできません。購入前に無料版で動作をご確認ください。ただしシステム障害等で Pro 機能がご利用いただけない場合は個別にご相談ください。',
  },
  {
    q: 'ログインせずに使えますか？',
    a: 'はい、無料版はアカウント登録なしでご利用いただけます。ただし、Pro 版の購入・スコアのクラウド保存にはアカウントが必要です。',
  },
  {
    q: 'スコアや記録が消えてしまいました',
    a: 'ログインしていない場合、スコアはブラウザの localStorage に保存されます。ブラウザのキャッシュ削除・デバイス変更・シークレットモードではデータが引き継がれません。ログイン済みであれば Supabase にバックアップされます。',
  },
  {
    q: 'パスワードを忘れました',
    a: (
      <>
        ログインページの「パスワードを忘れた方」よりリセットメールを送信できます。メールが届かない場合はスパムフォルダをご確認ください。それでも届かない場合は{' '}
        <a href="mailto:hiroshi.takizawa@digitalidentity.co.jp" className="text-brand-400 underline">
          お問い合わせ
        </a>
        ください。
      </>
    ),
  },
  {
    q: '購入したアプリを別のデバイスでも使えますか？',
    a: '同じアカウントでログインすれば、どのデバイスからでも購入済みの Pro 機能をご利用いただけます。',
  },
  {
    q: '支払い方法は何が使えますか？',
    a: 'Visa・Mastercard・American Express・JCB のクレジットカードをご利用いただけます（Stripe で安全に処理）。カード情報は当サービスでは保持しません。',
  },
  {
    q: '領収書はもらえますか？',
    a: '購入完了メールに Stripe の領収書 URL が記載されています。法人向けの請求書が必要な場合はお問い合わせください。',
  },
  {
    q: 'スマートフォンでも動きますか？',
    a: 'はい、iOS Safari・Android Chrome に対応しています。一部のゲームはスワイプ操作に対応しています。ホーム画面に追加するとアプリのようにご利用いただけます。',
  },
  {
    q: 'アカウントを削除したいです',
    a: (
      <>
        アカウント削除のご希望は{' '}
        <a href="mailto:hiroshi.takizawa@digitalidentity.co.jp" className="text-brand-400 underline">
          メール
        </a>
        にてお申し付けください。購入データを含む全データを削除します（購入済みの Pro 機能も利用できなくなります）。
      </>
    ),
  },
  {
    q: '新しいアプリは追加されますか？',
    a: 'はい、定期的に新しいアプリを追加予定です。リリースはSNS（X / Instagram / Note）でお知らせします。',
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-gray-500 hover:text-white text-sm mb-8 inline-block transition-colors">
          ← トップに戻る
        </Link>

        <h1 className="text-3xl font-bold mb-2">よくある質問</h1>
        <p className="text-gray-500 text-sm mb-10">FAQ — MicroApps Hub サポート</p>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl overflow-hidden transition-colors"
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none">
                <span className="font-medium text-white text-sm leading-relaxed">{faq.q}</span>
                <span className="text-gray-500 group-open:rotate-180 transition-transform shrink-0 text-lg">
                  ▾
                </span>
              </summary>
              <div className="px-6 pb-5 text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-14 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-gray-400 mb-2 text-sm">上記で解決しない場合</p>
          <h2 className="text-xl font-bold mb-4">お問い合わせ</h2>
          <a
            href="mailto:hiroshi.takizawa@digitalidentity.co.jp"
            className="inline-block bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3 rounded-full transition-colors text-sm"
          >
            メールで問い合わせる
          </a>
          <p className="text-gray-600 text-xs mt-4">平日 10:00〜18:00（土日祝除く）</p>
        </div>
      </div>
    </main>
  );
}

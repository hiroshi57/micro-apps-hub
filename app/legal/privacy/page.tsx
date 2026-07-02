import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'MicroApps Hub のプライバシーポリシー',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">{title}</h2>
    <div className="text-gray-300 text-sm leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-gray-500 hover:text-white text-sm mb-8 inline-block transition-colors">
          ← トップに戻る
        </Link>

        <h1 className="text-3xl font-bold mb-2">プライバシーポリシー</h1>
        <p className="text-gray-500 text-sm mb-10">最終更新: 2026年7月2日</p>

        <Section title="1. はじめに">
          <p>
            MicroApps Hub（以下「当サービス」）は、ユーザーの個人情報を適切に管理・保護することを重要な責務と考えています。
            本プライバシーポリシーでは、当サービスが収集する情報、その利用目的、および第三者への提供について説明します。
          </p>
        </Section>

        <Section title="2. 収集する情報">
          <p><strong className="text-white">2-1. アカウント情報（登録した場合）</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>メールアドレス</li>
            <li>パスワード（Supabase が暗号化して管理。当サービスは平文を保持しません）</li>
          </ul>

          <p><strong className="text-white">2-2. 購入情報</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>購入済みアプリのスラグ・購入日時（Supabase に保存）</li>
            <li>クレジットカード情報は Stripe, Inc. が管理し、当サービスは保持しません</li>
          </ul>

          <p><strong className="text-white">2-3. ゲームプレイデータ</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>スコア・プレイ時間・難易度（ブラウザの localStorage に保存）</li>
            <li>ログイン中の場合は Supabase にも同期（プレイ統計・成長グラフ用）</li>
          </ul>

          <p><strong className="text-white">2-4. アクセスログ（自動収集）</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>IPアドレス・ブラウザ種別・OS（Vercel のサーバーログ）</li>
            <li>アクセスしたページ・滞在時間（Vercel Analytics）</li>
            <li>エラー情報（Sentry を利用する場合）</li>
          </ul>
        </Section>

        <Section title="3. 情報の利用目的">
          <ul className="list-disc pl-5 space-y-1">
            <li>サービスの提供・運営・維持</li>
            <li>Pro 機能の購入確認・解放処理</li>
            <li>ゲームスコアの記録・統計表示</li>
            <li>お問い合わせへの対応</li>
            <li>サービス改善・新機能の開発</li>
            <li>不正利用の検知・防止</li>
            <li>法令上の義務の履行</li>
          </ul>
        </Section>

        <Section title="4. 第三者への情報提供">
          <p>当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護のために必要な場合</li>
          </ul>

          <p className="mt-4"><strong className="text-white">利用している外部サービス（サブプロセッサ）</strong></p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong className="text-white">Supabase, Inc.</strong> — 認証・データベース管理<br />
              <span className="text-gray-400">プライバシーポリシー: https://supabase.com/privacy</span>
            </li>
            <li>
              <strong className="text-white">Stripe, Inc.</strong> — 決済処理<br />
              <span className="text-gray-400">プライバシーポリシー: https://stripe.com/jp/privacy</span>
            </li>
            <li>
              <strong className="text-white">Vercel, Inc.</strong> — ホスティング・アクセス解析<br />
              <span className="text-gray-400">プライバシーポリシー: https://vercel.com/legal/privacy-policy</span>
            </li>
          </ul>
        </Section>

        <Section title="5. Cookie の利用">
          <p>
            当サービスでは、以下の目的で Cookie および localStorage を使用します。
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>ログインセッションの維持（Supabase Auth クッキー）</li>
            <li>ゲームのプレイ記録・設定の保存（localStorage）</li>
            <li>無料プレイ回数のカウント（localStorage）</li>
            <li>アクセス解析（Vercel Analytics）</li>
          </ul>
          <p>
            Cookie の利用を停止するには、ブラウザの設定から Cookie を無効化してください。
            ただし、一部機能（ログイン・プレイ記録など）が正常に動作しなくなる場合があります。
          </p>
        </Section>

        <Section title="6. データの保存期間">
          <ul className="list-disc pl-5 space-y-1">
            <li>アカウント情報: 退会申請まで</li>
            <li>購入情報: 法令に基づき7年間保存</li>
            <li>ゲームプレイデータ: アカウント削除まで（最大1,000件）</li>
            <li>アクセスログ: 90日間</li>
          </ul>
        </Section>

        <Section title="7. ユーザーの権利">
          <p>ユーザーは以下の権利を有します。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>保有する個人情報の開示請求</li>
            <li>個人情報の訂正・削除請求</li>
            <li>アカウント削除（データ削除）の申請</li>
          </ul>
          <p>
            これらの請求はメールにてお受けします：
            <a href="mailto:hiroshi.takizawa@digitalidentity.co.jp" className="text-brand-400 ml-1">
              hiroshi.takizawa@digitalidentity.co.jp
            </a>
          </p>
        </Section>

        <Section title="8. 未成年者の利用">
          <p>
            13歳未満のお子様がご利用になる場合は、保護者の同意を得た上でご利用ください。
            13歳未満のユーザーから意図的に個人情報を収集することはありません。
          </p>
        </Section>

        <Section title="9. ポリシーの変更">
          <p>
            本ポリシーは必要に応じて更新される場合があります。
            重要な変更がある場合は、サービス上でお知らせします。
            継続してサービスをご利用いただくことで、変更後のポリシーに同意したものとみなします。
          </p>
        </Section>

        <Section title="10. お問い合わせ">
          <p>
            個人情報に関するご質問・ご請求は下記までご連絡ください。
          </p>
          <p>
            メール:{' '}
            <a
              href="mailto:hiroshi.takizawa@digitalidentity.co.jp"
              className="text-brand-400 hover:text-brand-300 transition-colors"
            >
              hiroshi.takizawa@digitalidentity.co.jp
            </a>
          </p>
          <p>対応時間: 平日 10:00〜18:00（土日祝・年末年始を除く）</p>
        </Section>
      </div>
    </main>
  );
}

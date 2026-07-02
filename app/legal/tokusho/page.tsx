import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記',
  description: 'MicroApps Hub の特定商取引法に基づく表記ページ',
};

export default function TokushoPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-gray-500 hover:text-white text-sm mb-8 inline-block transition-colors">
          ← トップに戻る
        </Link>

        <h1 className="text-3xl font-bold mb-2">特定商取引法に基づく表記</h1>
        <p className="text-gray-500 text-sm mb-10">最終更新: 2026年7月2日</p>

        <div className="space-y-0 divide-y divide-white/5">
          {[
            { label: '販売業者', value: '滝澤 寛（個人事業主）' },
            { label: '運営統括責任者', value: '滝澤 寛' },
            { label: '所在地',
              value: '〒*** *** 東京都（詳細はメールにてお問い合わせください）',
            },
            { label: 'メールアドレス', value: 'hiroshi.takizawa@digitalidentity.co.jp' },
            { label: 'サービス名', value: 'MicroApps Hub' },
            { label: 'サービス URL', value: 'https://micro-apps-hub-seven.vercel.app' },
            {
              label: '販売価格',
              value: '各アプリページに記載の金額（税込）。¥380〜¥780（買い切り）',
            },
            {
              label: '支払方法',
              value: 'クレジットカード（Visa / Mastercard / American Express / JCB）',
            },
            { label: '支払時期', value: '購入手続き完了時に即時決済' },
            {
              label: 'サービス提供時期',
              value: '決済完了後、即時に Pro 機能を利用いただけます',
            },
            {
              label: '返品・返金ポリシー',
              value:
                'デジタルコンテンツの性質上、購入完了後の返品・返金は原則として承っておりません。購入前に無料版でご確認ください。ただし、システム障害等により Pro 機能をご利用いただけない場合は、お問い合わせいただいた上で対応いたします。',
            },
            {
              label: '動作環境',
              value:
                '最新版の Chrome / Safari / Firefox / Edge（JavaScript 有効）。インターネット接続が必要です。',
            },
            {
              label: '特記事項',
              value:
                '決済処理は Stripe, Inc. が提供するサービスを利用しています。カード情報は当サービスでは保持しません。',
            },
          ].map(({ label, value }) => (
            <div key={label} className="py-5 grid grid-cols-3 gap-4">
              <dt className="text-gray-400 text-sm font-medium col-span-1">{label}</dt>
              <dd className="text-white text-sm col-span-2 leading-relaxed">{value}</dd>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center space-y-2">
          <p className="text-gray-500 text-sm">お問い合わせ・ご不明点</p>
          <a
            href="mailto:hiroshi.takizawa@digitalidentity.co.jp"
            className="text-brand-400 hover:text-brand-300 transition-colors text-sm"
          >
            hiroshi.takizawa@digitalidentity.co.jp
          </a>
        </div>
      </div>
    </main>
  );
}

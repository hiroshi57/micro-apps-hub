import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '利用規約',
  description: 'MicroApps Hub の利用規約',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">{title}</h2>
    <div className="text-gray-300 text-sm leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-gray-500 hover:text-white text-sm mb-8 inline-block transition-colors">
          ← トップに戻る
        </Link>

        <h1 className="text-3xl font-bold mb-2">利用規約</h1>
        <p className="text-gray-500 text-sm mb-10">最終更新: 2026年7月2日</p>

        <p className="text-gray-300 text-sm leading-relaxed mb-10">
          本利用規約（以下「本規約」）は、MicroApps Hub（以下「当サービス」）の利用条件を定めるものです。
          ユーザーは本規約に同意の上、当サービスをご利用ください。
        </p>

        <Section title="第1条（定義）">
          <ul className="list-disc pl-5 space-y-1">
            <li>「当サービス」: MicroApps Hub（https://micro-apps-hub-seven.vercel.app）</li>
            <li>「運営者」: 滝澤 寛（個人事業主）</li>
            <li>「ユーザー」: 当サービスを利用する全ての方</li>
            <li>「Pro 版」: 有料機能の総称。購入後に永続的に利用できる買い切り型のサービス</li>
            <li>「コンテンツ」: ゲーム・ツール・ウェルネスアプリ等、当サービスが提供する全てのアプリ</li>
          </ul>
        </Section>

        <Section title="第2条（利用登録）">
          <p>
            当サービスの無料版はアカウント登録なしで利用できます。
            Pro 版の購入・学習記録の保存にはアカウント登録が必要です。
          </p>
          <p>
            登録の際は正確な情報を入力してください。虚偽の情報による登録が判明した場合、
            予告なくアカウントを停止することがあります。
          </p>
        </Section>

        <Section title="第3条（Pro 版の購入・利用）">
          <p>
            Pro 版は各アプリごとに買い切り価格で提供されます。
            一度購入したアプリの Pro 機能は、当サービスが提供を終了しない限り永続的にご利用いただけます。
          </p>
          <p>
            <strong className="text-white">返金について:</strong>{' '}
            デジタルコンテンツの性質上、原則として購入完了後の返金はいたしかねます。
            購入前に無料版でコンテンツを十分にご確認ください。
            ただし、システム障害により Pro 機能を一切ご利用いただけない場合は、
            個別にご相談の上対応いたします。
          </p>
        </Section>

        <Section title="第4条（禁止事項）">
          <p>ユーザーは以下の行為を行ってはなりません。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>当サービスのコンテンツの無断複製・転載・販売・二次配布</li>
            <li>リバースエンジニアリング・逆コンパイル・逆アセンブル</li>
            <li>他のユーザーのアカウントへの不正アクセス・なりすまし</li>
            <li>当サービスのサーバーへの過度な負荷をかける行為（DoS 攻撃等）</li>
            <li>不正な手段による Pro 機能の無料取得</li>
            <li>法令または公序良俗に違反する行為</li>
            <li>運営者または第三者の権利・名誉・信用を侵害する行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </Section>

        <Section title="第5条（知的財産権）">
          <p>
            当サービスのコンテンツ（ゲーム・デザイン・コード・テキスト・画像等）に関する
            知的財産権は運営者に帰属します。
            本規約に定める範囲を超えた利用は、書面による事前承諾が必要です。
          </p>
        </Section>

        <Section title="第6条（免責事項）">
          <p>
            運営者は、以下の事項について一切の責任を負いません。
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>当サービスの中断・停止・終了によるユーザーへの損害</li>
            <li>通信障害・システム障害による損害</li>
            <li>当サービスの利用により生じたユーザーと第三者との間のトラブル</li>
            <li>ユーザーのデバイス・ソフトウェアへの障害</li>
            <li>ゲームのスコア・記録の消失</li>
          </ul>
          <p>
            当サービスは現状有姿で提供されます。運営者は動作の完全性・正確性・継続性を保証しません。
          </p>
        </Section>

        <Section title="第7条（サービスの変更・終了）">
          <p>
            運営者は予告なくサービスの内容を変更し、または提供を終了することができます。
            ただし、Pro 版を購入済みのユーザーには、終了予定日の30日前にメールで通知するよう努めます。
          </p>
        </Section>

        <Section title="第8条（アカウントの停止・削除）">
          <p>
            ユーザーが本規約に違反した場合、運営者は予告なくアカウントを停止・削除できます。
            この場合、購入済みの Pro 版も利用できなくなりますが、返金はいたしません。
          </p>
          <p>
            退会・アカウント削除をご希望の場合は、メールにてご連絡ください。
          </p>
        </Section>

        <Section title="第9条（準拠法・管轄裁判所）">
          <p>
            本規約は日本法に準拠します。
            当サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </Section>

        <Section title="第10条（規約の変更）">
          <p>
            運営者は必要に応じて本規約を変更できます。
            重要な変更はサービス上で事前に告知します。
            変更後も継続してサービスをご利用いただくことで、変更後の規約に同意したものとみなします。
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-500 text-sm">お問い合わせ</p>
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

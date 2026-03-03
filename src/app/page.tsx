import Link from "next/link";
import { FileText, Eye, AlertTriangle, GitCompareArrows } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "自動パース",
    description:
      "登記情報のテキストやPDFを読み込み、構造化データへ自動変換。手入力の手間を大幅に削減します。",
  },
  {
    icon: Eye,
    title: "現在事項ビュー",
    description:
      "抹消済み事項を除いた現在有効な権利関係のみを表示。最新の状態をひと目で把握できます。",
  },
  {
    icon: AlertTriangle,
    title: "リスク検出",
    description:
      "差押・仮登記・買戻特約など、取引上注意すべきリスク要因を自動で検出しアラート表示します。",
  },
  {
    icon: GitCompareArrows,
    title: "横断比較",
    description:
      "複数物件の登記情報を並べて比較。所有者・担保権・リスクの違いを一覧で確認できます。",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            Touki Analyzer
          </span>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            ダッシュボード
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-indigo-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase mb-4">
            Touki Analyzer - 登記情報アナライザー
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            登記情報を、
            <br className="sm:hidden" />
            もっとわかりやすく。
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            不動産登記情報の構造化・可視化・分析を自動で実行。
            <br className="hidden sm:block" />
            複雑な登記簿をわかりやすく整理し、リスクを見逃しません。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-base font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200"
            >
              登記情報を解析する
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 text-base font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              ダッシュボードを見る
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              主な機能
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              登記情報の読み取りから分析まで、必要な機能をすべて備えています。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-5 group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            今すぐ登記情報を解析してみましょう
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            PDFまたはテキストをアップロードするだけで、すぐに解析結果を確認できます。
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 text-base font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            登記情報を解析する
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Touki Analyzer. All rights
              reserved.
            </p>
            <p className="text-xs text-gray-400">
              登記情報アナライザー &mdash;
              不動産登記情報の構造化・可視化・分析
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

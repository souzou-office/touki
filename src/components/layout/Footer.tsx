export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Touki Analyzer. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            登記情報アナライザー &mdash; 不動産登記情報の構造化・可視化・分析
          </p>
        </div>
      </div>
    </footer>
  );
}

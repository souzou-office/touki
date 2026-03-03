"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Upload, Building2, GitCompareArrows } from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard", label: "ダッシュボード", icon: Home },
  { href: "/upload", label: "アップロード", icon: Upload },
  { href: "/dashboard", label: "物件一覧", icon: Building2 },
  { href: "/compare", label: "横断比較", icon: GitCompareArrows },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 min-h-screen shrink-0">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <span className="text-lg font-bold text-blue-600">Touki Analyzer</span>
        </Link>

        <nav className="space-y-1">
          {sidebarLinks.map((link, index) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={`${link.href}-${index}`}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

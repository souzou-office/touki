import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-6 lg:p-8 bg-gray-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

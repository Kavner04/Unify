import Sidebar from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export default function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen" data-testid="dashboard-layout">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

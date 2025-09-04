import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ProfileEditor from "@/components/profile/profile-editor";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";
import ThemeEditor from "@/components/theme/theme-editor";
import WebhookManager from "@/components/webhooks/webhook-manager";

type DashboardTab = 'profile' | 'links' | 'design' | 'analytics' | 'webhooks' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
      case 'links':
        return <ProfileEditor />;
      case 'design':
        return <ThemeEditor />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'webhooks':
        return <WebhookManager />;
      case 'settings':
        return (
          <div className="p-8" data-testid="settings-tab">
            <h2 className="text-2xl font-bold text-foreground mb-6">Configurações</h2>
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Configurações da Conta</h3>
                <p className="text-muted-foreground">Recursos de gerenciamento de conta em breve.</p>
              </div>
            </div>
          </div>
        );
      default:
        return <ProfileEditor />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} data-testid="dashboard">
      {renderContent()}
    </DashboardLayout>
  );
}

import { Button } from "@/components/ui/button";
import { 
  User, 
  Link, 
  Palette, 
  BarChart3, 
  Nfc, 
  Wallet, 
  Webhook, 
  Settings,
  LogOut
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navigationItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'links', label: 'Links', icon: Link },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'analytics', label: 'Análises', icon: BarChart3 },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  ];

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <aside className="w-64 bg-card border-r border-border" data-testid="sidebar">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Link className="text-primary-foreground text-sm" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Unify</h1>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
                  isActive 
                    ? 'text-foreground bg-primary/10 border-l-4 border-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="mt-8 pt-8 border-t border-border">
          <button
            onClick={() => onTabChange('settings')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-colors mb-2 ${
              activeTab === 'settings'
                ? 'text-foreground bg-primary/10 border-l-4 border-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            data-testid="nav-settings"
          >
            <Settings className="h-5 w-5" />
            <span>Configurações</span>
          </button>
          <Button
            variant="ghost"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full justify-start"
            onClick={handleSignOut}
            data-testid="button-sign-out"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}

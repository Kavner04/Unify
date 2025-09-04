import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  ExternalLink, 
  BarChart3, 
  Settings,
  Plus,
  Eye,
  MousePointer,
  Nfc,
  Download
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated && !!profile,
  });

  const { data: recentEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated && !!profile,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleCreateProfile = () => {
    navigate("/dashboard");
  };

  const handleViewPublicProfile = () => {
    if (profile?.username) {
      window.open(`/@${profile.username}`, "_blank");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // If user doesn't have a profile, show onboarding
  if (!profileLoading && !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" data-testid="onboarding-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Bem-vindo ao Unify!</CardTitle>
            <p className="text-muted-foreground">
              Vamos criar seu cartão de visita digital profissional. Leva apenas alguns minutos.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Criar Perfil</h3>
                <p className="text-sm text-muted-foreground">Adicione suas informações e foto</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto">
                  <Settings className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">Personalizar</h3>
                <p className="text-sm text-muted-foreground">Escolha cores e tema</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto">
                  <ExternalLink className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">Compartilhar</h3>
                <p className="text-sm text-muted-foreground">Começar networking!</p>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleCreateProfile}
              data-testid="button-create-profile"
            >
              <Plus className="mr-2 h-5 w-5" />
              Criar Meu Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="home-dashboard">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <User className="text-primary-foreground text-sm" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Unify</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {profile && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewPublicProfile}
                  data-testid="button-view-profile"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver Perfil
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo de volta{user?.firstName ? `, ${user.firstName}` : ''}!
          </h2>
          <p className="text-muted-foreground">
            {profile ? 
              `Seu cartão de visita digital está ativo em @${profile.username}` : 
              "Vamos configurar seu cartão de visita digital."
            }
          </p>
        </div>

        {profile && (
          <>
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Visualizações do Perfil</p>
                      {analyticsLoading ? (
                        <Skeleton className="h-8 w-16 mt-2" />
                      ) : (
                        <p className="text-2xl font-bold text-foreground" data-testid="text-profile-views">
                          {analytics?.profileViews || 0}
                        </p>
                      )}
                    </div>
                    <Eye className="h-8 w-8 text-teal-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cliques em Links</p>
                      {analyticsLoading ? (
                        <Skeleton className="h-8 w-16 mt-2" />
                      ) : (
                        <p className="text-2xl font-bold text-foreground" data-testid="text-link-clicks">
                          {analytics?.linkClicks || 0}
                        </p>
                      )}
                    </div>
                    <MousePointer className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Leituras NFC</p>
                      {analyticsLoading ? (
                        <Skeleton className="h-8 w-16 mt-2" />
                      ) : (
                        <p className="text-2xl font-bold text-foreground" data-testid="text-nfc-scans">
                          {analytics?.nfcScans || 0}
                        </p>
                      )}
                    </div>
                    <Nfc className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Contatos Salvos</p>
                      {analyticsLoading ? (
                        <Skeleton className="h-8 w-16 mt-2" />
                      ) : (
                        <p className="text-2xl font-bold text-foreground" data-testid="text-contacts-saved">
                          {analytics?.contactsSaved || 0}
                        </p>
                      )}
                    </div>
                    <Download className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col space-y-2"
                onClick={() => navigate("/dashboard")}
                data-testid="button-edit-profile"
              >
                <User className="h-6 w-6" />
                <span>Editar Perfil</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col space-y-2"
                onClick={handleViewPublicProfile}
                data-testid="button-share-profile"
              >
                <ExternalLink className="h-6 w-6" />
                <span>Compartilhar Perfil</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col space-y-2"
                onClick={() => navigate("/dashboard")}
                data-testid="button-analytics"
              >
                <BarChart3 className="h-6 w-6" />
                <span>Análises</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col space-y-2"
                onClick={() => navigate("/dashboard")}
                data-testid="button-settings"
              >
                <Settings className="h-6 w-6" />
                <span>Configurações</span>
              </Button>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-8" />
                      </div>
                    ))}
                  </div>
                ) : recentEvents && recentEvents.length > 0 ? (
                  <div className="space-y-4">
                    {recentEvents.slice(0, 5).map((event: any, index: number) => (
                      <div 
                        key={event.id} 
                        className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg"
                        data-testid={`event-${index}`}
                      >
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {event.eventType === 'profile_view' && <Eye className="h-5 w-5 text-teal-500" />}
                          {event.eventType === 'link_click' && <MousePointer className="h-5 w-5 text-orange-500" />}
                          {event.eventType === 'nfc_scan' && <Nfc className="h-5 w-5 text-blue-600" />}
                          {event.eventType === 'contact_save' && <Download className="h-5 w-5 text-yellow-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {event.eventType === 'profile_view' && 'Perfil visualizado'}
                            {event.eventType === 'link_click' && 'Link clicado'}
                            {event.eventType === 'nfc_scan' && 'Cartão NFC escaneado'}
                            {event.eventType === 'contact_save' && 'Contato salvo'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Nenhuma atividade ainda. Compartilhe seu perfil para ver o engajamento!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

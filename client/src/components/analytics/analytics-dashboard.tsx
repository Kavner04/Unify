import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  MousePointer, 
  Nfc, 
  Download, 
  ArrowUp, 
  ArrowDown,
  BarChart3,
  TrendingUp,
  Users,
  Globe
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("7");

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics", { days: timeRange }],
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events", { limit: 20 }],
  });

  const handleExportCSV = () => {
    // TODO: Implement CSV export functionality
    console.log("Exporting CSV...");
  };

  const formatPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  // Mock previous period data for comparison (in a real app, this would come from the API)
  const previousPeriodData = {
    profileViews: Math.floor((analytics?.profileViews || 0) * 0.88),
    linkClicks: Math.floor((analytics?.linkClicks || 0) * 0.92),
    nfcScans: Math.floor((analytics?.nfcScans || 0) * 0.76),
    contactsSaved: Math.floor((analytics?.contactsSaved || 0) * 0.84),
  };

  const metrics = [
    {
      title: "Visualizações do Perfil",
      value: analytics?.profileViews || 0,
      icon: Eye,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      change: formatPercentageChange(analytics?.profileViews || 0, previousPeriodData.profileViews),
    },
    {
      title: "Cliques em Links",
      value: analytics?.linkClicks || 0,
      icon: MousePointer,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      change: formatPercentageChange(analytics?.linkClicks || 0, previousPeriodData.linkClicks),
    },
    {
      title: "Leituras NFC",
      value: analytics?.nfcScans || 0,
      icon: Nfc,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      change: formatPercentageChange(analytics?.nfcScans || 0, previousPeriodData.nfcScans),
    },
    {
      title: "Contatos Salvos",
      value: analytics?.contactsSaved || 0,
      icon: Download,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      change: formatPercentageChange(analytics?.contactsSaved || 0, previousPeriodData.contactsSaved),
    },
  ];

  return (
    <div className="p-8 space-y-8" data-testid="analytics-dashboard">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Painel de Análises</h2>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="secondary" 
            onClick={handleExportCSV}
            data-testid="button-export-csv"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} data-testid={`metric-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    {analyticsLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground" data-testid={`metric-value-${index}`}>
                        {metric.value.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${metric.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`${metric.color} h-6 w-6`} />
                  </div>
                </div>
                {!analyticsLoading && (
                  <div className="mt-4 flex items-center text-sm">
                    {metric.change.isPositive ? (
                      <ArrowUp className="text-teal-500 h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="text-destructive h-4 w-4 mr-1" />
                    )}
                    <span className={metric.change.isPositive ? "text-teal-500 font-medium" : "text-destructive font-medium"}>
                      {metric.change.value.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground ml-1">vs período anterior</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Views Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Visualizações do Perfil ao Longo do Tempo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : analytics?.dailyViews && analytics.dailyViews.length > 0 ? (
              <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm">Gráfico Interativo</p>
                  <p className="text-xs">Implementação Chart.js ou Recharts necessária</p>
                </div>
              </div>
            ) : (
              <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm">Nenhum dado disponível</p>
                  <p className="text-xs">Visualizações aparecerão aqui quando você começar a receber tráfego</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MousePointer className="h-5 w-5" />
              <span>Links com Melhor Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-8 mb-1" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : analytics?.topLinks && analytics.topLinks.length > 0 ? (
              <div className="space-y-4">
                {analytics.topLinks.map((link: any, index: number) => (
                  <div 
                    key={link.linkId} 
                    className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                    data-testid={`top-link-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <MousePointer className="text-primary h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{link.title}</p>
                        <p className="text-sm text-muted-foreground">{link.clicks} cliques</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-teal-500">
                        {analytics.linkClicks > 0 ? ((link.clicks / analytics.linkClicks) * 100).toFixed(0) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">CTR</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MousePointer className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-sm">Nenhum clique em links ainda</p>
                  <p className="text-xs">Adicione alguns links ao seu perfil para ver dados de performance</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Atividade Recente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="space-y-4">
              {events.slice(0, 10).map((event: any, index: number) => (
                <div 
                  key={event.id} 
                  className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg"
                  data-testid={`recent-activity-${index}`}
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
                  <div className="text-right">
                    {event.referrer && (
                      <p className="text-xs text-muted-foreground">
                        via {new URL(event.referrer).hostname}
                      </p>
                    )}
                    {event.country && (
                      <p className="text-xs text-muted-foreground">{event.country}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Nenhuma atividade ainda</p>
              <p className="text-sm">Compartilhe seu perfil para ver dados de engajamento!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

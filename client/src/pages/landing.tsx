import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Link, 
  Nfc, 
  Wallet, 
  BarChart3, 
  Palette, 
  QrCode, 
  Share2,
  CheckCircle,
  Rocket,
  Play,
  ExternalLink,
  Calendar
} from "lucide-react";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: <Nfc className="text-primary text-xl" />,
      title: "Tecnologia NFC",
      description: "Simplesmente toque seu cartão de visitas com NFC para compartilhar seu perfil instantaneamente. Funciona com dispositivos iOS e Android."
    },
    {
      icon: <Wallet className="text-orange-500 text-xl" />,
      title: "Carteiras Digitais",
      description: "Adicione seu cartão de visitas ao Apple Wallet ou Google Wallet para acesso fácil e compartilhamento em qualquer dispositivo."
    },
    {
      icon: <BarChart3 className="text-teal-500 text-xl" />,
      title: "Analytics Avançados",
      description: "Acompanhe visualizações do perfil, cliques em links e engajamento com analytics detalhados e suporte a parâmetros UTM."
    },
    {
      icon: <Palette className="text-yellow-500 text-xl" />,
      title: "Temas Personalizados",
      description: "Personalize seu cartão de visitas com cores, fontes, layouts e fundos personalizados para combinar com sua marca."
    },
    {
      icon: <QrCode className="text-orange-600 text-xl" />,
      title: "Geração de QR Code",
      description: "Gere QR codes bonitos para seu perfil que podem ser impressos em cartões de visita, panfletos ou exibidos digitalmente."
    },
    {
      icon: <Share2 className="text-primary text-xl" />,
      title: "Integração Social",
      description: "Conecte todos os seus perfis de redes sociais, sites e links importantes em uma página bonita e compartilhável."
    }
  ];

  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Link className="text-primary-foreground text-sm" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Unify</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
              <a href="#examples" className="text-muted-foreground hover:text-foreground transition-colors">Exemplos</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleSignIn}
                data-testid="button-sign-in"
              >
                Entrar
              </Button>
              <Button 
                onClick={handleGetStarted}
                data-testid="button-get-started"
              >
                Começar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  Seu
                  <span className="text-primary"> Cartão Digital</span>
                  do Futuro
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Crie um cartão de visita digital profissional com NFC, integração com Apple e Google Wallet, e analytics avançados. Perfeito para networking, eventos e profissionais modernos.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={handleGetStarted}
                  className="text-lg px-8 py-4"
                  data-testid="button-start-free"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Começar Gratis
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4"
                  data-testid="button-view-demo"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demo
                </Button>
              </div>
              
              <div className="flex items-center space-x-8 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-teal-500 h-5 w-5" />
                  <span>NFC Pronto</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wallet className="text-orange-500 h-5 w-5" />
                  <span>Integração com Carteira</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="text-blue-500 h-5 w-5" />
                  <span>Analytics Avançados</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 animate-pulse">
                <img 
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=800" 
                  alt="Smartphone exibindo interface do cartão de negócios Unify" 
                  className="rounded-3xl shadow-2xl w-full max-w-md mx-auto"
                  data-testid="img-hero-phone"
                />
              </div>
              <div className="absolute top-4 right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-8 left-4 w-16 h-16 bg-teal-500/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground">
              Tudo que Você Precisa para Networking Profissional
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transforme como você compartilha suas informações profissionais com tecnologia de ponta e design bonito.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="shadow-lg hover:shadow-xl transition-all"
                data-testid={`card-feature-${index}`}
              >
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Example Section */}
      <section id="examples" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground">
              Veja o Unify em Ação
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Exemplos reais de profissionais usando o Unify para melhorar seu networking.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="gradient-border">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Exemplo profissional" 
                    className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-card shadow-md"
                    data-testid="img-example-profile-1"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">Marcus Johnson</h4>
                    <p className="text-sm text-muted-foreground">Product Designer</p>
                  </div>
                  <Button size="sm" className="w-full">
                    Trocar Contato
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <ExternalLink className="h-4 w-4 mx-auto text-blue-600" />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <Calendar className="h-4 w-4 mx-auto text-green-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Exemplo profissional" 
                    className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-card shadow-md"
                    data-testid="img-example-profile-2"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">Sarah Chen</h4>
                    <p className="text-sm text-muted-foreground">Diretora de Marketing</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Trocar Contato
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <ExternalLink className="h-4 w-4 mx-auto text-pink-600" />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <Calendar className="h-4 w-4 mx-auto text-blue-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Exemplo profissional" 
                    className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-card shadow-md"
                    data-testid="img-example-profile-3"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">Alex Rivera</h4>
                    <p className="text-sm text-muted-foreground">Empreendedor de Tecnologia</p>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full">
                    Trocar Contato
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <ExternalLink className="h-4 w-4 mx-auto text-purple-600" />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <Calendar className="h-4 w-4 mx-auto text-orange-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Pronto para Transformar seu Networking?
            </h3>
            <p className="text-xl text-primary-foreground/80">
              Junte-se a milhares de profissionais que já usam o Unify para compartilhar suas informações perfeitamente.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
              className="text-lg px-8 py-4"
              data-testid="button-start-now"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Começar Agora - É Gratis
            </Button>
          </div>
          
          <p className="text-sm text-primary-foreground/60">
            Nenhum cartão de crédito necessário • Configuração em minutos • Cancele a qualquer momento
          </p>
        </div>
      </section>
    </div>
  );
}

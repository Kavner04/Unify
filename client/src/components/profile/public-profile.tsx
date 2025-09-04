import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  Phone, 
  Building, 
  Download, 
  Wallet, 
  ExternalLink, 
  QrCode, 
  Share2,
  Globe,
  Calendar,
  Linkedin,
  Instagram,
  MessageCircle,
  Handshake
} from "lucide-react";

interface PublicProfileProps {
  username: string;
  className?: string;
}

export default function PublicProfile({ username, className = "" }: PublicProfileProps) {
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading, error } = useQuery({
    queryKey: ["/api/public/profile", username],
    enabled: !!username,
  });

  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: ["/api/public/links", profile?.id],
    enabled: !!profile?.id,
  });

  const trackEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      await apiRequest("POST", "/api/track/link-click", eventData);
    },
  });

  const handleLinkClick = (link: any) => {
    trackEventMutation.mutate({
      linkId: link.id,
      profileId: profile.id,
      referrer: document.referrer,
      utm: {
        source: new URLSearchParams(window.location.search).get('utm_source'),
        medium: new URLSearchParams(window.location.search).get('utm_medium'),
        campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
      }
    });
    window.open(link.url, '_blank');
  };

  const handleExchangeContact = () => {
    // Track the exchange contact interaction
    if (profile) {
      trackEventMutation.mutate({
        profileId: profile.id,
        eventType: 'contact_exchange',
        referrer: document.referrer,
      });
    }
    
    // Show contact options
    toast({
      title: "Troca de Contato",
      description: "Escolha como gostaria de salvar este contato abaixo.",
    });
  };

  const handleSaveContact = () => {
    if (profile?.username) {
      const link = document.createElement('a');
      link.href = `/api/vcard/${profile.username}`;
      link.download = `${profile.username}.vcf`;
      link.click();
      
      // Track contact save
      trackEventMutation.mutate({
        profileId: profile.id,
        eventType: 'contact_save',
        referrer: document.referrer,
      });
      
      toast({
        title: "Contato Salvo",
        description: "vCard baixado com sucesso!",
      });
    }
  };

  const handleAddToWallet = () => {
    if (profile) {
      // Track wallet add attempt
      trackEventMutation.mutate({
        profileId: profile.id,
        eventType: 'wallet_add',
        referrer: document.referrer,
      });
    }
    
    toast({
      title: "Adicionar à Carteira",
      description: "Integração com carteira em breve!",
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/@${username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.displayName || 'Profissional'} - Cartão de Visita Digital`,
          text: `Confira o cartão de visita digital de ${profile?.displayName || 'este profissional'}`,
          url: url
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "Profile link copied to clipboard!",
        });
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard!",
      });
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="h-5 w-5 text-blue-600" />;
      case 'instagram': return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'whatsapp': return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'facebook': return <Globe className="h-5 w-5 text-blue-500" />;
      case 'youtube': return <Globe className="h-5 w-5 text-red-500" />;
      case 'twitter': return <Globe className="h-5 w-5 text-blue-400" />;
      case 'github': return <Globe className="h-5 w-5 text-gray-700" />;
      case 'website1':
      case 'website2':
      case 'website': return <Globe className="h-5 w-5 text-blue-500" />;
      default: return <Globe className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSocialLabel = (platform: string) => {
    switch (platform) {
      case 'linkedin': return 'LinkedIn';
      case 'instagram': return 'Instagram';
      case 'whatsapp': return 'WhatsApp';
      case 'facebook': return 'Facebook';
      case 'youtube': return 'YouTube';
      case 'twitter': return 'Twitter';
      case 'github': return 'GitHub';
      case 'website1': return 'Website';
      case 'website2': return 'Portfolio';
      case 'website': return 'Website';
      default: return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  if (profileLoading) {
    return (
      <div className={`max-w-md mx-auto min-h-screen bg-card ${className}`} data-testid="loading-public-profile">
        <div className="relative">
          <Skeleton className="h-48 w-full" />
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <Skeleton className="w-32 h-32 rounded-full" />
          </div>
        </div>
        <div className="pt-20 px-6 pb-8 space-y-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`max-w-md mx-auto min-h-screen bg-card flex items-center justify-center p-6 ${className}`} data-testid="public-profile-error">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <ExternalLink className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Profile Not Found</h1>
          <p className="text-muted-foreground">
            The profile you're looking for doesn't exist or has been made private.
          </p>
        </div>
      </div>
    );
  }

  const backgroundStyle = profile.theme?.backgroundType === 'gradient' 
    ? { background: `linear-gradient(135deg, ${profile.theme.primaryColor || '#3b82f6'}, ${profile.theme.secondaryColor || '#1e40af'})` }
    : profile.theme?.backgroundType === 'image' && profile.theme.backgroundValue
    ? { backgroundImage: `url(${profile.theme.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: profile.theme?.primaryColor || '#3b82f6' };

  const primaryColor = profile.theme?.primaryColor || '#3b82f6';

  return (
    <div className={`max-w-md mx-auto min-h-screen bg-card ${className}`} data-testid="public-profile-component">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-48 relative overflow-hidden" style={backgroundStyle}>
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
            alt="Professional background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        
        {/* Profile Photo */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <img 
            src={profile.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"} 
            alt="Profile photo" 
            className={`w-32 h-32 border-4 border-card shadow-xl object-cover ${
              profile.theme?.avatarStyle === 'square' 
                ? 'rounded-none' 
                : profile.theme?.avatarStyle === 'rounded-square' 
                ? 'rounded-lg' 
                : 'rounded-full'
            }`}
            data-testid="img-profile-photo"
          />
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="pt-20 px-6 pb-8 space-y-6" style={{ textAlign: profile.theme?.textAlign || 'center' }}>
        {/* Basic Info */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-display-name">
            {profile.displayName || 'Professional'}
          </h1>
          {profile.title && (
            <p className="text-muted-foreground font-medium" data-testid="text-title">
              {profile.title}
            </p>
          )}
          {profile.bio && (
            <p className="text-sm text-muted-foreground" data-testid="text-bio">
              {profile.bio}
            </p>
          )}
        </div>
        
        {/* Contact CTA */}
        <Button 
          size="lg"
          className={`w-full py-4 text-lg font-semibold ${
            profile.theme?.buttonStyle === 'sharp' 
              ? 'rounded-none' 
              : profile.theme?.buttonStyle === 'pill' 
              ? 'rounded-full' 
              : 'rounded-lg'
          }`}
          style={{ backgroundColor: primaryColor }}
          onClick={handleExchangeContact}
          data-testid="button-exchange-contact"
        >
          <Handshake className="mr-2 h-5 w-5" />
          Exchange Contact
        </Button>
        
        {/* Contact Methods */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="secondary" 
            className="flex items-center justify-center space-x-2 py-3"
            onClick={handleSaveContact}
            data-testid="button-save-contact"
          >
            <Download className="h-4 w-4" />
            <span className="font-medium">Save Contact</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center space-x-2 py-3"
            onClick={handleAddToWallet}
            data-testid="button-add-wallet"
          >
            <Wallet className="h-4 w-4" />
            <span className="font-medium">Add to Wallet</span>
          </Button>
        </div>
        
        {/* Contact Info */}
        {(profile.email || profile.phone || profile.address) && (
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-3">
              {profile.email && (
                <div className="flex items-center space-x-3" data-testid="contact-email">
                  <Mail className="text-muted-foreground h-5 w-5" />
                  <span className="text-foreground">{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center space-x-3" data-testid="contact-phone">
                  <Phone className="text-muted-foreground h-5 w-5" />
                  <span className="text-foreground">{profile.phone}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center space-x-3" data-testid="contact-address">
                  <Building className="text-muted-foreground h-5 w-5" />
                  <span className="text-foreground">{profile.address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Social Links */}
        {profile.socials && Object.keys(profile.socials).some(key => profile.socials[key]) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Connect With Me</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(profile.socials).map(([platform, url]) => {
                if (!url) return null;
                return (
                  <a 
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-card border border-border py-3 rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
                    data-testid={`link-social-${platform}`}
                    onClick={() => {
                      trackEventMutation.mutate({
                        profileId: profile.id,
                        eventType: 'social_click',
                        metadata: { platform },
                        referrer: document.referrer,
                      });
                    }}
                  >
                    {getSocialIcon(platform)}
                    <span className="font-medium">{getSocialLabel(platform)}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Custom Links */}
        {!linksLoading && links && links.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
            {links.map((link: any, index: number) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className="block w-full bg-card border border-border p-4 rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm group text-left"
                data-testid={`link-custom-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-accent-foreground">
                      {link.title}
                    </h4>
                    {link.description && (
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="text-muted-foreground group-hover:text-accent-foreground transition-colors h-5 w-5" />
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* Share Section */}
        <div className="text-center pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Share this profile</p>
          <div className="inline-flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (profile?.username) {
                  window.open(`/api/qr/${profile.username}`, '_blank');
                }
              }}
              data-testid="button-generate-qr"
            >
              <QrCode className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">QR Code</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              data-testid="button-share-profile"
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Share</span>
            </Button>
          </div>
        </div>
        
        {/* Powered by */}
        <div className="text-center pt-6">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="font-semibold text-primary">Unify</span>
          </p>
        </div>
      </div>
    </div>
  );
}

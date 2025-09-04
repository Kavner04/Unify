import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Monitor, ExternalLink, QrCode } from "lucide-react";

interface LivePreviewProps {
  profile: any;
  links: any[];
}

export default function LivePreview({ profile, links }: LivePreviewProps) {
  const handlePreviewProfile = () => {
    if (profile?.username) {
      window.open(`/@${profile.username}`, '_blank');
    }
  };

  const handleGenerateQR = () => {
    // TODO: Implement QR code generation modal
    console.log("Generate QR code");
  };

  return (
    <Card data-testid="live-preview">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" data-testid="button-mobile-preview">
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-desktop-preview">
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Preview Frame */}
        <div className="mx-auto max-w-sm bg-background rounded-2xl border-4 border-muted shadow-xl overflow-hidden">
          <div className="relative">
            {/* Background with gradient overlay */}
            <div className="h-32 bg-gradient-to-br from-primary to-blue-700"></div>
            
            {/* Profile Photo */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <img 
                src={profile?.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                alt="Profile preview" 
                className="w-16 h-16 rounded-full border-2 border-card shadow-lg object-cover"
                data-testid="img-preview-photo"
              />
            </div>
          </div>
          
          <div className="pt-12 px-4 pb-4 space-y-4">
            <div className="text-center">
              <h4 className="font-bold text-foreground" data-testid="text-preview-name">
                {profile?.displayName || "Your Name"}
              </h4>
              <p className="text-sm text-muted-foreground" data-testid="text-preview-title">
                {profile?.title || "Your Title"}
              </p>
              {profile?.bio && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2" data-testid="text-preview-bio">
                  {profile.bio}
                </p>
              )}
            </div>
            
            <Button size="sm" className="w-full" data-testid="button-preview-cta">
              Exchange Contact
            </Button>
            
            {/* Contact Info Preview */}
            {(profile?.email || profile?.phone) && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                {profile.email && (
                  <div className="text-xs text-foreground flex items-center space-x-2">
                    <span>📧</span>
                    <span className="truncate">{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="text-xs text-foreground flex items-center space-x-2">
                    <span>📱</span>
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Links Preview */}
            {links && links.length > 0 && (
              <div className="space-y-2">
                {links.slice(0, 2).map((link: any, index: number) => (
                  <div 
                    key={link.id} 
                    className="bg-muted/50 rounded-lg p-2 text-xs"
                    data-testid={`preview-link-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate">{link.title}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                ))}
                {links.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{links.length - 2} more links
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Preview Actions */}
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviewProfile}
            disabled={!profile?.username}
            data-testid="button-view-public"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Public Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateQR}
            disabled={!profile?.username}
            data-testid="button-generate-qr"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

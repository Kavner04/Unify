import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Palette, 
  Smartphone, 
  Monitor, 
  Download,
  QrCode,
  Nfc,
  Search,
  CheckCircle,
  Wallet,
  Apple
} from "lucide-react";
import { SiGoogle } from "react-icons/si";

const colorPresets = [
  { name: "professional", primary: "#1e40af", secondary: "#475569", gradient: "from-blue-600 to-blue-800" },
  { name: "creative", primary: "#7c3aed", secondary: "#ec4899", gradient: "from-purple-600 to-pink-600" },
  { name: "nature", primary: "#059669", secondary: "#0d9488", gradient: "from-green-600 to-teal-600" },
  { name: "sunset", primary: "#ea580c", secondary: "#dc2626", gradient: "from-orange-600 to-red-600" },
];

export default function ThemeEditor() {
  const [selectedPreview, setSelectedPreview] = useState("mobile");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  const [theme, setTheme] = useState({
    primaryColor: "#1e40af",
    secondaryColor: "#475569",
    backgroundType: "gradient" as "solid" | "gradient" | "image",
    backgroundValue: "",
    fontFamily: "Inter",
    avatarStyle: "circle" as "circle" | "square" | "rounded-square",
    buttonStyle: "rounded" as "rounded" | "sharp" | "pill",
    textAlign: "center" as "left" | "center" | "right",
  });

  useEffect(() => {
    if (profile?.theme) {
      setTheme({
        primaryColor: profile.theme.primaryColor || "#1e40af",
        secondaryColor: profile.theme.secondaryColor || "#475569",
        backgroundType: profile.theme.backgroundType || "gradient",
        backgroundValue: profile.theme.backgroundValue || "",
        fontFamily: profile.theme.fontFamily || "Inter",
        avatarStyle: profile.theme.avatarStyle || "circle",
        buttonStyle: profile.theme.buttonStyle || "rounded",
        textAlign: profile.theme.textAlign || "center",
      });
    }
  }, [profile]);

  const updateThemeMutation = useMutation({
    mutationFn: async (themeData: any) => {
      return await apiRequest("PUT", "/api/profile", {
        theme: themeData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Theme updated",
        description: "Your theme has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating theme",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleColorPreset = (preset: typeof colorPresets[0]) => {
    setTheme({
      ...theme,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    });
  };

  const handleSaveTheme = () => {
    updateThemeMutation.mutate(theme);
  };

  const handleGenerateQR = () => {
    if (profile?.username) {
      window.open(`/api/qr/${profile.username}`, '_blank');
    }
  };

  const getAvatarStyle = () => {
    switch (theme.avatarStyle) {
      case "square": return "rounded-none";
      case "rounded-square": return "rounded-lg";
      default: return "rounded-full";
    }
  };

  const getButtonStyle = () => {
    switch (theme.buttonStyle) {
      case "sharp": return "rounded-none";
      case "pill": return "rounded-full";
      default: return "rounded-lg";
    }
  };

  if (profileLoading) {
    return (
      <div className="p-8" data-testid="loading-theme-editor">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="theme-editor">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Theme Controls */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Customize Your Theme</h2>
          
          {/* Color Scheme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Color Scheme</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      id="primary-color"
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="w-12 h-10 rounded-lg border border-input cursor-pointer"
                      data-testid="input-primary-color"
                    />
                    <span className="text-sm text-muted-foreground">{theme.primaryColor}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                      className="w-12 h-10 rounded-lg border border-input cursor-pointer"
                      data-testid="input-secondary-color"
                    />
                    <span className="text-sm text-muted-foreground">{theme.secondaryColor}</span>
                  </div>
                </div>
              </div>
              
              {/* Preset Colors */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-3 block">Quick Presets</Label>
                <div className="flex space-x-3">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      className={`w-12 h-12 p-0 bg-gradient-to-br ${preset.gradient} hover:scale-110 transition-transform`}
                      onClick={() => handleColorPreset(preset)}
                      data-testid={`preset-${preset.name}`}
                    >
                      <span className="sr-only">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Layout Options */}
          <Card>
            <CardHeader>
              <CardTitle>Layout & Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Avatar Style</Label>
                  <div className="flex space-x-3">
                    {[
                      { value: "circle", icon: "●" },
                      { value: "square", icon: "■" },
                      { value: "rounded-square", icon: "▢" }
                    ].map((style) => (
                      <Button
                        key={style.value}
                        variant={theme.avatarStyle === style.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme({ ...theme, avatarStyle: style.value as any })}
                        className="w-12 h-12"
                        data-testid={`avatar-style-${style.value}`}
                      >
                        {style.icon}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="button-style">Button Style</Label>
                  <Select 
                    value={theme.buttonStyle} 
                    onValueChange={(value) => setTheme({ ...theme, buttonStyle: value as any })}
                  >
                    <SelectTrigger data-testid="select-button-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="sharp">Sharp</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-foreground mb-3 block">Background</Label>
                <div className="flex space-x-3">
                  {[
                    { value: "solid", label: "Solid Color" },
                    { value: "gradient", label: "Gradient" },
                    { value: "image", label: "Image" }
                  ].map((bg) => (
                    <Button
                      key={bg.value}
                      variant={theme.backgroundType === bg.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme({ ...theme, backgroundType: bg.value as any })}
                      className="flex-1"
                      data-testid={`background-${bg.value}`}
                    >
                      {bg.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="font-family">Font Family</Label>
                <Select 
                  value={theme.fontFamily} 
                  onValueChange={(value) => setTheme({ ...theme, fontFamily: value })}
                >
                  <SelectTrigger data-testid="select-font-family">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter (Modern)</SelectItem>
                    <SelectItem value="Playfair Display">Playfair Display (Elegant)</SelectItem>
                    <SelectItem value="Space Grotesk">Space Grotesk (Tech)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="text-align">Text Alignment</Label>
                <Select 
                  value={theme.textAlign} 
                  onValueChange={(value) => setTheme({ ...theme, textAlign: value as any })}
                >
                  <SelectTrigger data-testid="select-text-align">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSaveTheme}
            disabled={updateThemeMutation.isPending}
            className="w-full"
            data-testid="button-save-theme"
          >
            {updateThemeMutation.isPending ? "Saving..." : "Save Theme"}
          </Button>
        </div>
        
        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Theme Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Preview</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={selectedPreview === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPreview("mobile")}
                    data-testid="button-mobile-preview"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={selectedPreview === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPreview("desktop")}
                    data-testid="button-desktop-preview"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mini Profile Preview */}
              <div 
                className="bg-background rounded-xl p-4 border border-border"
                style={{ 
                  textAlign: theme.textAlign,
                  fontFamily: theme.fontFamily === "Inter" ? "var(--font-sans)" : theme.fontFamily 
                }}
              >
                <div className="text-center space-y-3">
                  <img 
                    src={profile?.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"} 
                    alt="Theme preview avatar" 
                    className={`w-16 h-16 mx-auto object-cover border-2 border-card shadow-md ${getAvatarStyle()}`}
                    data-testid="img-preview-avatar"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{profile?.displayName || "Your Name"}</h4>
                    <p className="text-sm text-muted-foreground">{profile?.title || "Your Title"}</p>
                  </div>
                  <Button 
                    size="sm"
                    className={`w-full text-sm font-medium ${getButtonStyle()}`}
                    style={{ backgroundColor: theme.primaryColor }}
                    data-testid="button-preview-cta"
                  >
                    Exchange Contact
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="w-4 h-4 mx-auto" style={{ color: "#0077b5" }}>💼</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="w-4 h-4 mx-auto" style={{ color: "#25d366" }}>💬</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* QR Code Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>QR Code</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-muted rounded-xl flex items-center justify-center mb-4">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={handleGenerateQR}
                  disabled={!profile?.username}
                  data-testid="button-download-qr"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* NFC Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Nfc className="h-5 w-5" />
                <span>NFC Card</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                data-testid="button-write-nfc"
              >
                <Nfc className="mr-2 h-4 w-4" />
                Write to Card
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                data-testid="button-read-nfc"
              >
                <Search className="mr-2 h-4 w-4" />
                Read Card
              </Button>
              
              {/* NFC Status */}
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-700">NFC Ready</span>
                </div>
                <p className="text-xs text-teal-600 mt-1">Your profile is configured for NFC sharing</p>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>Wallet Pass</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Apple Wallet Style Preview */}
              <div 
                className="rounded-xl p-4 text-white mb-4"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium opacity-90">BUSINESS CARD</div>
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold">{profile?.displayName || "Your Name"}</h4>
                  <p className="text-sm opacity-90">{profile?.title || "Your Title"}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/20">
                  <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                    <QrCode className="h-8 w-8" />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  data-testid="button-apple-wallet"
                >
                  <Apple className="mr-1 h-4 w-4" />
                  Apple
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  data-testid="button-google-wallet"
                >
                  <SiGoogle className="mr-1 h-4 w-4" />
                  Google
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

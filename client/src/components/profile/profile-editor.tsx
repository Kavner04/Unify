import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LivePreview from "./live-preview";
import { 
  Save, 
  Camera, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Linkedin,
  Instagram,
  MessageCircle,
  Globe
} from "lucide-react";

const profileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_.]+$/, "Username can only contain lowercase letters, numbers, dots, and underscores"),
  displayName: z.string().min(1).max(100),
  title: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

const linkSchema = z.object({
  title: z.string().min(1).max(100),
  url: z.string().url(),
  description: z.string().max(200).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type LinkForm = z.infer<typeof linkSchema>;

export default function ProfileEditor() {
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: ["/api/links"],
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      displayName: "",
      title: "",
      email: "",
      phone: "",
      address: "",
      bio: "",
      website: "",
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || "",
        displayName: profile.displayName || "",
        title: profile.title || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        bio: profile.bio || "",
        website: profile.website || "",
      });
    }
  }, [profile, form]);

  const profileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const method = profile ? "PUT" : "POST";
      return await apiRequest(method, "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Perfil salvo",
        description: "Seu perfil foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const linkMutation = useMutation({
    mutationFn: async (data: LinkForm) => {
      return await apiRequest("POST", "/api/links", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link adicionado",
        description: "Seu link foi adicionado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return await apiRequest("DELETE", `/api/links/${linkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link excluído",
        description: "Link foi removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) return;
    
    setIsCheckingUsername(true);
    try {
      const response = await fetch(`/api/profile/check-username/${username}`, {
        credentials: "include",
      });
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      setUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (username: string) => {
    form.setValue("username", username);
    if (username !== profile?.username) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const onSubmit = (data: ProfileForm) => {
    profileMutation.mutate(data);
  };

  const [newLink, setNewLink] = useState<LinkForm>({ title: "", url: "", description: "" });

  const handleAddLink = () => {
    try {
      linkSchema.parse(newLink);
      linkMutation.mutate(newLink);
      setNewLink({ title: "", url: "", description: "" });
    } catch (error) {
      toast({
        title: "Dados do link inválidos",
        description: "Verifique as informações do link e tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="p-8" data-testid="loading-profile-editor">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="h-96 bg-muted animate-pulse rounded-xl"></div>
            <div className="h-64 bg-muted animate-pulse rounded-xl"></div>
          </div>
          <div className="h-96 bg-muted animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="profile-editor">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" data-testid="tab-profile">Perfil</TabsTrigger>
              <TabsTrigger value="links" data-testid="tab-links">Links</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Editar Seu Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Username */}
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome de Usuário</FormLabel>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                unify.cc/@
                              </span>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="nomedeusuario"
                                  className="rounded-l-none"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleUsernameChange(e.target.value);
                                  }}
                                  data-testid="input-username"
                                />
                              </FormControl>
                            </div>
                            {isCheckingUsername && (
                              <p className="text-xs text-muted-foreground">Verificando disponibilidade...</p>
                            )}
                            {usernameAvailable === true && (
                              <p className="text-xs text-green-600 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Disponível
                              </p>
                            )}
                            {usernameAvailable === false && (
                              <p className="text-xs text-destructive flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Nome de usuário indisponível
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome de Exibição</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome Completo" {...field} data-testid="input-display-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título/Posição</FormLabel>
                              <FormControl>
                                <Input placeholder="Seu cargo" {...field} data-testid="input-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="seu@email.com" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="+55 (11) 99999-9999" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Biografia</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Conte às pessoas sobre você..." 
                                className="resize-none" 
                                rows={3}
                                {...field}
                                data-testid="textarea-bio"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site</FormLabel>
                            <FormControl>
                              <Input placeholder="https://seusite.com" {...field} data-testid="input-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={profileMutation.isPending}
                        data-testid="button-save-profile"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {profileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Links Personalizados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing Links */}
                  {linksLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
                      ))}
                    </div>
                  ) : links && links.length > 0 ? (
                    <div className="space-y-3">
                      {links.map((link: any, index: number) => (
                        <div 
                          key={link.id} 
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                          data-testid={`link-item-${index}`}
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{link.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(link.url, '_blank')}
                              data-testid={`button-preview-link-${index}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteLinkMutation.mutate(link.id)}
                              disabled={deleteLinkMutation.isPending}
                              data-testid={`button-delete-link-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhum link adicionado ainda. Adicione seu primeiro link abaixo!</p>
                    </div>
                  )}

                  <Separator />

                  {/* Add New Link */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Adicionar Novo Link</h4>
                    <div className="space-y-3">
                      <Input
                        placeholder="Título do link"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                        data-testid="input-new-link-title"
                      />
                      <Input
                        placeholder="https://exemplo.com"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        data-testid="input-new-link-url"
                      />
                      <Input
                        placeholder="Descrição (opcional)"
                        value={newLink.description}
                        onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                        data-testid="input-new-link-description"
                      />
                      <Button
                        onClick={handleAddLink}
                        disabled={!newLink.title || !newLink.url || linkMutation.isPending}
                        className="w-full"
                        data-testid="button-add-link"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {linkMutation.isPending ? "Adicionando..." : "Adicionar Link"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:sticky lg:top-8">
          <LivePreview profile={profile} links={links} />
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Play, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Webhook
} from "lucide-react";

const webhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.string()).min(1, "Select at least one event"),
});

type WebhookForm = z.infer<typeof webhookSchema>;

const availableEvents = [
  { id: "profile_view", label: "Perfil Visualizado", description: "Quando alguém visita seu perfil" },
  { id: "link_click", label: "Link Clicado", description: "Quando alguém clica em seus links" },
  { id: "nfc_scan", label: "NFC Escaneado", description: "Quando alguém escaneia seu cartão NFC" },
  { id: "wallet_add", label: "Adicionado à Carteira", description: "Quando alguém adiciona você à carteira" },
  { id: "contact_save", label: "Contato Salvo", description: "Quando alguém salva seu contato" },
];

export default function WebhookManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: webhooks, isLoading: webhooksLoading } = useQuery({
    queryKey: ["/api/webhooks"],
  });

  const form = useForm<WebhookForm>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: "",
      url: "",
      events: [],
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (data: WebhookForm) => {
      return await apiRequest("POST", "/api/webhooks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Webhook criado",
        description: "Seu webhook foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WebhookForm> }) => {
      return await apiRequest("PUT", `/api/webhooks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setEditingWebhook(null);
      toast({
        title: "Webhook updated",
        description: "Your webhook has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({
        title: "Webhook deleted",
        description: "Webhook has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/webhooks/${id}/test`);
    },
    onSuccess: () => {
      toast({
        title: "Test webhook sent",
        description: "A test event has been sent to your webhook endpoint.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WebhookForm) => {
    if (editingWebhook) {
      updateWebhookMutation.mutate({ id: editingWebhook.id, data });
    } else {
      createWebhookMutation.mutate(data);
    }
  };

  const handleEdit = (webhook: any) => {
    setEditingWebhook(webhook);
    form.reset({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
    });
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingWebhook(null);
    form.reset();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (webhooksLoading) {
    return (
      <div className="p-8" data-testid="loading-webhook-manager">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8" data-testid="webhook-manager">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Webhook Configuration</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-webhook">
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingWebhook ? "Edit Webhook" : "Add New Webhook"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook Name</FormLabel>
                      <FormControl>
                        <Input placeholder="CRM Integration" {...field} data-testid="input-webhook-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endpoint URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://api.yourservice.com/webhooks/unify" 
                          {...field} 
                          data-testid="input-webhook-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="events"
                  render={() => (
                    <FormItem>
                      <FormLabel>Events to Subscribe</FormLabel>
                      <div className="space-y-3">
                        {availableEvents.map((event) => (
                          <FormField
                            key={event.id}
                            control={form.control}
                            name="events"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(event.id)}
                                    onCheckedChange={(checked) => {
                                      const updatedEvents = checked
                                        ? [...(field.value || []), event.id]
                                        : field.value?.filter((value) => value !== event.id) || [];
                                      field.onChange(updatedEvents);
                                    }}
                                    data-testid={`checkbox-event-${event.id}`}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    {event.label}
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground">
                                    {event.description}
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseDialog}
                    data-testid="button-cancel-webhook"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createWebhookMutation.isPending || updateWebhookMutation.isPending}
                    data-testid="button-save-webhook"
                  >
                    {(createWebhookMutation.isPending || updateWebhookMutation.isPending) 
                      ? "Saving..." 
                      : editingWebhook ? "Update" : "Create"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhook List */}
      <div className="grid gap-6">
        {webhooks && webhooks.length > 0 ? (
          webhooks.map((webhook: any, index: number) => (
            <Card key={webhook.id} data-testid={`webhook-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="font-semibold text-foreground">{webhook.name}</h3>
                    {!webhook.enabled && (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testWebhookMutation.mutate(webhook.id)}
                      disabled={testWebhookMutation.isPending}
                      data-testid={`button-test-webhook-${index}`}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(webhook)}
                      data-testid={`button-edit-webhook-${index}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                      disabled={deleteWebhookMutation.isPending}
                      data-testid={`button-delete-webhook-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Endpoint URL</p>
                    <p className="text-sm font-mono bg-muted px-3 py-2 rounded-lg break-all">
                      {webhook.url}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Events</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {webhook.events.map((event: string) => {
                          const eventInfo = availableEvents.find(e => e.id === event);
                          return (
                            <Badge 
                              key={event} 
                              variant="outline" 
                              className="text-xs"
                              data-testid={`event-badge-${event}`}
                            >
                              {eventInfo?.label || event}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Last delivery</p>
                      <p className="text-sm text-foreground font-medium">
                        {/* This would come from webhook delivery data */}
                        2 mins ago
                      </p>
                    </div>
                  </div>
                  
                  {/* Recent Deliveries */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-2">Recent Deliveries</p>
                    <div className="space-y-2">
                      {/* Mock delivery data - in real app, this would come from API */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon("success")}
                          <span className="text-muted-foreground">profile_view</span>
                        </div>
                        <span className="text-muted-foreground">200ms</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon("failed")}
                          <span className="text-muted-foreground">link_click</span>
                        </div>
                        <span className="text-muted-foreground">timeout</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon("success")}
                          <span className="text-muted-foreground">nfc_scan</span>
                        </div>
                        <span className="text-muted-foreground">150ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No webhooks configured</h3>
              <p className="text-muted-foreground mb-4">
                Add your first webhook to receive real-time notifications about profile interactions.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-webhook">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Webhook
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Available Events Info */}
      <Card>
        <CardHeader>
          <CardTitle>Available Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {availableEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">{event.label}</p>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

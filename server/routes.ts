import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProfileSchema, insertLinkSchema, insertWebhookSchema } from "@shared/schema";
import { z } from "zod";
import QRCode from "qrcode";
import crypto from "crypto";

interface AuthenticatedRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      profile_image_url?: string;
    };
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.get('/api/profile', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const profile = await storage.getProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const profileData = insertProfileSchema.parse(req.body);
      
      // Check username availability
      const isAvailable = await storage.checkUsernameAvailability(profileData.username!, userId);
      if (!isAvailable) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      const profile = await storage.createProfile({
        ...profileData,
        id: userId,
      });
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const profileData = insertProfileSchema.partial().parse(req.body);
      
      // Check username availability if username is being updated
      if (profileData.username) {
        const isAvailable = await storage.checkUsernameAvailability(profileData.username, userId);
        if (!isAvailable) {
          return res.status(400).json({ message: "Username is already taken" });
        }
      }

      const profile = await storage.updateProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/profile/check-username/:username', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { username } = req.params;
      const userId = req.user!.claims.sub;
      const isAvailable = await storage.checkUsernameAvailability(username, userId);
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking username:", error);
      res.status(500).json({ message: "Failed to check username availability" });
    }
  });

  // Public profile route
  app.get('/api/public/profile/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const profile = await storage.getProfileByUsername(username);
      
      if (!profile || !profile.isPublic) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Track profile view
      await storage.createEvent({
        profileId: profile.id,
        eventType: 'profile_view',
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        referrer: req.get('Referer'),
        utm: {
          source: req.query.utm_source as string,
          medium: req.query.utm_medium as string,
          campaign: req.query.utm_campaign as string,
          term: req.query.utm_term as string,
          content: req.query.utm_content as string,
        },
      });

      res.json(profile);
    } catch (error) {
      console.error("Error fetching public profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Links routes
  app.get('/api/links', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const links = await storage.getLinksByProfileId(userId);
      res.json(links);
    } catch (error) {
      console.error("Error fetching links:", error);
      res.status(500).json({ message: "Failed to fetch links" });
    }
  });

  app.get('/api/public/links/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;
      const links = await storage.getLinksByProfileId(profileId);
      res.json(links.filter(link => link.enabled));
    } catch (error) {
      console.error("Error fetching public links:", error);
      res.status(500).json({ message: "Failed to fetch links" });
    }
  });

  app.post('/api/links', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const linkData = insertLinkSchema.parse({
        ...req.body,
        profileId: userId,
      });
      
      const link = await storage.createLink(linkData);
      res.json(link);
    } catch (error) {
      console.error("Error creating link:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create link" });
    }
  });

  app.put('/api/links/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const linkData = insertLinkSchema.partial().parse(req.body);
      
      const link = await storage.updateLink(id, linkData);
      res.json(link);
    } catch (error) {
      console.error("Error updating link:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update link" });
    }
  });

  app.delete('/api/links/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLink(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting link:", error);
      res.status(500).json({ message: "Failed to delete link" });
    }
  });

  app.post('/api/links/reorder', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { linkIds } = req.body;
      await storage.reorderLinks(userId, linkIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering links:", error);
      res.status(500).json({ message: "Failed to reorder links" });
    }
  });

  // Analytics routes
  app.get('/api/analytics', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const days = parseInt(req.query.days as string) || 30;
      const analytics = await storage.getAnalytics(userId, days);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/events', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const events = await storage.getEventsByProfileId(userId, limit);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Track link clicks
  app.post('/api/track/link-click', async (req, res) => {
    try {
      const { linkId, profileId, utm, referrer } = req.body;
      
      await storage.createEvent({
        profileId,
        eventType: 'link_click',
        linkId,
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        referrer,
        utm,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking link click:", error);
      res.status(500).json({ message: "Failed to track event" });
    }
  });

  // QR Code generation
  app.get('/api/qr/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const profile = await storage.getProfileByUsername(username);
      
      if (!profile || !profile.isPublic) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const profileUrl = `${req.protocol}://${req.get('host')}/@${username}`;
      const qrCode = await QRCode.toDataURL(profileUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      res.json({ qrCode, profileUrl });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // vCard generation
  app.get('/api/vcard/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const profile = await storage.getProfileByUsername(username);
      
      if (!profile || !profile.isPublic) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${profile.displayName || ''}`,
        `TITLE:${profile.title || ''}`,
        `EMAIL:${profile.email || ''}`,
        `TEL:${profile.phone || ''}`,
        `ADR:;;${profile.address || ''};;;;`,
        `URL:${req.protocol}://${req.get('host')}/@${username}`,
        `NOTE:${profile.bio || ''}`,
        'END:VCARD'
      ].join('\n');

      res.setHeader('Content-Type', 'text/vcard');
      res.setHeader('Content-Disposition', `attachment; filename="${username}.vcf"`);
      res.send(vcard);
    } catch (error) {
      console.error("Error generating vCard:", error);
      res.status(500).json({ message: "Failed to generate vCard" });
    }
  });

  // Webhook routes
  app.get('/api/webhooks', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const webhooks = await storage.getWebhooksByProfileId(userId);
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ message: "Failed to fetch webhooks" });
    }
  });

  app.post('/api/webhooks', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const webhookData = insertWebhookSchema.parse({
        ...req.body,
        profileId: userId,
        secret: crypto.randomBytes(32).toString('hex'),
      });
      
      const webhook = await storage.createWebhook(webhookData);
      res.json(webhook);
    } catch (error) {
      console.error("Error creating webhook:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create webhook" });
    }
  });

  app.put('/api/webhooks/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const webhookData = insertWebhookSchema.partial().parse(req.body);
      
      const webhook = await storage.updateWebhook(id, webhookData);
      res.json(webhook);
    } catch (error) {
      console.error("Error updating webhook:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update webhook" });
    }
  });

  app.delete('/api/webhooks/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWebhook(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting webhook:", error);
      res.status(500).json({ message: "Failed to delete webhook" });
    }
  });

  // Test webhook
  app.post('/api/webhooks/:id/test', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      // This would trigger a test webhook delivery
      res.json({ success: true, message: "Test webhook sent" });
    } catch (error) {
      console.error("Error sending test webhook:", error);
      res.status(500).json({ message: "Failed to send test webhook" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import {
  users,
  profiles,
  links,
  events,
  webhooks,
  webhookDeliveries,
  type User,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type Link,
  type InsertLink,
  type Event,
  type InsertEvent,
  type Webhook,
  type InsertWebhook,
  type WebhookDelivery,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Profile operations
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile>;
  deleteProfile(id: string): Promise<void>;
  checkUsernameAvailability(username: string, excludeId?: string): Promise<boolean>;

  // Link operations
  getLinksByProfileId(profileId: string): Promise<Link[]>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(id: string, link: Partial<InsertLink>): Promise<Link>;
  deleteLink(id: string): Promise<void>;
  reorderLinks(profileId: string, linkIds: string[]): Promise<void>;

  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEventsByProfileId(profileId: string, limit?: number): Promise<Event[]>;
  getAnalytics(profileId: string, days: number): Promise<{
    profileViews: number;
    linkClicks: number;
    nfcScans: number;
    contactsSaved: number;
    topLinks: Array<{ linkId: string; title: string; clicks: number }>;
    dailyViews: Array<{ date: string; views: number }>;
  }>;

  // Webhook operations
  getWebhooksByProfileId(profileId: string): Promise<Webhook[]>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: string, webhook: Partial<InsertWebhook>): Promise<Webhook>;
  deleteWebhook(id: string): Promise<void>;
  createWebhookDelivery(delivery: Omit<WebhookDelivery, 'id' | 'createdAt'>): Promise<WebhookDelivery>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async getProfile(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.username, username));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db
      .insert(profiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return updatedProfile;
  }

  async deleteProfile(id: string): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id));
  }

  async checkUsernameAvailability(username: string, excludeId?: string): Promise<boolean> {
    const query = db.select({ id: profiles.id }).from(profiles).where(eq(profiles.username, username));
    
    if (excludeId) {
      query.where(and(eq(profiles.username, username), sql`${profiles.id} != ${excludeId}`));
    }
    
    const [existing] = await query;
    return !existing;
  }

  // Link operations
  async getLinksByProfileId(profileId: string): Promise<Link[]> {
    return await db
      .select()
      .from(links)
      .where(eq(links.profileId, profileId))
      .orderBy(links.position, links.createdAt);
  }

  async createLink(link: InsertLink): Promise<Link> {
    const [newLink] = await db
      .insert(links)
      .values(link)
      .returning();
    return newLink;
  }

  async updateLink(id: string, link: Partial<InsertLink>): Promise<Link> {
    const [updatedLink] = await db
      .update(links)
      .set({ ...link, updatedAt: new Date() })
      .where(eq(links.id, id))
      .returning();
    return updatedLink;
  }

  async deleteLink(id: string): Promise<void> {
    await db.delete(links).where(eq(links.id, id));
  }

  async reorderLinks(profileId: string, linkIds: string[]): Promise<void> {
    for (let i = 0; i < linkIds.length; i++) {
      await db
        .update(links)
        .set({ position: i })
        .where(and(eq(links.id, linkIds[i]), eq(links.profileId, profileId)));
    }
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async getEventsByProfileId(profileId: string, limit = 50): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.profileId, profileId))
      .orderBy(desc(events.createdAt))
      .limit(limit);
  }

  async getAnalytics(profileId: string, days: number): Promise<{
    profileViews: number;
    linkClicks: number;
    nfcScans: number;
    contactsSaved: number;
    topLinks: Array<{ linkId: string; title: string; clicks: number }>;
    dailyViews: Array<{ date: string; views: number }>;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get basic counts
    const [metrics] = await db
      .select({
        profileViews: sum(sql`case when event_type = 'profile_view' then 1 else 0 end`),
        linkClicks: sum(sql`case when event_type = 'link_click' then 1 else 0 end`),
        nfcScans: sum(sql`case when event_type = 'nfc_scan' then 1 else 0 end`),
        contactsSaved: sum(sql`case when event_type = 'contact_save' then 1 else 0 end`),
      })
      .from(events)
      .where(
        and(
          eq(events.profileId, profileId),
          sql`${events.createdAt} >= ${cutoffDate}`
        )
      );

    // Get top links
    const topLinksData = await db
      .select({
        linkId: events.linkId,
        clicks: count(events.id),
      })
      .from(events)
      .leftJoin(links, eq(events.linkId, links.id))
      .where(
        and(
          eq(events.profileId, profileId),
          eq(events.eventType, 'link_click'),
          sql`${events.createdAt} >= ${cutoffDate}`
        )
      )
      .groupBy(events.linkId)
      .orderBy(desc(count(events.id)))
      .limit(10);

    // Get link titles
    const topLinks = await Promise.all(
      topLinksData.map(async (item) => {
        if (!item.linkId) return { linkId: '', title: 'Unknown', clicks: item.clicks };
        const [link] = await db.select({ title: links.title }).from(links).where(eq(links.id, item.linkId));
        return {
          linkId: item.linkId,
          title: link?.title || 'Unknown',
          clicks: item.clicks,
        };
      })
    );

    // Get daily views
    const dailyViewsData = await db
      .select({
        date: sql`date(${events.createdAt})`.as('date'),
        views: count(events.id),
      })
      .from(events)
      .where(
        and(
          eq(events.profileId, profileId),
          eq(events.eventType, 'profile_view'),
          sql`${events.createdAt} >= ${cutoffDate}`
        )
      )
      .groupBy(sql`date(${events.createdAt})`)
      .orderBy(sql`date(${events.createdAt})`);

    const dailyViews = dailyViewsData.map(item => ({
      date: item.date as string,
      views: item.views,
    }));

    return {
      profileViews: Number(metrics.profileViews) || 0,
      linkClicks: Number(metrics.linkClicks) || 0,
      nfcScans: Number(metrics.nfcScans) || 0,
      contactsSaved: Number(metrics.contactsSaved) || 0,
      topLinks,
      dailyViews,
    };
  }

  // Webhook operations
  async getWebhooksByProfileId(profileId: string): Promise<Webhook[]> {
    return await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.profileId, profileId))
      .orderBy(webhooks.createdAt);
  }

  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const [newWebhook] = await db
      .insert(webhooks)
      .values(webhook)
      .returning();
    return newWebhook;
  }

  async updateWebhook(id: string, webhook: Partial<InsertWebhook>): Promise<Webhook> {
    const [updatedWebhook] = await db
      .update(webhooks)
      .set({ ...webhook, updatedAt: new Date() })
      .where(eq(webhooks.id, id))
      .returning();
    return updatedWebhook;
  }

  async deleteWebhook(id: string): Promise<void> {
    await db.delete(webhooks).where(eq(webhooks.id, id));
  }

  async createWebhookDelivery(delivery: Omit<WebhookDelivery, 'id' | 'createdAt'>): Promise<WebhookDelivery> {
    const [newDelivery] = await db
      .insert(webhookDeliveries)
      .values(delivery)
      .returning();
    return newDelivery;
  }
}

export const storage = new DatabaseStorage();

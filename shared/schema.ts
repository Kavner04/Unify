import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  bigserial,
  uuid,
  inet,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profiles table for business card data
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 30 }).unique().notNull(),
  displayName: varchar("display_name"),
  title: varchar("title"),
  bio: text("bio"),
  photoUrl: varchar("photo_url"),
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  website: varchar("website"),
  theme: jsonb("theme").$type<{
    primaryColor?: string;
    secondaryColor?: string;
    backgroundType?: 'solid' | 'gradient' | 'image';
    backgroundValue?: string;
    fontFamily?: string;
    avatarStyle?: 'circle' | 'square' | 'rounded-square';
    buttonStyle?: 'rounded' | 'sharp' | 'pill';
    textAlign?: 'left' | 'center' | 'right';
  }>().default({}),
  socials: jsonb("socials").$type<{
    linkedin?: string;
    instagram?: string;
    whatsapp?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
    github?: string;
    website1?: string;
    website2?: string;
  }>().default({}),
  seo: jsonb("seo").$type<{
    title?: string;
    description?: string;
  }>().default({}),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom links for link-in-bio functionality
export const links = pgTable("links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title").notNull(),
  url: varchar("url").notNull(),
  description: text("description"),
  position: integer("position").default(0),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events for analytics tracking
export const events = pgTable("events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  profileId: varchar("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  eventType: varchar("event_type").notNull(), // 'profile_view', 'link_click', 'nfc_scan', 'wallet_add', 'contact_save'
  linkId: varchar("link_id").references(() => links.id),
  utm: jsonb("utm").$type<{
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  }>(),
  referrer: varchar("referrer"),
  ip: inet("ip"),
  userAgent: varchar("user_agent"),
  country: varchar("country"),
  device: varchar("device"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Webhooks configuration
export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name").notNull(),
  url: varchar("url").notNull(),
  secret: varchar("secret").notNull(),
  events: varchar("events").array().notNull().default([]),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhook deliveries for tracking
export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  webhookId: varchar("webhook_id").references(() => webhooks.id, { onDelete: "cascade" }).notNull(),
  eventId: integer("event_id").references(() => events.id),
  status: integer("status"),
  attempt: integer("attempt").default(1),
  responseMs: integer("response_ms"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
  links: many(links),
  events: many(events),
  webhooks: many(webhooks),
}));

export const linksRelations = relations(links, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [links.profileId],
    references: [profiles.id],
  }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  profile: one(profiles, {
    fields: [events.profileId],
    references: [profiles.id],
  }),
  link: one(links, {
    fields: [events.linkId],
    references: [links.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [webhooks.profileId],
    references: [profiles.id],
  }),
  deliveries: many(webhookDeliveries),
}));

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookDeliveries.webhookId],
    references: [webhooks.id],
  }),
  event: one(events, {
    fields: [webhookDeliveries.eventId],
    references: [events.id],
  }),
}));

// Insert schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLinkSchema = createInsertSchema(links).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Link = typeof links.$inferSelect;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;

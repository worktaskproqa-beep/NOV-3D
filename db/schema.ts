import { integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  category: varchar("category", { length: 40 }).notNull(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionAr: text("description_ar").notNull(),
  materialEn: text("material_en").notNull(),
  materialAr: text("material_ar").notNull(),
  price: integer("price").notNull(),
  art: varchar("art", { length: 40 }).notNull(),
  colors: jsonb("colors").$type<{ hex: string; en: string; ar: string }[]>().notNull(),
  sizes: jsonb("sizes").$type<string[]>().notNull(),
  featured: integer("featured").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 20 }).notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  notes: text("notes"),
  items: jsonb("items")
    .$type<{ slug: string; name: string; size: string; color: string; qty: number; price: number }[]>()
    .notNull(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
  locale: varchar("locale", { length: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  locale: varchar("locale", { length: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;

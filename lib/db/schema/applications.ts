import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const applications = pgTable("applications", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret").notNull(),
  redirectUris: text("redirect_uris").array().notNull().default([]),
  scopes: text("scopes").array().notNull().default(["read"]),
  isActive: boolean("is_active").notNull().default(true),
  requestCount: integer("request_count").notNull().default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

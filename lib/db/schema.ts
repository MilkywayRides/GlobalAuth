import { pgTable, text, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  lastLoginMethod: text("lastLoginMethod"),
  // Admin plugin fields
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id),
  // Admin plugin field
  impersonatedBy: text("impersonatedBy"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

// API Keys for developer access
export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  permissions: json("permissions").$type<string[]>().default(['read']),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsed: timestamp("last_used"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
});

// API Usage tracking
export const apiUsage = pgTable("api_usage", {
  id: text("id").primaryKey(),
  keyId: text("key_id").notNull().references(() => apiKeys.id),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time"), // in milliseconds
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Developer Applications (OAuth Apps)
export const applications = pgTable("applications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  description: text("description"),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret").notNull(),
  redirectUris: json("redirect_uris").$type<string[]>().default([]),
  homepageUrl: text("homepage_url"),
  appType: text("app_type").notNull().default("web"), // "web", "native", "spa"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// OAuth Authorization Codes
export const oauthCodes = pgTable("oauth_codes", {
  code: text("code").primaryKey(),
  clientId: text("client_id").notNull().references(() => applications.clientId),
  userId: text("user_id").notNull().references(() => user.id),
  redirectUri: text("redirect_uri").notNull(),
  scope: text("scope"),
  expiresAt: timestamp("expires_at").notNull(),
  codeChallenge: text("code_challenge"),
  codeChallengeMethod: text("code_challenge_method"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// OAuth Access Tokens
export const oauthTokens = pgTable("oauth_tokens", {
  accessToken: text("access_token").primaryKey(),
  refreshToken: text("refresh_token"),
  clientId: text("client_id").notNull().references(() => applications.clientId),
  userId: text("user_id").notNull().references(() => user.id),
  scope: text("scope"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Consents for OAuth Applications
export const userConsents = pgTable("user_consents", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  applicationId: text("application_id").notNull().references(() => applications.id),
  scope: text("scope"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// System Analytics
export const systemMetrics = pgTable("system_metrics", {
  id: text("id").primaryKey(),
  metricName: text("metric_name").notNull(),
  metricValue: integer("metric_value").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: json("metadata"),
});

// User Activity Logs
export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  action: text("action").notNull(),
  resource: text("resource"),
  resourceId: text("resource_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: json("metadata"),
});

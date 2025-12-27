import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, index, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Plant rarity and season types
export const PLANT_RARITIES = ['common', 'uncommon', 'rare', 'exotic'] as const;
export type PlantRarity = typeof PLANT_RARITIES[number];

export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;
export type Season = typeof SEASONS[number];

// Rarity pricing multipliers
export const RARITY_MULTIPLIERS: Record<PlantRarity, number> = {
  common: 1.0,
  uncommon: 1.5,
  rare: 2.5,
  exotic: 4.0,
};

// Seasonal pricing adjustments (1.0 = in-season, higher = off-season premium)
export const SEASONAL_ADJUSTMENTS: Record<Season, Record<Season, number>> = {
  spring: { spring: 1.0, summer: 1.1, fall: 1.3, winter: 1.5 },
  summer: { spring: 1.1, summer: 1.0, fall: 1.2, winter: 1.4 },
  fall: { spring: 1.3, summer: 1.2, fall: 1.0, winter: 1.2 },
  winter: { spring: 1.4, summer: 1.5, fall: 1.2, winter: 1.0 },
};

// Subscription tier types
export const SUBSCRIPTION_TIERS = ['free', 'basic', 'pro', 'enterprise'] as const;
export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number];

// Tier limits configuration
// Free tier = 7-day trial with 9 photos (3 analyses) and 3 properties
export const TIER_LIMITS = {
  free: { photosPerMonth: 9, maxProperties: 3, highResImages: false, pdfExport: false, advancedRoi: false, trialDays: 7 },
  basic: { photosPerMonth: 10, maxProperties: 1, highResImages: false, pdfExport: false, advancedRoi: false, trialDays: 0 },
  pro: { photosPerMonth: 50, maxProperties: 10, highResImages: true, pdfExport: true, advancedRoi: true, trialDays: 0 },
  enterprise: { photosPerMonth: Infinity, maxProperties: Infinity, highResImages: true, pdfExport: true, advancedRoi: true, trialDays: 0 },
} as const;

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isSubscribed: boolean("is_subscribed").default(false).notNull(),
  subscriptionTier: varchar("subscription_tier").default('free').notNull().$type<SubscriptionTier>(),
  isDeveloper: boolean("is_developer").default(false).notNull(),
  photoUploadsThisPeriod: integer("photo_uploads_this_period").default(0).notNull(),
  photoUploadsResetAt: timestamp("photo_uploads_reset_at").defaultNow(),
  currentPeriodEnd: timestamp("current_period_end"),
  trialEndsAt: timestamp("trial_ends_at"),
  propertiesCount: integer("properties_count").default(0).notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripePriceId: varchar("stripe_price_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Yard analysis table
export const yardAnalyses = pgTable("yard_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  imageUrl: text("image_url").notNull(),
  zipCode: varchar("zip_code", { length: 10 }),
  analysis: jsonb("analysis").notNull().$type<YardAnalysisData>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type YardAnalysisData = {
  conditionAssessment: Array<{
    component: string;
    conditionScore: number;
    issues: string[];
    confidence: number;
  }>;
  repairs: Array<{
    component: string;
    recommendation: string;
    materials: Array<{ name: string; quantity: string; costRange: string }>;
    diySteps: string[];
    proRecommended: boolean;
    costRange: { low: number; high: number };
  }>;
  roi: {
    currentValue: number;
    projectedValue: number;
    rentUplift: number;
    roiPercentage: number;
    paybackPeriodMonths: number;
  };
  costBreakdown: Array<{ component: string; low: number; high: number }>;
  totalCost: { low: number; high: number };
  estimatedTime: string;
  beforeImage: string;
  afterImage: string;
};

export const insertYardAnalysisSchema = createInsertSchema(yardAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertYardAnalysis = z.infer<typeof insertYardAnalysisSchema>;
export type YardAnalysis = typeof yardAnalyses.$inferSelect;

// Plantopedia table
export const plants = pgTable("plants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  scientificName: varchar("scientific_name", { length: 255 }),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  category: varchar("category", { length: 100 }).notNull(),
  rarity: varchar("rarity", { length: 20 }).notNull().$type<PlantRarity>(),
  peakSeason: varchar("peak_season", { length: 20 }).notNull().$type<Season>(),
  availableSeasons: text("available_seasons").array().notNull().$type<Season[]>(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  careLevel: varchar("care_level", { length: 20 }).notNull(),
  sunRequirement: varchar("sun_requirement", { length: 50 }).notNull(),
  waterRequirement: varchar("water_requirement", { length: 50 }).notNull(),
  growthRate: varchar("growth_rate", { length: 20 }),
  matureHeight: varchar("mature_height", { length: 50 }),
  isNative: boolean("is_native").default(false),
  attractsPollinators: boolean("attracts_pollinators").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlantSchema = createInsertSchema(plants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plants.$inferSelect;

// Helper function to calculate dynamic price
export function calculateDynamicPrice(
  basePrice: number,
  rarity: PlantRarity,
  peakSeason: Season,
  currentSeason: Season
): { price: number; rarityMultiplier: number; seasonalAdjustment: number } {
  const rarityMultiplier = RARITY_MULTIPLIERS[rarity];
  const seasonalAdjustment = SEASONAL_ADJUSTMENTS[peakSeason][currentSeason];
  const price = Math.round(basePrice * rarityMultiplier * seasonalAdjustment * 100) / 100;
  
  return { price, rarityMultiplier, seasonalAdjustment };
}

// Helper function to get current season
export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

import { pgTable, uuid, varchar, text, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const currencyEnum = pgEnum('currency', ['USD', 'EUR', 'GBP']);
export const frequencyEnum = pgEnum('frequency', ['daily', 'weekly', 'monthly', 'yearly']);
export const categoryEnum = pgEnum('category', ['sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'politics', 'other']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'cancelled', 'expired']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: currencyEnum('currency').default('USD').notNull(),
  frequency: frequencyEnum('frequency').notNull(),
  category: categoryEnum('category').notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }).notNull(),
  status: subscriptionStatusEnum('status').default('active').notNull(),
  startDate: timestamp('start_date').notNull(),
  renewalDate: timestamp('renewal_date'),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;




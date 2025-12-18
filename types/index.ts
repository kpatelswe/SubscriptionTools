import { Request } from 'express';
import { User, Subscription } from '../database/schema.js';

// Re-export database types
export type { User, NewUser, Subscription, NewSubscription } from '../database/schema.js';

// Subscription enums
export type Currency = 'USD' | 'EUR' | 'GBP';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type Category = 'sports' | 'news' | 'entertainment' | 'lifestyle' | 'technology' | 'finance' | 'politics' | 'other';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

// Extended Request with user
export interface AuthRequest extends Request {
  user?: User;
}

// Error with status code
export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: number;
  errors?: Record<string, { message: string }>;
}

// Email template data
export interface EmailTemplateData {
  userName: string;
  subscriptionName: string;
  renewalDate: string;
  planName: string;
  price: string;
  paymentMethod: string;
  accountSettingsLink?: string;
  supportLink?: string;
  daysLeft?: number;
}

// Email template
export interface EmailTemplate {
  label: string;
  generateSubject: (data: EmailTemplateData) => string;
  generateBody: (data: EmailTemplateData) => string;
}

// Subscription with user populated
export interface SubscriptionWithUser extends Subscription {
  user: User;
}

// Send email params
export interface SendReminderEmailParams {
  to: string;
  type: string;
  subscription: SubscriptionWithUser;
}

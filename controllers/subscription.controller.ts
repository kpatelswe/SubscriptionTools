import { Response, NextFunction } from 'express';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db, subscriptions, users, type Subscription, type NewSubscription } from '../database/index.js';
import { workflowClient } from '../config/upstash.js';
import { SERVER_URL } from '../config/env.js';
import { sendReminderEmail } from '../utils/send-email.js';
import { AuthRequest, AppError, Frequency, SubscriptionWithUser } from '../types/index.js';

// Calculate renewal date based on frequency
const calculateRenewalDate = (startDate: Date, frequency: Frequency): Date => {
  const renewalPeriods: Record<Frequency, number> = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    yearly: 365,
  };

  const renewalDate = new Date(startDate);
  renewalDate.setDate(renewalDate.getDate() + renewalPeriods[frequency]);
  return renewalDate;
};

// GET all subscriptions for current user
export const getAllSubscriptions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userSubscriptions = await db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, req.user!.id),
      orderBy: [desc(subscriptions.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({ success: true, data: userSubscriptions });
  } catch (e) {
    next(e);
  }
};

// GET subscription by ID
export const getSubscriptionById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, req.params.id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!subscription) {
      const error = new Error('Subscription not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    // Check if the user owns this subscription
    if (subscription.userId !== req.user!.id) {
      const error = new Error('Not authorized to access this subscription') as AppError;
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (e) {
    next(e);
  }
};

// CREATE subscription
export const createSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, price, currency, frequency, category, paymentMethod, startDate } = req.body;

    const parsedStartDate = new Date(startDate);
    const renewalDate = calculateRenewalDate(parsedStartDate, frequency as Frequency);
    const status = renewalDate < new Date() ? 'expired' : 'active';

    const [newSubscription] = await db.insert(subscriptions).values({
      name,
      price: price.toString(),
      currency: currency || 'USD',
      frequency,
      category,
      paymentMethod,
      startDate: parsedStartDate,
      renewalDate,
      status,
      userId: req.user!.id,
    } as NewSubscription).returning();

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: newSubscription.id,
      },
      headers: {
        'content-type': 'application/json',
      },
      retries: 0,
    });

    res.status(201).json({ success: true, data: { subscription: newSubscription, workflowRunId } });
  } catch (e) {
    next(e);
  }
};

// UPDATE subscription
export const updateSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, req.params.id),
    });

    if (!subscription) {
      const error = new Error('Subscription not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    // Check if the user owns this subscription
    if (subscription.userId !== req.user!.id) {
      const error = new Error('Not authorized to update this subscription') as AppError;
      error.statusCode = 403;
      throw error;
    }

    // Fields that can be updated
    const allowedUpdates = ['name', 'price', 'currency', 'frequency', 'category', 'paymentMethod', 'renewalDate'];
    const updates: Partial<Subscription> = { updatedAt: new Date() };
    
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        if (key === 'price') {
          (updates as Record<string, unknown>)[key] = req.body[key].toString();
        } else if (key === 'renewalDate') {
          (updates as Record<string, unknown>)[key] = new Date(req.body[key]);
        } else {
          (updates as Record<string, unknown>)[key] = req.body[key];
        }
      }
    }

    const [updatedSubscription] = await db.update(subscriptions)
      .set(updates)
      .where(eq(subscriptions.id, req.params.id))
      .returning();

    res.status(200).json({ success: true, data: updatedSubscription });
  } catch (e) {
    next(e);
  }
};

// DELETE subscription
export const deleteSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, req.params.id),
    });

    if (!subscription) {
      const error = new Error('Subscription not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    // Check if the user owns this subscription
    if (subscription.userId !== req.user!.id) {
      const error = new Error('Not authorized to delete this subscription') as AppError;
      error.statusCode = 403;
      throw error;
    }

    await db.delete(subscriptions).where(eq(subscriptions.id, req.params.id));

    res.status(200).json({ success: true, message: 'Subscription deleted successfully' });
  } catch (e) {
    next(e);
  }
};

// CANCEL subscription
export const cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, req.params.id),
    });

    if (!subscription) {
      const error = new Error('Subscription not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    // Check if the user owns this subscription
    if (subscription.userId !== req.user!.id) {
      const error = new Error('Not authorized to cancel this subscription') as AppError;
      error.statusCode = 403;
      throw error;
    }

    if (subscription.status === 'cancelled') {
      const error = new Error('Subscription is already cancelled') as AppError;
      error.statusCode = 400;
      throw error;
    }

    const [cancelledSubscription] = await db.update(subscriptions)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(subscriptions.id, req.params.id))
      .returning();

    res.status(200).json({ success: true, data: cancelledSubscription, message: 'Subscription cancelled successfully' });
  } catch (e) {
    next(e);
  }
};

// GET upcoming renewals (within next 7 days)
export const getUpcomingRenewals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const upcomingSubscriptions = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.userId, req.user!.id),
        eq(subscriptions.status, 'active'),
        gte(subscriptions.renewalDate, today),
        lte(subscriptions.renewalDate, sevenDaysFromNow)
      ),
      orderBy: [subscriptions.renewalDate],
    });

    res.status(200).json({ success: true, data: upcomingSubscriptions });
  } catch (e) {
    next(e);
  }
};

// GET user's subscriptions
export const getUserSubscriptions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if the user is the same as the one in the token
    if (req.user!.id !== req.params.id) {
      const error = new Error('You are not the owner of this account') as AppError;
      error.statusCode = 401;
      throw error;
    }

    const userSubscriptions = await db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, req.params.id),
      orderBy: [desc(subscriptions.createdAt)],
    });

    res.status(200).json({ success: true, data: userSubscriptions });
  } catch (e) {
    next(e);
  }
};

// Test endpoint to send email immediately
export const testSendEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: subscriptionId } = req.params;

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, subscriptionId),
      with: {
        user: true,
      },
    });

    if (!subscription) {
      const error = new Error('Subscription not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    // Check if the user owns this subscription
    if (subscription.userId !== req.user!.id) {
      const error = new Error('Not authorized to send test email for this subscription') as AppError;
      error.statusCode = 403;
      throw error;
    }

    await sendReminderEmail({
      to: subscription.user.email,
      type: '7 days before reminder',
      subscription: subscription as SubscriptionWithUser,
    });

    res.status(200).json({ success: true, message: 'Test email sent!' });
  } catch (e) {
    next(e);
  }
};

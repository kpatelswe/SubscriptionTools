import { Router, Request, Response } from 'express';
import { db, subscriptions, users } from '../database/index.js';
import { count, eq } from 'drizzle-orm';
import { AuthRequest } from '../types/index.js';

const statsRouter = Router();

// Only allow authenticated users to see stats
statsRouter.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    // Get total counts
    const [userCount] = await db.select({ count: count() }).from(users);
    const [subscriptionCount] = await db.select({ count: count() }).from(subscriptions);
    const [activeSubscriptions] = await db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.status, 'active'));

    res.status(200).json({
      success: true,
      data: {
        totalUsers: userCount.count,
        totalSubscriptions: subscriptionCount.count,
        activeSubscriptions: activeSubscriptions.count,
        serverUptime: Math.floor(process.uptime())
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

export default statsRouter;


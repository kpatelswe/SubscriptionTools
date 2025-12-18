import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  getUpcomingRenewals,
  getUserSubscriptions,
  testSendEmail,
} from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();

subscriptionRouter.use(authorize);
subscriptionRouter.get('/', getAllSubscriptions);
subscriptionRouter.get('/upcoming-renewals', getUpcomingRenewals);
subscriptionRouter.get('/user/:id', getUserSubscriptions);
subscriptionRouter.get('/:id', getSubscriptionById);
subscriptionRouter.post('/', createSubscription);
subscriptionRouter.put('/:id', updateSubscription);
subscriptionRouter.put('/:id/cancel', cancelSubscription);
subscriptionRouter.delete('/:id', deleteSubscription);

if (process.env.NODE_ENV === 'development') {
  subscriptionRouter.post('/:id/test-email', testSendEmail);
}

export default subscriptionRouter;

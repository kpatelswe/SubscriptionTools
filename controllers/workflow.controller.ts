import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');
import { db, subscriptions, type Subscription, type User } from '../database/index.js';
import { sendReminderEmail } from '../utils/send-email.js';
import { SubscriptionWithUser } from '../types/index.js';

const REMINDERS = [7, 5, 2, 1];

interface WorkflowContext {
  requestPayload: { subscriptionId: string };
  run: <T>(name: string, fn: () => Promise<T>) => Promise<T>;
  sleepUntil: (label: string, date: Date) => Promise<void>;
}

export const sendReminders = serve(async (context: WorkflowContext) => {
  const { subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== 'active') return;

  const renewalDate = dayjs(subscription.renewalDate);

  if (renewalDate.isBefore(dayjs())) {
    console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, 'day');

    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
    }

    if (dayjs().isSame(reminderDate, 'day')) {
      await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
    }
  }
});

const fetchSubscription = async (context: WorkflowContext, subscriptionId: string): Promise<SubscriptionWithUser | null> => {
  return await context.run('get subscription', async () => {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, subscriptionId),
      with: {
        user: true,
      },
    });
    return subscription as SubscriptionWithUser | null;
  });
};

const sleepUntilReminder = async (context: WorkflowContext, label: string, date: dayjs.Dayjs): Promise<void> => {
  console.log(`Sleeping until ${label} reminder at ${date}`);
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context: WorkflowContext, label: string, subscription: SubscriptionWithUser): Promise<void> => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder`);

    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });
  });
};

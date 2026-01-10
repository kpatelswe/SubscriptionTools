import { z } from 'zod';

export const subscriptionSchema = z.object({
  name: z.string().min(1, "Subscription name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  currency: z.string().length(3, "Currency must be a 3-letter code (e.g., USD)").default('USD'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  category: z.string().min(1, "Category is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date format",
  }),
});

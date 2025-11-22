import { z } from 'zod';

export const mealCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  createdAt: z.string().min(1, 'Date is required'),
});

export const mealUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export type MealCreateFormValues = z.infer<typeof mealCreateSchema>;
export type MealUpdateFormValues = z.infer<typeof mealUpdateSchema>;

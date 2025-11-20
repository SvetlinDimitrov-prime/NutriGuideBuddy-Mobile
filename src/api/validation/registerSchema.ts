import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.email('Enter a valid email address'),
    username: z
      .string()
      .min(1, 'This field is required')
      .max(255, 'Must be at most 255 characters'),
    password: z
      .string()
      .min(4, 'Use at least 4 characters')
      .max(255, 'Must be at most 255 characters'),
    confirm: z.string().min(1, 'This field is required'),
    agree: z.literal(true, {
      message: 'You must accept the Terms & Privacy',
    }),
  })
  .refine((data) => data.password === data.confirm, {
    path: ['confirm'],
    message: 'Passwords don’t match',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

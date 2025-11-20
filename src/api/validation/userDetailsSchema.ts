import { z } from 'zod';
// import type { Goals, Gender, WorkoutState } from '@/api/types/user'; // optional here

const workoutStateValues = [
  'SEDENTARY',
  'LIGHTLY_ACTIVE',
  'MODERATELY_ACTIVE',
  'VERY_ACTIVE',
  'SUPER_ACTIVE',
] as const;

const genderValues = ['MALE', 'FEMALE', 'FEMALE_PREGNANT', 'FEMALE_LACTATING'] as const;

const goalValues = ['MAINTAIN_WEIGHT', 'LOSE_WEIGHT', 'GAIN_WEIGHT'] as const;

export const userDetailsSchema = z.object({
  kilograms: z.coerce
    .number()
    .refine((v) => !Number.isNaN(v), 'Weight is required')
    .positive('Weight must be a positive number'),

  height: z.coerce
    .number()
    .refine((v) => !Number.isNaN(v), 'Height is required')
    .positive('Height must be a positive number'),

  age: z.coerce
    .number()
    .refine((v) => !Number.isNaN(v), 'Age is required')
    .int('Age must be an integer')
    .positive('Age must be a positive number'),

  workoutState: z.enum(workoutStateValues, {
    message: 'Activity level is required',
  }),

  gender: z.enum(genderValues, {
    message: 'Gender is required',
  }),

  goal: z.enum(goalValues, {
    message: 'Goal is required',
  }),

  diet: z
    .union([
      z.literal(''),
      z
        .string()
        .min(1, 'Diet must be at least 1 character')
        .max(50, 'Diet must be at most 50 characters'),
    ])
    .optional(),
});

export type UserDetailsFormValues = z.infer<typeof userDetailsSchema>;

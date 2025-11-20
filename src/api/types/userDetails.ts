import type { Goals, Gender, WorkoutState } from '@/api/types/user';

export type UserDetailsResponse = {
  userId: number;
  kilograms: number | null;
  height: number | null;
  age: number | null;
  workoutState: WorkoutState;
  gender: Gender;
  goal: Goals;
  diet: string | null;
};

export type UserDetailsRequest = {
  kilograms?: number;
  height?: number;
  age?: number;
  workoutState?: WorkoutState;
  gender?: Gender;
  goal?: Goals;
  diet?: string;
};

export type Gender = 'MALE' | 'FEMALE' | 'FEMALE_PREGNANT' | 'FEMALE_LACTATING';

export type UserRole = 'USER' | 'GOD';

export type WorkoutState =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'SUPER_ACTIVE';

export type Goals = 'MAINTAIN_WEIGHT' | 'LOSE_WEIGHT' | 'GAIN_WEIGHT';

export type UserResponse = {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
};

export type UserWithDetailsResponse = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  kilograms: number | null;
  height: number | null;
  age: number | null;
  workoutState: WorkoutState;
  gender: Gender;
  goal: Goals;
  diet: string | null;
};

export type UserCreateRequest = {
  email: string;
  username: string;
  password: string;
};

export type UserUpdateRequest = {
  username?: string;
};

export type CustomPageable = {
  pageNumber?: number;
  pageSize?: number;
  sort?: Record<string, 'ASC' | 'DESC' | string>;
};

export type UserFilter = {
  username?: string;
  email?: string;
  role?: UserRole;
  idsIn?: string[];
  idsNotIn?: string[];
  pageable?: CustomPageable;
};

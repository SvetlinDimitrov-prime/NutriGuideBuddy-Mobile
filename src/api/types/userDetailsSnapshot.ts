export enum WorkoutState {
  SEDENTARY = 'SEDENTARY',
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
  SUPER_ACTIVE = 'SUPER_ACTIVE',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  FEMALE_PREGNANT = 'FEMALE_PREGNANT',
  FEMALE_LACTATING = 'FEMALE_LACTATING',
}

export enum Goals {
  MAINTAIN_WEIGHT = 'MAINTAIN_WEIGHT',
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  GAIN_WEIGHT = 'GAIN_WEIGHT',
}

export type CustomPageable = {
  pageNumber?: number; // default 0
  pageSize?: number; // default 25
  sort?: Record<string, string>; // LinkedHashMap<String,String>
};

export type CustomPageableUserDetailsSnapshot = CustomPageable;

export type UserDetailsSnapshotFilter = {
  to?: string; // LocalDate -> ISO yyyy-mm-dd
  from?: string; // LocalDate -> ISO yyyy-mm-dd
  idsIn?: number[];
  idsNotIn?: number[];
  pageable?: CustomPageableUserDetailsSnapshot;
};

export type UserDetailsSnapshotResponse = {
  userId: number;
  kilograms: number | null;
  height: number | null;
  age: number | null;
  workoutState: WorkoutState | null;
  gender: Gender | null;
  goal: Goals | null;
  diet: string | null;
  snapshotAt: string; // LocalDateTime -> ISO string
};

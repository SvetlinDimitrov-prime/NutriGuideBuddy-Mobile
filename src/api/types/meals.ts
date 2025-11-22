export type MealFoodShortView = {
  id: number;
  name: string;
  calories: number;
};

export type MealView = {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  totalCalories: number | null;
  foods: MealFoodShortView[];
};

export type MealCreateRequest = {
  name: string;
  createdAt: string;
};

export type MealUpdateRequest = {
  name?: string;
};

export type CustomPageableMeal = {
  pageNumber?: number;
  pageSize?: number;
  sort?: Record<string, 'ASC' | 'DESC'>;
};

export type MealFilter = {
  name?: string;
  createdAt?: string;
  idsIn?: number[];
  idsNotIn?: number[];
  pageable?: CustomPageableMeal;
};

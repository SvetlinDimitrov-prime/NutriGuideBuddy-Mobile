import { apiClient } from '@/api/http/client';
import type {
  CustomFoodComponentRdiCreateRequestWrapper,
  CustomFoodComponentRdiResponse,
  CustomFoodComponentRdiUpdateRequest,
} from '@/api/types/customRdi';

const basePath = '/custom-rdi/components';

export async function getCustomRdiComponents() {
  const { data } = await apiClient.post<CustomFoodComponentRdiResponse[]>(`${basePath}/get-all`);
  return data;
}

export async function createCustomRdiComponents(
  payload: CustomFoodComponentRdiCreateRequestWrapper,
) {
  const { data } = await apiClient.post<CustomFoodComponentRdiResponse[]>(basePath, payload);
  return data;
}

export async function getCustomRdiComponentById(componentId: number) {
  const { data } = await apiClient.get<CustomFoodComponentRdiResponse>(
    `${basePath}/${componentId}`,
  );
  return data;
}

export async function updateCustomRdiComponent(
  componentId: number,
  dto: CustomFoodComponentRdiUpdateRequest,
) {
  const { data } = await apiClient.patch<CustomFoodComponentRdiResponse>(
    `${basePath}/${componentId}`,
    dto,
  );
  return data;
}

export async function deleteCustomRdiComponent(componentId: number) {
  await apiClient.delete<void>(`${basePath}/${componentId}`);
}

// src/api/hooks/useCustomRdi.ts
import {
  createCustomRdiComponents,
  deleteCustomRdiComponent,
  getCustomRdiComponentById,
  getCustomRdiComponents,
  updateCustomRdiComponent,
} from '@/api/endpoints/customRdi';
import type {
  CustomFoodComponentRdiCreateRequestWrapper,
  CustomFoodComponentRdiResponse,
  CustomFoodComponentRdiUpdateRequest,
} from '@/api/types/customRdi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customRdiKeys, trackerKeys } from '../queryKeys';

export function useCustomRdiComponents(enabled = true) {
  return useQuery<CustomFoodComponentRdiResponse[], Error>({
    queryKey: customRdiKeys.all(),
    queryFn: getCustomRdiComponents,
    enabled,
  });
}

export function useCustomRdiComponent(componentId: number | null, enabled = true) {
  return useQuery<CustomFoodComponentRdiResponse, Error>({
    queryKey: componentId != null ? customRdiKeys.byId(componentId) : customRdiKeys.byId(0),
    queryFn: () => {
      if (componentId == null) {
        throw new Error('componentId is required');
      }
      return getCustomRdiComponentById(componentId);
    },
    enabled: enabled && componentId != null,
  });
}

export function useCreateCustomRdiComponents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomFoodComponentRdiCreateRequestWrapper) =>
      createCustomRdiComponents(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customRdiKeys.root });
      queryClient.invalidateQueries({ queryKey: trackerKeys.all });
    },
  });
}

export function useDeleteCustomRdiComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (componentId: number) => deleteCustomRdiComponent(componentId),
    onSuccess: () => {
      // custom RDI changed → refresh custom RDIs + tracker
      queryClient.invalidateQueries({ queryKey: customRdiKeys.root });
      queryClient.invalidateQueries({ queryKey: trackerKeys.all });
    },
  });
}

export function useUpdateCustomRdiComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { componentId: number; dto: CustomFoodComponentRdiUpdateRequest }) =>
      updateCustomRdiComponent(params.componentId, params.dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: customRdiKeys.root });
      queryClient.invalidateQueries({ queryKey: customRdiKeys.byId(variables.componentId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.all });
    },
  });
}

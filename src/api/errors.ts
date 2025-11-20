import {
  isProblemDetailResponse,
  ProblemDetailErrors,
  ProblemDetailResponse,
} from '@/api/types/problemDetail';
import axios from 'axios';

export type ParsedApiError = {
  status?: number;
  title?: string;
  message: string;
  errors?: ProblemDetailErrors;
  raw?: unknown;
};

export function parseApiError(error: unknown): ParsedApiError | null {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (isProblemDetailResponse(data)) {
      const pd = data as ProblemDetailResponse;

      const message = pd.detail || pd.title || error.message || 'An unexpected error occurred';

      return {
        status: pd.status ?? status,
        title: pd.title,
        message,
        errors: pd.errors,
        raw: data,
      };
    }

    return {
      status,
      title: undefined,
      message: error.message || 'Network error',
      errors: undefined,
      raw: data,
    };
  }

  if (error instanceof Error) {
    return {
      status: undefined,
      title: undefined,
      message: error.message,
      errors: undefined,
      raw: error,
    };
  }

  return {
    status: undefined,
    title: undefined,
    message: 'Unknown error',
    errors: undefined,
    raw: error,
  };
}

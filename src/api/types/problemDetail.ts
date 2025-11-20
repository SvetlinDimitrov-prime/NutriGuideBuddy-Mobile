export type ProblemDetailErrors = Record<string, string>;

export type ProblemDetailResponse = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: ProblemDetailErrors;
  [key: string]: unknown;
};

export function isProblemDetailResponse(data: unknown): data is ProblemDetailResponse {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  const hasStatus = typeof obj.status === 'number';
  const hasTitle = typeof obj.title === 'string';
  const hasDetail = typeof obj.detail === 'string';
  return hasStatus || hasTitle || hasDetail;
}

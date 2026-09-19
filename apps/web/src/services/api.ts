import apiClient from '@technovan/utils';

export type ApiListOptions = Record<string, string | number | boolean | undefined>;

export async function get<T>(path: string, params?: ApiListOptions): Promise<T> {
  return apiClient.get(path, { params }) as Promise<T>;
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  return apiClient.post(path, body) as Promise<T>;
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  return apiClient.patch(path, body) as Promise<T>;
}

export async function remove<T>(path: string): Promise<T> {
  return apiClient.delete(path) as Promise<T>;
}

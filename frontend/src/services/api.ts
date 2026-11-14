import type { UnknownRecord } from '../types/science';

export interface ApiMeta {
  total?: number;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: ApiMeta;
  [key: string]: unknown;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/${path.replace(/^\//, '')}`;
}

function isEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return typeof value === 'object' && value !== null && 'data' in value;
}

async function request<T>(path: string, signal?: AbortSignal): Promise<ApiEnvelope<T>> {
  const response = await fetch(buildUrl(path), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'detail' in payload
        ? String((payload as UnknownRecord).detail)
        : `Request failed (${response.status} ${response.statusText})`;
    throw new Error(message);
  }

  if (!isEnvelope<T>(payload)) {
    throw new Error('API response did not contain the required data envelope.');
  }
  return payload;
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const envelope = await request<T>(path, signal);
  return envelope.data;
}

export async function apiPage<T>(path: string, signal?: AbortSignal): Promise<ApiEnvelope<T>> {
  return request<T>(path, signal);
}

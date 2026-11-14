import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../services/api';

export interface UseApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  retry: () => void;
}

export function useApi<T>(path: string | null): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(path));
  const [requestedPath, setRequestedPath] = useState<string | null>(path);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    setRequestedPath(path);
    if (!path) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let current = true;
    setLoading(true);
    setError(null);
    setData(null);

    void apiGet<T>(path, controller.signal)
      .then((value) => {
        if (!current) return;
        setData(value);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        if (!current || controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : 'Unable to load scientific data.');
        setLoading(false);
      });

    return () => {
      current = false;
      controller.abort();
    };
  }, [path, attempt]);

  const matchesCurrentSelection = requestedPath === path;
  return {
    data: matchesCurrentSelection ? data : null,
    error: matchesCurrentSelection ? error : null,
    loading: Boolean(path) && (!matchesCurrentSelection || loading),
    retry
  };
}

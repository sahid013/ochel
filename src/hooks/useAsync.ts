import { useState, useCallback } from 'react';
import { getErrorMessage } from '@/lib/utils';
import type { LoadingState } from '@/types';

interface UseAsyncState<T> {
  data: T | null;
  error: string | null;
  status: LoadingState;
}

export function useAsync<T, Args extends unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    status: 'idle'
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState(prev => ({ ...prev, status: 'loading', error: null }));

      try {
        const data = await asyncFunction(...args);
        setState({ data, error: null, status: 'success' });
        return data;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState({ data: null, error: errorMessage, status: 'error' });
        throw error;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, status: 'idle' });
  }, []);

  return {
    data: state.data,
    error: state.error,
    status: state.status,
    loading: state.status === 'loading',
    execute,
    reset
  };
}

export function useAsyncCallback<T, Args extends unknown[]>(
  callback: (...args: Args) => Promise<T>,
  dependencies: unknown[] = []
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useAsync(useCallback(callback, dependencies));
}
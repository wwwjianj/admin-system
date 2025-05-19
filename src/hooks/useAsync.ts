import { useState, useCallback } from 'react';

interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

interface AsyncHook<T, P extends any[]> {
  execute: (...params: P) => Promise<T>;
  loading: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
}

/**
 * 自定义Hook，用于处理异步操作（如API请求）
 * @param asyncFunction 异步函数
 * @returns 异步操作的状态和触发函数
 */
function useAsync<T, P extends any[]>(
  asyncFunction: (...params: P) => Promise<T>
): AsyncHook<T, P> {
  const [state, setState] = useState<AsyncState<T>>({
    loading: false,
    error: null,
    data: null,
  });

  // 执行异步函数
  const execute = useCallback(
    async (...params: P) => {
      setState({ loading: true, error: null, data: null });
      try {
        const data = await asyncFunction(...params);
        setState({ loading: false, error: null, data });
        return data;
      } catch (error) {
        setState({ loading: false, error: error as Error, data: null });
        throw error;
      }
    },
    [asyncFunction]
  );

  // 重置状态
  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    execute,
    ...state,
    reset,
  };
}

export default useAsync; 
import { useState, useEffect } from 'react';

/**
 * 自定义防抖Hook，用于延迟更新值
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 在delay毫秒后更新debouncedValue
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 如果value或delay改变，清除定时器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce; 
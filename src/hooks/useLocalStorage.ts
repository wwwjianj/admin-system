import { useState, useEffect } from 'react';

/**
 * 自定义Hook，用于读取和存储localStorage中的数据
 * @param key localStorage的键名
 * @param initialValue 初始值
 * @returns [存储的值, 设置值的函数, 移除值的函数]
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, () => void] {
  // 获取初始值
  const getStoredValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return initialValue;
    }
  };

  // 状态存储值
  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // 返回一个包装版的setState，将新值存入localStorage
  const setValue = (value: T) => {
    try {
      // 允许值是一个函数，类似于setState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  };

  // 移除localStorage中的值
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from localStorage', error);
    }
  };
  
  // 当key变化时，更新storedValue
  useEffect(() => {
    setStoredValue(getStoredValue());
  }, [key]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage; 
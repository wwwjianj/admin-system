import { useRef, useEffect } from 'react';

/**
 * 自定义Hook，用于获取一个值的前一个状态
 * @param value 需要跟踪的值
 * @returns 前一个状态的值
 */
function usePrevious<T>(value: T): T | undefined {
  // 用ref存储前一个值
  const ref = useRef<T | undefined>(undefined);

  // 在每次渲染完成后，将当前值存储为ref的当前值
  useEffect(() => {
    ref.current = value;
  }, [value]); // 仅当value变化时运行

  // 返回前一个值（渲染前的值）
  return ref.current;
}

export default usePrevious; 
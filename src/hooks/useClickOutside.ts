import { useEffect, RefObject } from 'react';

/**
 * 自定义Hook，用于检测点击元素外部的事件
 * @param ref 要监听的元素引用
 * @param callback 点击外部时触发的回调函数
 */
function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  callback: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // 如果元素不存在或者点击的是元素内部，则不执行回调
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      
      callback(event);
    };

    // 添加鼠标和触摸事件监听
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // 组件卸载时移除事件监听
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, callback]); // 依赖项更新时重新添加监听
}

export default useClickOutside; 
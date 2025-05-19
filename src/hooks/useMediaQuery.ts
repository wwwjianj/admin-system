import { useState, useEffect } from 'react';

/**
 * 自定义Hook，用于响应媒体查询
 * @param query CSS媒体查询字符串，如 '(max-width: 768px)'
 * @returns 媒体查询是否匹配
 */
function useMediaQuery(query: string): boolean {
  // 初始化状态
  const getMatches = (): boolean => {
    // 确保代码运行在浏览器环境
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches());

  // 处理媒体查询变化的函数
  function handleChange() {
    setMatches(getMatches());
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // 初始化匹配状态
    handleChange();

    // 监听媒体查询变化
    if (matchMedia.addEventListener) {
      // 现代浏览器
      matchMedia.addEventListener('change', handleChange);
    } else {
      // 兼容旧版浏览器 (Safari < 14, IE)
      matchMedia.addListener(handleChange);
    }

    // 清理函数
    return () => {
      if (matchMedia.removeEventListener) {
        matchMedia.removeEventListener('change', handleChange);
      } else {
        matchMedia.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

// 预定义的断点查询
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');

export default useMediaQuery; 
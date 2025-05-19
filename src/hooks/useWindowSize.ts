import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * 自定义Hook，用于获取并监听窗口尺寸变化
 * @returns 窗口尺寸对象 {width, height}
 */
function useWindowSize(): WindowSize {
  // 初始化状态，为了避免服务端渲染时出错，初始值为undefined
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // 处理窗口大小变化的函数
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // 添加事件监听
    window.addEventListener('resize', handleResize);
    
    // 组件卸载时移除事件监听
    return () => window.removeEventListener('resize', handleResize);
  }, []); // 空依赖数组确保只运行一次

  return windowSize;
}

export default useWindowSize; 
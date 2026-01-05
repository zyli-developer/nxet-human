// 方案4：增强版 useWindowSize Hook（带初始化延迟）
// 这是一个可选方案，如果需要全局解决延迟问题，可以替换原来的 useWindowSize.js

import { useState, useEffect } from 'react';

export const useWindowSize = () => {
  // 初始化时使用 0，避免 SSR 或初始化时的问题
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // 延迟初始化，确保 window 对象已准备好
    const initSize = () => {
      if (typeof window !== 'undefined') {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };
    
    // 使用 requestAnimationFrame 确保在下一帧获取
    const rafId = requestAnimationFrame(initSize);
    
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };
    
    window.addEventListener('resize', updateSize);
    
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return windowSize;
}


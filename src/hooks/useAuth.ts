import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

interface User {
  username: string;
  role: string;
  [key: string]: any;
}

interface AuthHook {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

/**
 * 自定义Hook，用于处理用户认证
 * @returns 用户认证相关函数和状态
 */
function useAuth(): AuthHook {
  const [user, setUser, removeUser] = useLocalStorage<User | null>('user', null);
  const [loading, setLoading] = useState(true);

  // 检查用户是否已认证
  const isAuthenticated = !!user;

  // 模拟登录请求
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // 这里应该是实际的API调用
      // 为演示目的，我们只检查硬编码的凭据
      if (username === 'admin' && password === 'admin') {
        const userData: User = {
          username,
          role: 'admin',
          lastLogin: new Date().toISOString(),
        };
        setUser(userData);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  }, [setUser]);

  // 登出
  const logout = useCallback(() => {
    removeUser();
  }, [removeUser]);

  // 检查用户会话是否有效
  useEffect(() => {
    // 这里可以添加令牌验证逻辑
    // 例如检查令牌是否过期
    setLoading(false);
  }, [user]);

  return {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
  };
}

export default useAuth; 
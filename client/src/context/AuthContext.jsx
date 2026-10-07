import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('resq_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('resq_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      const savedToken = localStorage.getItem('resq_token');
      if (savedToken) {
        try {
          const res = await authService.getMe();
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('resq_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session verification failed, logging out.');
          logout();
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data && res.data.token) {
      localStorage.setItem('resq_token', res.data.token);
      localStorage.setItem('resq_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Authentication failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.data && res.data.token) {
      localStorage.setItem('resq_token', res.data.token);
      localStorage.setItem('resq_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('resq_token');
    localStorage.removeItem('resq_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

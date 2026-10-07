import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('visionguard_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      } else {
        // Automatically sign in as default demo Inspector for frictionless preview
        setUser({
          id: 'c3333333-3333-3333-3333-333333333333',
          name: 'Elena Rostova (Inspector)',
          email: 'inspector@visionguard.edu',
          role: 'inspector'
        });
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      const newToken = res.data.token;
      localStorage.setItem('visionguard_token', newToken);
      setToken(newToken);
      setUser(res.data.user);
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.data.success) {
      const newToken = res.data.token;
      localStorage.setItem('visionguard_token', newToken);
      setToken(newToken);
      setUser(res.data.user);
      return res.data;
    }
  };

  const loginAsDemo = async (email) => {
    return login(email, 'Password@123');
  };

  const logout = () => {
    localStorage.removeItem('visionguard_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        loading,
        login,
        register,
        loginAsDemo,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

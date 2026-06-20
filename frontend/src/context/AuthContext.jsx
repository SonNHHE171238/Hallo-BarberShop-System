"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const data = await authService.getMe();
      setUser(data.user);
      return data.user;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    await authService.login(email, password);
    const loggedInUser = await checkAuth(); // Fetch user info after successful login
    return loggedInUser;
  };

  const loginWithGoogle = async (accessToken) => {
    await authService.loginWithGoogle(accessToken);
    const loggedInUser = await checkAuth();
    return loggedInUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// src/features/auth/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLoginState = async () => {
      const value = await AsyncStorage.getItem("isLoggedIn");
      setIsLoggedIn(value === "true");
      setLoading(false); // ✅ Finished loading
    };
    loadLoginState();
  }, []);

  const login = async () => {
    await AsyncStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return <AuthContext.Provider value={{ isLoggedIn, loading, login, logout }}>{children}</AuthContext.Provider>;
};

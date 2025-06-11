// src/features/auth/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiService, LoginData, RegisterData, User } from "../services/api";

type AuthContextType = {
  isLoggedIn: boolean;
  isPaid: boolean;
  loading: boolean;
  user: User | null;
  login: (loginData: LoginData) => Promise<void>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isPaid: false,
  loading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadLoginState = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUser(userData);
          setIsLoggedIn(true);
          setIsPaid(false);
        }
      } catch (error) {
        console.error("Error loading login state:", error);
      }
      setLoading(false);
    };
    loadLoginState();
  }, []);

  const login = async (loginData: LoginData) => {
    try {
      const response = await apiService.login(loginData);
      const userObj = response.user;

      const paidStatus = await apiService.checkPaidStatus(userObj.email);
      setIsPaid(paidStatus);

      setUser(userObj);
      setIsLoggedIn(true);


      await AsyncStorage.setItem(
        "userData",
         JSON.stringify({user: userObj, isPaid: paidStatus})
        );
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const newUser = await apiService.register(registerData);
      setUser(newUser);
      setIsLoggedIn(false);
      setIsPaid(false);
      await AsyncStorage.setItem("userData", JSON.stringify(newUser));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      setUser(null);
      setIsLoggedIn(false);
      setIsPaid(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isPaid, loading, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

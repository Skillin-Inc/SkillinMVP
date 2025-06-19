// src/features/auth/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiService, LoginData, RegisterData, User } from "../services/api";

type StoredUserData = {
  // frontend format
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  username?: string;
  postalCode?: number;
  createdAt?: string;
  userType?: "student" | "teacher" | "admin";

  // backend format
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  postal_code?: number;
  created_at?: string;
  user_type?: "student" | "teacher" | "admin";
};

type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  login: (loginData: LoginData) => Promise<User>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
  user: null,
  login: async () => ({} as User),
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const transformStoredUserData = (userData: unknown): User | null => {
    if (!userData || typeof userData !== "object") return null;

    const userObj = userData as StoredUserData;

    try {
      if (
        userObj.first_name &&
        userObj.last_name &&
        userObj.email &&
        userObj.phone_number &&
        userObj.username &&
        userObj.id !== undefined &&
        userObj.postal_code !== undefined &&
        userObj.created_at
      ) {
        return {
          id: userObj.id,
          firstName: userObj.first_name,
          lastName: userObj.last_name,
          email: userObj.email,
          phoneNumber: userObj.phone_number,
          username: userObj.username,
          postalCode: userObj.postal_code,
          createdAt: userObj.created_at,
          userType: userObj.user_type ?? "student",
        };
      }

      if (
        userObj.firstName &&
        userObj.lastName &&
        userObj.email &&
        userObj.phoneNumber &&
        userObj.username &&
        userObj.id !== undefined &&
        userObj.postalCode !== undefined &&
        userObj.createdAt
      ) {
        return {
          id: userObj.id,
          firstName: userObj.firstName,
          lastName: userObj.lastName,
          email: userObj.email,
          phoneNumber: userObj.phoneNumber,
          username: userObj.username,
          postalCode: userObj.postalCode,
          createdAt: userObj.createdAt,
          userType: userObj.userType ?? "student",
        };
      }

      return null;
    } catch (error) {
      console.error("Error transforming user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadLoginState = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const storedUserData = JSON.parse(userDataString);
          console.log("Raw stored userData:", storedUserData);

          const transformedUser = transformStoredUserData(storedUserData);
          if (transformedUser) {
            console.log("Transformed userData:", transformedUser);
            setUser(transformedUser);
            setIsLoggedIn(true);

            if (JSON.stringify(storedUserData) !== JSON.stringify(transformedUser)) {
              await AsyncStorage.setItem("userData", JSON.stringify(transformedUser));
            }
          } else {
            await AsyncStorage.removeItem("userData");
          }
        }
      } catch (error) {
        console.error("Error loading login state:", error);
        await AsyncStorage.removeItem("userData");
      }
      setLoading(false);
    };
    loadLoginState();
  }, []);

  const login = async (loginData: LoginData): Promise<User> => {
    try {
      const response = await apiService.login(loginData);
      setUser(response.user);
      setIsLoggedIn(true);
      await AsyncStorage.setItem("userData", JSON.stringify(response.user));
      return response.user;
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
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

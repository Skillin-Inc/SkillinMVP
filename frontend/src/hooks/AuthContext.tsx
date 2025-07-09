// src/features/auth/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { api, LoginData, RegisterData, User } from "../services/api";

type StoredUserData = {
  // frontend format
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  username?: string;
  createdAt?: string;
  userType?: "student" | "teacher" | "admin";

  // backend format
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  created_at?: string;
  user_type?: "student" | "teacher" | "admin";
};

type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  isPaid: boolean;
  login: (loginData: LoginData) => Promise<User>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  switchMode: () => void;
  updateUser: (updatedUser: User) => Promise<void>;
  checkPaidStatus: (userId: string) => Promise<void>;
};

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;


export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
  user: null,
  isPaid: false,
  login: async () => ({} as User),
  register: async () => {},
  logout: async () => {},
  switchMode: () => {},
  updateUser: async () => {},
  checkPaidStatus: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  const checkPaidStatus = async (userId: string) => { 
  try {
    const res = await fetch(`${BACKEND_URL}/stripe/check-paid-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setIsPaid(data.isPaid);
  } catch (error) {
    console.error("Failed to check paid status:", error);
  }
};

  const transformStoredUserData = (userData: unknown): User | null => {
    if (!userData || typeof userData !== "object") return null;

    const userObj = userData as StoredUserData;

    try {
      if (
        userObj.first_name &&
        userObj.last_name &&
        userObj.email &&
        userObj.username &&
        userObj.id !== undefined &&
        userObj.created_at
      ) {
        return {
          id: userObj.id,
          firstName: userObj.first_name,
          lastName: userObj.last_name,
          email: userObj.email,
          phoneNumber: userObj.phone_number,
          username: userObj.username,
          createdAt: userObj.created_at,
          userType: userObj.user_type ?? "student",
        };
      }

      if (
        userObj.firstName &&
        userObj.lastName &&
        userObj.email &&
        userObj.username &&
        userObj.id !== undefined &&
        userObj.createdAt
      ) {
        return {
          id: userObj.id,
          firstName: userObj.firstName,
          lastName: userObj.lastName,
          email: userObj.email,
          phoneNumber: userObj.phoneNumber,
          username: userObj.username,
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
            checkPaidStatus(transformedUser.id);

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
      const response = await api.login(loginData);
      setUser(response.user);
      setIsLoggedIn(true);
      await AsyncStorage.setItem("userData", JSON.stringify(response.user));
      checkPaidStatus(response.user.id);
      return response.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const newUser = await api.register(registerData);
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
      setIsPaid(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const switchMode = () => {
    if (!user) return;
    const updatedUser: User = { ...user, userType: user.userType === "teacher" ? "student" : "teacher" };
    setUser(updatedUser);
  };

  const updateUser = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, user, isPaid , switchMode, login, register, logout, updateUser,checkPaidStatus, }}>
      {children}
    </AuthContext.Provider>
  );
};

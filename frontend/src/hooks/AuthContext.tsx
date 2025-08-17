// src/features/auth/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";
import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import { userPool } from "../config/userPool";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../services/api/";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  id?: string; // Cognito userSub
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  username: string;
  password: string;
  userType?: "student" | "teacher" | "admin";
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  username: string;
  createdAt: string;
  userType: "student" | "teacher" | "admin";
  cognitoUser?: CognitoUser;
}

type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  isPaid: boolean;
  freeMode: boolean;
  setFreeMode: (value: boolean) => void;
  login: (loginData: LoginData) => Promise<User>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  checkPaidStatus: (userId: string) => Promise<void>;
  confirmSignUp: (email: string, code: string, registrationData?: RegisterData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
};

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;


export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
  user: null,
  isPaid: false,
  freeMode: false,
  setFreeMode: () => {},
  login: async () => ({} as User),
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  checkPaidStatus: async () => {},
  confirmSignUp: async () => {},
  forgotPassword: async () => {},
  confirmForgotPassword: async () => {},
  resendConfirmationCode: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [freeMode, setFreeMode] = useState(false);


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

const checkFreeMode = async (userId: string) => {
  try {
    const res = await fetch(`${BACKEND_URL}/users/check-free-mode/${userId}`);
    const data = await res.json();
    setFreeMode(data.isFree);
    await AsyncStorage.setItem("freeMode", data.isFree.toString());
  } catch (error) {
    console.error("Failed to check free mode:", error);
  }
};

  useEffect(() => {
  const bootstrap = async () => {
    try {
      // 1. Try to restore Cognito user session
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        const session = await new Promise<CognitoUserSession>((resolve, reject) => {
          currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
            if (err) reject(err);
            else if (session) resolve(session);
            else reject(new Error("No session available"));
          });
        });

        if (session && session.isValid()) {
          const sub = session.getIdToken().payload.sub;

          // 2. Fetch user data from backend
          let backendUserData = null;
          try {
            backendUserData = await api.getUserById(sub);
          } catch (error) {
            console.warn("Error fetching user data from backend:", error);
            logout();
            return;
          }

          // 3. Build user object and store in context
          const user: User = {
            id: sub,
            firstName: backendUserData.first_name || "",
            lastName: backendUserData.last_name || "",
            email: backendUserData.email || "",
            phoneNumber: backendUserData.phone_number || "",
            username: backendUserData.username || backendUserData.email,
            createdAt: backendUserData.created_at || new Date().toISOString(),
            userType: backendUserData.user_type || "student",
            cognitoUser: currentUser,
          };

          setUser(user);
          setIsLoggedIn(true);

          // 4. Check paid/free status from backend and update state
          await checkPaidStatus(user.id);
          await checkFreeMode(user.id);
        }
      }

      // 5. Restore freeMode flag from AsyncStorage (if cached)
      const cachedFree = await AsyncStorage.getItem("freeMode");
      if (cachedFree === "true" || cachedFree === "false") {
        setFreeMode(cachedFree === "true");
      }

      // 6. Remove legacy userData from AsyncStorage
      await AsyncStorage.removeItem("userData");
    } catch (e) {
      console.error("Bootstrap failed:", e);
    } finally {
      // 7. Finish loading regardless of success/failure
      setLoading(false);
    }
  };

  bootstrap();
}, []);


  // Restore Cognito session on app start
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const currentUser = userPool.getCurrentUser();
        if (!currentUser) {
          // No Cognito user found, reset state
          setUser(null);
          setIsLoggedIn(false);
          setIsPaid(false);
          return;
        }

        // Retrieve current session from Cognito
        const session = await new Promise<CognitoUserSession>((resolve, reject) => {
          currentUser.getSession((err: Error | null, s: CognitoUserSession | null) => {
            if (err) reject(err);
            else if (s) resolve(s);
            else reject(new Error("No session available"));
          });
        });

        if (!session || !session.isValid()) {
          // Session invalid → reset state
          setUser(null);
          setIsLoggedIn(false);
          setIsPaid(false);
          return;
        }

        // Extract Cognito user sub (unique ID)
        const sub = session.getIdToken().payload.sub;

        // Fetch backend user profile by Cognito sub
        let backendUserData: any = null;
        try {
          backendUserData = await api.getUserById(sub);
        } catch (error) {
          console.warn("Error fetching user data from backend:", error);
          await logout(); // clear state if backend fetch fails
          return;
        }

        // Build unified User object
        const u: User = {
          id: sub,
          firstName: backendUserData.first_name || "",
          lastName: backendUserData.last_name || "",
          email: backendUserData.email || "",
          phoneNumber: backendUserData.phone_number || "",
          username: backendUserData.username || backendUserData.email,
          createdAt: backendUserData.created_at || new Date().toISOString(),
          userType: backendUserData.user_type || "student",
          cognitoUser: currentUser,
        };

        setUser(u);
        setIsLoggedIn(true);

        // After restoring session, also check payment/freeMode status
        checkPaidStatus(u.id);
        checkFreeMode(u.id);
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        setLoading(false); // always stop loading state
      }
    };

    checkAuthState();
  }, []);

  // Cognito login flow + payment/freeMode checks
  const login = async (loginData: LoginData): Promise<User> => {
    return new Promise((resolve, reject) => {
      const authDetails = new AuthenticationDetails({
        Username: loginData.email,
        Password: loginData.password,
      });

      const cognitoUser = new CognitoUser({
        Username: loginData.email,
        Pool: userPool,
      });

      // Authenticate with Cognito
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (session: CognitoUserSession) => {
          try {
            const sub = session.getIdToken().payload.sub;

            // Fetch backend user data after Cognito login
            let backendUserData: any = null;
            try {
              backendUserData = await api.getUserById(sub);
            } catch (error) {
              console.error("Error fetching user data from backend:", error);
              reject(error);
              return;
            }

            // Build User object
            const u: User = {
              id: sub,
              firstName: backendUserData.first_name || "",
              lastName: backendUserData.last_name || "",
              email: backendUserData.email || loginData.email,
              phoneNumber: backendUserData.phone_number || "",
              username: backendUserData.username || backendUserData.email,
              createdAt: backendUserData.created_at || new Date().toISOString(),
              userType: backendUserData.user_type || "student",
              cognitoUser,
            };

            setUser(u);
            setIsLoggedIn(true);

            // After successful login, check payment/freeMode
            Promise.all([checkPaidStatus(u.id), checkFreeMode(u.id)]).finally(() => {});
            resolve(u);
          } catch (error) {
            reject(error);
          }
        },
        onFailure: (err) => {
          reject(err); // reject on Cognito auth failure
        },
      });
    });
  };

  const register = async (registerData: RegisterData): Promise<void> => {
    return new Promise((resolve, reject) => {
      const attributeList = [new CognitoUserAttribute({ Name: "email", Value: registerData.email })];

      userPool.signUp(registerData.email, registerData.password, attributeList, [], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  const confirmSignUp = async (email: string, code: string, registrationData?: RegisterData): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, async (err) => {
        if (err) {
          reject(err);
          return;
        }

        if (registrationData) {
          try {
            const authDetails = new AuthenticationDetails({
              Username: email,
              Password: registrationData.password,
            });

            cognitoUser.authenticateUser(authDetails, {
              onSuccess: async (session: CognitoUserSession) => {
                try {
                  const subId = session.getIdToken().payload.sub;

                  const userDataWithId = {
                    ...registrationData,
                    id: subId,
                  };
                  await api.register(userDataWithId);

                  resolve();
                } catch (apiError) {
                  console.error("Failed to create database user:", apiError);
                  reject(apiError);
                }
              },
              onFailure: (authError) => {
                console.error("Failed to authenticate after confirmation:", authError);
                reject(authError);
              },
            });
          } catch (error) {
            console.error("Failed to create database user:", error);
            reject(error);
          }
        } else {
          resolve();
        }
      });
    });
  };

  const forgotPassword = async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  };

  const confirmForgotPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  };

const logout = async () => {
  try {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) currentUser.signOut();
  } catch (e) {
    console.warn("Cognito signOut failed:", e);
  }

  try {
    await AsyncStorage.removeItem("userData");
    await AsyncStorage.removeItem("freeMode");
  } catch (e) {
    console.warn("AsyncStorage clear failed:", e);
  }

  setUser(null);
  setIsLoggedIn(false);
  setIsPaid(false);
  setFreeMode(false);
};

  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser);
  };

  const resendConfirmationCode = async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.resendConfirmationCode((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        user,
        isPaid,
        freeMode,
        setFreeMode,
        login,
        register,
        logout,
        updateUser,
        checkPaidStatus,
        confirmSignUp,
        forgotPassword,
        confirmForgotPassword,
        resendConfirmationCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

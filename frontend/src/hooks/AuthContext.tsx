// src/features/auth/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import { COGNITO_CONFIG } from "../config/cognitoConfig";
import { API_CONFIG } from "../config/api";
import { api } from "../services/api/";

// Initialize Cognito User Pool
export const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_CONFIG.UserPoolId,
  ClientId: COGNITO_CONFIG.ClientId,
});

export interface LoginData {
  emailOrPhone: string;
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
  login: (loginData: LoginData) => Promise<User>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  switchMode: () => void;
  updateUser: (updatedUser: User) => Promise<void>;
  confirmSignUp: (email: string, code: string, registrationData?: RegisterData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
  user: null,
  login: async () => ({} as User),
  register: async () => {},
  logout: async () => {},
  switchMode: () => {},
  updateUser: async () => {},
  confirmSignUp: async () => {},
  forgotPassword: async () => {},
  confirmForgotPassword: async () => {},
  resendConfirmationCode: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing Cognito session on app start
  useEffect(() => {
    const checkAuthState = async () => {
      try {
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
            // Get Cognito sub ID from token
            const cognitoUserSub = session.getIdToken().payload.sub;

            // Fetch user data from backend (source of truth)
            let backendUserData = null;
            try {
              backendUserData = await api.getUserById(cognitoUserSub);
            } catch (error) {
              console.warn("Error fetching user data from backend:", error);
              // If we can't get backend data, log them out
              logout();
              return;
            }

            const user: User = {
              id: cognitoUserSub,
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
          }
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (loginData: LoginData): Promise<User> => {
    return new Promise((resolve, reject) => {
      const authDetails = new AuthenticationDetails({
        Username: loginData.emailOrPhone, // This should be email now
        Password: loginData.password,
      });

      const cognitoUser = new CognitoUser({
        Username: loginData.emailOrPhone, // This should be email now
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (session: CognitoUserSession) => {
          try {
            // Get the Cognito sub ID from the token
            const cognitoUserSub = session.getIdToken().payload.sub;
            const idToken = session.getIdToken().getJwtToken();

            // Fetch user data from your backend (this is now the source of truth)
            let backendUserData = null;
            try {
              const backendResponse = await fetch(`${API_CONFIG.BASE_URL}/users/${cognitoUserSub}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${idToken}`,
                },
              });

              if (backendResponse.ok) {
                backendUserData = await backendResponse.json();
              } else {
                throw new Error("Could not fetch user data from backend");
              }
            } catch (error) {
              console.error("Error fetching user data from backend:", error);
              reject(error);
              return;
            }

            // Use backend data as the source of truth
            const user: User = {
              id: cognitoUserSub,
              firstName: backendUserData.first_name || "",
              lastName: backendUserData.last_name || "",
              email: backendUserData.email || loginData.emailOrPhone,
              phoneNumber: backendUserData.phone_number || "",
              username: backendUserData.username || backendUserData.email,
              createdAt: backendUserData.created_at || new Date().toISOString(),
              userType: backendUserData.user_type || "student",
              cognitoUser: cognitoUser,
            };

            setUser(user);
            setIsLoggedIn(true);
            resolve(user);
          } catch (error) {
            reject(error);
          }
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  };

  const register = async (registerData: RegisterData): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Only set email attribute - remove all others
      const attributeList = [new CognitoUserAttribute({ Name: "email", Value: registerData.email })];

      // Use email as username since sign-in identifier is email
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

        // After successful confirmation, create database user with Cognito sub ID
        if (registrationData) {
          try {
            // Authenticate user to get their session and sub ID
            const authDetails = new AuthenticationDetails({
              Username: email,
              Password: registrationData.password,
            });

            cognitoUser.authenticateUser(authDetails, {
              onSuccess: async (session: CognitoUserSession) => {
                try {
                  const subId = session.getIdToken().payload.sub;

                  // Create database user with Cognito sub ID
                  const userDataWithId = {
                    ...registrationData,
                    id: subId, // Use Cognito sub as database ID
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
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
    setUser(null);
    setIsLoggedIn(false);
  };

  const switchMode = () => {
    // This function can be used to switch between different modes if needed
    console.log("Switch mode called");
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
        login,
        register,
        logout,
        switchMode,
        updateUser,
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

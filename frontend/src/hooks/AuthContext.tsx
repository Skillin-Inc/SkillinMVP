// src/features/auth/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from "amazon-cognito-identity-js";
import { COGNITO_CONFIG } from "../config/cognitoConfig";

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
  confirmSignUp: (email: string, code: string) => Promise<void>;
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
          const session = await new Promise<any>((resolve, reject) => {
            currentUser.getSession((err: any, session: any) => {
              if (err) reject(err);
              else resolve(session);
            });
          });

          if (session) {
            // Get user attributes
            const attributes = await new Promise<any[]>((resolve, reject) => {
              currentUser.getUserAttributes((err: any, attributes: any[] | undefined) => {
                if (err) reject(err);
                else resolve(attributes || []);
              });
            });

            if (attributes) {
              const userData = attributes.reduce((acc: any, attr: any) => {
                acc[attr.getName()] = attr.getValue();
                return acc;
              }, {});

              const user: User = {
                id: userData.sub || currentUser.getUsername(),
                firstName: userData.given_name || userData.first_name || "",
                lastName: userData.family_name || userData.last_name || "",
                email: userData.email || currentUser.getUsername(),
                phoneNumber: userData.phone_number,
                username: userData.preferred_username || userData.email || currentUser.getUsername(),
                createdAt: userData.created_at || new Date().toISOString(),
                userType: "student",
                cognitoUser: currentUser,
              };

              setUser(user);
              setIsLoggedIn(true);
              await AsyncStorage.setItem("userData", JSON.stringify(user));
            }
          }
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        await AsyncStorage.removeItem("userData");
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (loginData: LoginData): Promise<User> => {
    return new Promise((resolve, reject) => {
      const authDetails = new AuthenticationDetails({
        Username: loginData.emailOrPhone,
        Password: loginData.password,
      });

      const cognitoUser = new CognitoUser({
        Username: loginData.emailOrPhone,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (session: any) => {
          try {
            // Get user attributes
            const attributes = await new Promise<any[]>((resolve, reject) => {
              cognitoUser.getUserAttributes((err: any, attributes: any[] | undefined) => {
                if (err) reject(err);
                else resolve(attributes || []);
              });
            });

            if (attributes) {
              const userData = attributes.reduce((acc: any, attr: any) => {
                acc[attr.getName()] = attr.getValue();
                return acc;
              }, {});

              const user: User = {
                id: userData.sub || cognitoUser.getUsername(),
                firstName: userData.given_name || userData.first_name || "",
                lastName: userData.family_name || userData.last_name || "",
                email: userData.email || cognitoUser.getUsername(),
                phoneNumber: userData.phone_number,
                username: userData.preferred_username || userData.email || cognitoUser.getUsername(),
                createdAt: userData.created_at || new Date().toISOString(),
                userType: "student",
                cognitoUser,
              };

              setUser(user);
              setIsLoggedIn(true);
              await AsyncStorage.setItem("userData", JSON.stringify(user));
              resolve(user);
            }
          } catch (error) {
            reject(error);
          }
        },
        onFailure: (err: any) => {
          console.error("Login error:", err);
          reject(err);
        },
        mfaRequired: (codeDeliveryDetails: any) => {
          reject({ mfaRequired: true, codeDeliveryDetails });
        },
        newPasswordRequired: (userAttributes: any, requiredAttributes: any) => {
          reject({ newPasswordRequired: true, userAttributes, requiredAttributes });
        },
      });
    });
  };

  const register = async (registerData: RegisterData): Promise<void> => {
    return new Promise((resolve, reject) => {
      const attributes = [
        new CognitoUserAttribute({ Name: "email", Value: registerData.email }),
        new CognitoUserAttribute({ Name: "given_name", Value: registerData.firstName }),
        new CognitoUserAttribute({ Name: "family_name", Value: registerData.lastName }),
        new CognitoUserAttribute({ Name: "preferred_username", Value: registerData.username }),
        ...(registerData.phoneNumber
          ? [new CognitoUserAttribute({ Name: "phone_number", Value: registerData.phoneNumber })]
          : []),
      ];

      userPool.signUp(registerData.email, registerData.password, attributes, [], (err, result) => {
        if (err) {
          console.error("Registration error:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  const confirmSignUp = async (email: string, code: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });

      user.confirmRegistration(code, true, (err) => {
        if (err) {
          console.error("Confirmation error:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  const forgotPassword = async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });

      user.forgotPassword({
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      });
    });
  };

  const confirmForgotPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });

      user.confirmPassword(code, newPassword, {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      });
    });
  };

  const logout = async () => {
    try {
      if (user?.cognitoUser) {
        user.cognitoUser.signOut();
      }
      await AsyncStorage.removeItem("userData");
      setUser(null);
      setIsLoggedIn(false);
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

  const resendConfirmationCode = async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });
      user.resendConfirmationCode((err, result) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        user,
        switchMode,
        login,
        register,
        logout,
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

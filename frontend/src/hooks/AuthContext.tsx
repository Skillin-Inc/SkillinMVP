// src/features/auth/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";
import {
  signIn,
  signUp,
  confirmSignUp as amplifyConfirmSignUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
  resendSignUpCode,
  type AuthUser,
  type SignInOutput,
  type SignUpOutput,
} from "aws-amplify/auth";
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
  authUser?: AuthUser;
}

export interface BackendUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  username?: string;
  created_at?: string;
  user_type?: "student" | "teacher" | "admin";
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
        const authUser = await getCurrentUser();
        const session = await fetchAuthSession();

        if (session && session.tokens) {
          const cognitoUserSub = authUser.userId;

          let backendUserData = null;
          try {
            backendUserData = await api.getUserById(cognitoUserSub);
          } catch (error) {
            console.warn("Error fetching user data from backend:", error);
            await logout();
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
            authUser: authUser,
          };

          setUser(user);
          setIsLoggedIn(true);
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

        let backendUserData: BackendUserData | null = null;
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
          username: backendUserData?.username ?? backendUserData?.email ?? "",
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
        // This is expected when user is not authenticated - don't log as error
        if (error instanceof Error && error.name !== "UserUnAuthenticatedException") {
          console.error("Error checking auth state:", error);
        } else {
          console.error("User is not authenticated");
        }
      } finally {
        setLoading(false); // always stop loading state
      }
    };

    checkAuthState();
  }, []);

  // Cognito login flow + payment/freeMode checks
  const login = async (loginData: LoginData): Promise<User> => {
    try {
      console.log("Attempting to sign in with:", { email: loginData.email });

      // Test basic Amplify configuration first
      try {
        const testSession = await fetchAuthSession();
        console.log("Amplify session check:", testSession);
      } catch (sessionError) {
        console.log("Session check error (expected):", sessionError);
      }

      console.log("About to call signIn with username:", loginData.email);

      const signInResult: SignInOutput = await signIn({
        username: loginData.email,
        password: loginData.password,
        options: {
          authFlowType: "USER_PASSWORD_AUTH",
        },
      });

      console.log("signIn call completed successfully");

      console.log("Sign-in result:", { isSignedIn: signInResult.isSignedIn, nextStep: signInResult.nextStep });

      // Handle different sign-in flow states
      if (!signInResult.isSignedIn) {
        // Check if there are additional steps required
        if (signInResult.nextStep) {
          console.log("Additional sign-in step required:", signInResult.nextStep);
          throw new Error(`Sign-in requires additional step: ${signInResult.nextStep.signInStep}`);
        } else {
          throw new Error("Sign in was not completed");
        }
      }

      console.log("Getting current user after successful sign-in...");
      const authUser = await getCurrentUser();
      const cognitoUserSub = authUser.userId;
      console.log("Current user ID:", cognitoUserSub);

      let backendUserData = null;
      try {
        console.log("Fetching user data from backend...");
        console.log(
          "API URL:",
          `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:4040"}/users/${cognitoUserSub}`
        );

        // Check what token is being sent
        const session = await fetchAuthSession();
        console.log("Current session tokens:", {
          hasAccessToken: !!session.tokens?.accessToken,
          hasIdToken: !!session.tokens?.idToken,
          accessTokenSnippet: session.tokens?.accessToken?.toString().substring(0, 50) + "...",
          idTokenSnippet: session.tokens?.idToken?.toString().substring(0, 50) + "...",
        });

        backendUserData = await api.getUserById(cognitoUserSub);
        console.log("Backend user data received:", backendUserData);
      } catch (error) {
        console.error("Error fetching user data from backend:", error);

        // Add more details about the API error
        if (error instanceof Error && error.message.includes("HTTP error! status: 500")) {
          console.error("This is a backend server error. Check if:");
          console.error("1. Backend server is running on port 4040");
          console.error("2. Database connection is working");
          console.error("3. User exists in database with ID:", cognitoUserSub);
        }

        throw error;
      }

      const user: User = {
        id: cognitoUserSub,
        firstName: backendUserData.first_name || "",
        lastName: backendUserData.last_name || "",
        email: backendUserData.email || loginData.email,
        phoneNumber: backendUserData.phone_number || "",
        username: backendUserData.username || backendUserData.email,
        createdAt: backendUserData.created_at || new Date().toISOString(),
        userType: backendUserData.user_type || "student",
        authUser: authUser,
      };

      console.log("Login successful, setting user state");
      setUser(user);
      setIsLoggedIn(true);
      return user;
    } catch (error) {
      console.error("Login error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        name: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : "No stack trace",
        errorType: typeof error,
        errorString: String(error),
        errorJSON: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        error: error,
      });

      // Try to get more details about the specific error
      if (error && typeof error === "object") {
        console.error("Error object properties:", Object.keys(error));
        if ("code" in error) {
          console.error("Error code:", error.code);
        }
        if ("__type" in error) {
          console.error("Error __type:", error.__type);
        }
      }

      throw error;
    }
  };

  const register = async (registerData: RegisterData): Promise<void> => {
    try {
      const signUpResult: SignUpOutput = await signUp({
        username: registerData.email,
        password: registerData.password,
        options: {
          userAttributes: {
            email: registerData.email,
          },
        },
      });

      if (!signUpResult.isSignUpComplete) {
        // User needs to confirm their email
        return;
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const confirmSignUp = async (email: string, code: string, registrationData?: RegisterData): Promise<void> => {
    try {
      const confirmResult = await amplifyConfirmSignUp({
        username: email,
        confirmationCode: code,
      });

      if (confirmResult.isSignUpComplete) {
        if (registrationData) {
          try {
            // First, sign in to get the user ID from Amplify
            console.log("Signing in after email confirmation...");
            const signInResult = await signIn({
              username: email,
              password: registrationData.password,
            });

            if (signInResult.isSignedIn) {
              // Get the user ID from Amplify
              const authUser = await getCurrentUser();
              const subId = authUser.userId;

              console.log("Creating user in backend database with ID:", subId);

              // Create the user record in backend database FIRST
              const userDataWithId = {
                ...registrationData,
                id: subId,
              };

              await api.createUser(userDataWithId);
              console.log("User created in backend successfully");

              // Now fetch the complete user data for login state
              const backendUserData = await api.getUserById(subId);

              const user: User = {
                id: subId,
                firstName: backendUserData.first_name || "",
                lastName: backendUserData.last_name || "",
                email: backendUserData.email || email,
                phoneNumber: backendUserData.phone_number || "",
                username: backendUserData.username || "",
                createdAt: backendUserData.created_at || "",
                userType: backendUserData.user_type || "student",
                authUser: authUser,
              };

              console.log("Setting user state after successful registration");
              setUser(user);
              setIsLoggedIn(true);
            }
          } catch (apiError) {
            console.error("Failed to create database user:", apiError);
            throw apiError;
          }
        }
      }
    } catch (error) {
      console.error("Confirmation error:", error);
      throw error;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await resetPassword({ username: email });
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  };

  const confirmForgotPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword,
      });
    } catch (error) {
      console.error("Confirm forgot password error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser);
  };

  const resendConfirmationCode = async (email: string): Promise<void> => {
    try {
      await resendSignUpCode({ username: email });
    } catch (error) {
      console.error("Resend confirmation code error:", error);
      throw error;
    }
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

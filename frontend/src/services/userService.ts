import { CognitoUser, CognitoUserSession, CognitoUserAttribute } from "amazon-cognito-identity-js";
import { userPool } from "../config/userPool";
import { api } from "./api";
import { RegisterData, User, BackendUser, UpdateUserProfileData } from "./api/types";
import { transformBackendUserToUser } from "./api/utils";

const verifyCognitoUser = async (userId: string): Promise<boolean> => {
  try {
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      return false;
    }

    const session = await new Promise<CognitoUserSession>((resolve, reject) => {
      currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) reject(err);
        else if (session) resolve(session);
        else reject(new Error("No session available"));
      });
    });

    if (!session || !session.isValid()) {
      return false;
    }

    const cognitoUserSub = session.getIdToken().payload.sub;
    return cognitoUserSub === userId;
  } catch (error) {
    console.error("Error verifying Cognito user:", error);
    return false;
  }
};

export const createUser = async (userData: RegisterData): Promise<void> => {
  return new Promise((resolve, reject) => {
    const attributeList = [new CognitoUserAttribute({ Name: "email", Value: userData.email })];

    userPool.signUp(userData.email, userData.password, attributeList, [], async (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const cognitoUserSub = result?.userSub;
        if (!cognitoUserSub) {
          throw new Error("Failed to get Cognito user sub");
        }

        const userDataWithId = {
          ...userData,
          id: cognitoUserSub,
        };

        await api.register(userDataWithId);
        resolve();
      } catch (backendError) {
        console.error("Backend user creation failed, rolling back Cognito user:", backendError);

        try {
          const cognitoUser = new CognitoUser({
            Username: userData.email,
            Pool: userPool,
          });

          await new Promise<void>((resolveDelete, rejectDelete) => {
            cognitoUser.deleteUser((deleteErr) => {
              if (deleteErr) {
                console.error("Failed to rollback Cognito user:", deleteErr);
                rejectDelete(deleteErr);
              } else {
                resolveDelete();
              }
            });
          });
        } catch (rollbackError) {
          console.error("Failed to rollback Cognito user:", rollbackError);
        }

        reject(new Error("User creation failed: " + (backendError as Error).message));
      }
    });
  });
};

export const getUser = async (userId: string): Promise<User> => {
  const isCognitoUserValid = await verifyCognitoUser(userId);
  if (!isCognitoUserValid) {
    throw new Error("Invalid or missing Cognito session for user");
  }

  try {
    const backendUser = await api.getUserById(userId);
    return transformBackendUserToUser(backendUser);
  } catch (error) {
    console.error("Error fetching user from backend:", error);
    throw new Error("Failed to fetch user data from backend");
  }
};

export const updateUser = async (userId: string, updateData: UpdateUserProfileData): Promise<User> => {
  const isCognitoUserValid = await verifyCognitoUser(userId);
  if (!isCognitoUserValid) {
    throw new Error("Invalid or missing Cognito session for user");
  }

  try {
    const updatedBackendUser = await api.updateUserProfile(userId, updateData);
    return transformBackendUserToUser(updatedBackendUser);
  } catch (error) {
    console.error("Error updating user in backend:", error);
    throw new Error("Failed to update user data in backend");
  }
};

export const deleteUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  let backendUserData: BackendUser | null = null;

  try {
    try {
      backendUserData = await api.getUserById(userId);
    } catch (error) {
      console.warn("Could not fetch user data before deletion:", error);
    }

    const backendResult = await api.deleteUser(userId);

    if (!backendResult.success) {
      throw new Error(backendResult.message);
    }

    try {
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        await new Promise<void>((resolve, reject) => {
          currentUser.deleteUser((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
    } catch (cognitoError) {
      console.error("Failed to delete Cognito user, recreating backend user:", cognitoError);

      if (backendUserData) {
        try {
          const recreateData: RegisterData = {
            id: backendUserData.id,
            firstName: backendUserData.first_name,
            lastName: backendUserData.last_name,
            email: backendUserData.email,
            phoneNumber: backendUserData.phone_number,
            username: backendUserData.username,
            password: "",
            userType: backendUserData.user_type,
          };

          await api.register(recreateData);
          console.log("Successfully recreated backend user after Cognito deletion failure");

          throw new Error("Failed to delete Cognito user, but backend user has been recreated to maintain consistency");
        } catch (recreateError) {
          console.error("Failed to recreate backend user:", recreateError);
          throw new Error(
            "Critical error: User deleted from backend but Cognito deletion failed and could not recreate backend user"
          );
        }
      } else {
        throw new Error("Failed to delete Cognito user and no backup data available for recreation");
      }
    }

    return backendResult;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const userService = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
};

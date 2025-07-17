import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminDeleteUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  MessageActionType,
  UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import "dotenv/config";

// Configuration
const COGNITO_CONFIG = {
  region: process.env.AWS_REGION || "us-east-2",
  userPoolId: process.env.COGNITO_USER_POOL_ID || "us-east-2_ce7KAadKf",
};

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_CONFIG.region,
});

/**
 * Interface for user data
 */
export interface CognitoUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  userType: string;
  username: string;
}

/**
 * Interface for created user data with sub ID
 */
export interface CreatedCognitoUser extends CognitoUserData {
  sub: string;
}

/**
 * Lists all users in the Cognito User Pool
 */
export async function listAllUsers(): Promise<UserType[]> {
  try {
    console.log("📋 Listing all users in Cognito User Pool...");

    const command = new ListUsersCommand({
      UserPoolId: COGNITO_CONFIG.userPoolId,
    });

    const response = await cognitoClient.send(command);

    console.log(`✅ Found ${response.Users?.length || 0} users in Cognito User Pool`);
    return response.Users || [];
  } catch (error) {
    console.error("❌ Failed to list users:", error);
    throw error;
  }
}

/**
 * Deletes all users from the Cognito User Pool
 */
export async function deleteAllUsers(): Promise<void> {
  try {
    console.log("🗑️ Deleting all users from Cognito User Pool...");

    const users = await listAllUsers();

    if (users.length === 0) {
      console.log("✅ No users to delete");
      return;
    }

    console.log(`🗑️ Deleting ${users.length} users...`);

    for (const user of users) {
      if (user.Username) {
        try {
          const deleteCommand = new AdminDeleteUserCommand({
            UserPoolId: COGNITO_CONFIG.userPoolId,
            Username: user.Username as string,
          });

          await cognitoClient.send(deleteCommand);
          console.log(`✅ Deleted user: ${user.Username}`);
        } catch (error) {
          console.error(`❌ Failed to delete user ${user.Username}:`, error);
        }
      }
    }

    console.log("✅ All users deleted from Cognito User Pool");
  } catch (error) {
    console.error("❌ Failed to delete all users:", error);
    throw error;
  }
}

/**
 * Creates a new user in the Cognito User Pool and returns the user with sub ID
 */
export async function createUser(userData: CognitoUserData): Promise<CreatedCognitoUser> {
  try {
    console.log(`👤 Creating user: ${userData.email}`);

    // Create user command
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: COGNITO_CONFIG.userPoolId,
      Username: userData.username,
      UserAttributes: [
        {
          Name: "email",
          Value: userData.email,
        },
        {
          Name: "given_name",
          Value: userData.firstName,
        },
        {
          Name: "family_name",
          Value: userData.lastName,
        },
        {
          Name: "email_verified",
          Value: "true",
        },
      ],
      TemporaryPassword: userData.password,
      MessageAction: MessageActionType.SUPPRESS, // Don't send welcome email
    });

    await cognitoClient.send(createUserCommand);
    console.log(`✅ User created: ${userData.email}`);

    // Set permanent password
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: COGNITO_CONFIG.userPoolId,
      Username: userData.username,
      Password: userData.password,
      Permanent: true,
    });

    await cognitoClient.send(setPasswordCommand);
    console.log(`✅ Password set for user: ${userData.email}`);

    // Get the user to retrieve the sub ID
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: COGNITO_CONFIG.userPoolId,
      Username: userData.username,
    });

    const userResponse = await cognitoClient.send(getUserCommand);
    const subAttribute = userResponse.UserAttributes?.find((attr) => attr.Name === "sub");

    if (!subAttribute?.Value) {
      throw new Error(`Unable to retrieve sub ID for user: ${userData.email}`);
    }

    console.log(`✅ Retrieved sub ID for user ${userData.email}: ${subAttribute.Value}`);

    return {
      ...userData,
      sub: subAttribute.Value,
    };
  } catch (error) {
    console.error(`❌ Failed to create user ${userData.email}:`, error);
    throw error;
  }
}

/**
 * Creates multiple users in the Cognito User Pool and returns them with sub IDs
 */
export async function createUsers(users: CognitoUserData[]): Promise<CreatedCognitoUser[]> {
  try {
    console.log(`👥 Creating ${users.length} users in Cognito User Pool...`);

    const createdUsers: CreatedCognitoUser[] = [];

    for (const userData of users) {
      const createdUser = await createUser(userData);
      createdUsers.push(createdUser);
    }

    console.log("✅ All users created successfully");
    return createdUsers;
  } catch (error) {
    console.error("❌ Failed to create users:", error);
    throw error;
  }
}

/**
 * Resets Cognito User Pool by deleting all users and creating new ones
 * Returns the created users with their sub IDs
 */
export async function resetUserPool(users: CognitoUserData[]): Promise<CreatedCognitoUser[]> {
  try {
    console.log("🔄 Resetting Cognito User Pool...");

    // Delete all existing users
    await deleteAllUsers();

    // Create new users and get their sub IDs
    const createdUsers = await createUsers(users);

    console.log("✅ Cognito User Pool reset successfully");
    return createdUsers;
  } catch (error) {
    console.error("❌ Failed to reset Cognito User Pool:", error);
    throw error;
  }
}

/**
 * Validates Cognito configuration
 */
export function validateCognitoConfig(): void {
  console.log("🔍 Validating Cognito configuration...");

  const issues: string[] = [];

  if (!COGNITO_CONFIG.region) {
    issues.push("AWS_REGION is not configured");
  }

  if (!COGNITO_CONFIG.userPoolId) {
    issues.push("COGNITO_USER_POOL_ID is not configured");
  }

  if (issues.length > 0) {
    const errorMessage = `Cognito configuration validation failed:\n${issues
      .map((issue) => `  - ${issue}`)
      .join("\n")}`;
    console.error("❌ " + errorMessage);
    throw new Error(errorMessage);
  }

  console.log("✅ Cognito configuration validation passed");
  console.log(`   AWS Region: ${COGNITO_CONFIG.region}`);
  console.log(`   User Pool ID: ${COGNITO_CONFIG.userPoolId}`);
}

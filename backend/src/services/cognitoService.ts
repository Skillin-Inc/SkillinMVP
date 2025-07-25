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

const COGNITO_CONFIG = {
  region: process.env.AWS_REGION || "us-east-2",
  userPoolId: process.env.COGNITO_USER_POOL_ID || "us-east-2_BNd40QYUH",
  clientId: process.env.COGNITO_CLIENT_ID || "4c40i6g29b45emna6k7st0dnfv",
};

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_CONFIG.region,
});

export interface CognitoUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  userType: string;
  username: string;
}

export interface CreatedCognitoUser extends CognitoUserData {
  sub: string;
}

export async function listAllUsers(): Promise<UserType[]> {
  try {
    const command = new ListUsersCommand({
      UserPoolId: COGNITO_CONFIG.userPoolId,
    });

    const response = await cognitoClient.send(command);

    return response.Users || [];
  } catch (error) {
    console.error("Failed to list users:", error);
    throw error;
  }
}

export async function deleteAllUsers(): Promise<void> {
  try {
    const users = await listAllUsers();

    if (users.length === 0) {
      return;
    }

    for (const user of users) {
      if (user.Username) {
        try {
          const deleteCommand = new AdminDeleteUserCommand({
            UserPoolId: COGNITO_CONFIG.userPoolId,
            Username: user.Username as string,
          });

          await cognitoClient.send(deleteCommand);
        } catch (error) {
          console.error(`Failed to delete user ${user.Username}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Failed to delete all users:", error);
    throw error;
  }
}

export async function createUser(userData: CognitoUserData): Promise<CreatedCognitoUser> {
  try {
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: COGNITO_CONFIG.userPoolId,
      Username: userData.email, // Use email as username
      UserAttributes: [
        {
          Name: "email",
          Value: userData.email,
        },
        {
          Name: "email_verified",
          Value: "true",
        },
        // Remove all other attributes - they'll be stored in your database
      ],
      TemporaryPassword: userData.password,
      MessageAction: MessageActionType.SUPPRESS,
    });

    await cognitoClient.send(createUserCommand);

    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: COGNITO_CONFIG.userPoolId,
      Username: userData.email, // Use email as username
      Password: userData.password,
      Permanent: true,
    });

    await cognitoClient.send(setPasswordCommand);

    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: COGNITO_CONFIG.userPoolId,
      Username: userData.email, // Use email as username
    });

    const userResponse = await cognitoClient.send(getUserCommand);
    const subAttribute = userResponse.UserAttributes?.find((attr) => attr.Name === "sub");

    if (!subAttribute?.Value) {
      throw new Error(`Unable to retrieve sub ID for user: ${userData.email}`);
    }

    return {
      ...userData,
      sub: subAttribute.Value,
    };
  } catch (error) {
    console.error(`Failed to create user ${userData.email}:`, error);
    throw error;
  }
}

export async function createUsers(users: CognitoUserData[]): Promise<CreatedCognitoUser[]> {
  try {
    const createdUsers: CreatedCognitoUser[] = [];

    for (const userData of users) {
      const createdUser = await createUser(userData);
      createdUsers.push(createdUser);
    }

    return createdUsers;
  } catch (error) {
    console.error("Failed to create users:", error);
    throw error;
  }
}

export async function resetUserPool(users: CognitoUserData[]): Promise<CreatedCognitoUser[]> {
  try {
    await deleteAllUsers();

    const createdUsers = await createUsers(users);

    return createdUsers;
  } catch (error) {
    console.error("Failed to reset Cognito User Pool:", error);
    throw error;
  }
}

export function validateCognitoConfig(): void {
  const issues: string[] = [];

  if (!COGNITO_CONFIG.region) {
    issues.push("AWS_REGION is not configured");
  }

  if (!COGNITO_CONFIG.userPoolId) {
    issues.push("COGNITO_USER_POOL_ID is not configured");
  }

  if (!COGNITO_CONFIG.clientId) {
    issues.push("COGNITO_CLIENT_ID is not configured");
  }

  if (issues.length > 0) {
    const errorMessage = `Cognito configuration validation failed:\n${issues
      .map((issue) => `  - ${issue}`)
      .join("\n")}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  console.log(`   AWS Region: ${COGNITO_CONFIG.region}`);
  console.log(`   User Pool ID: ${COGNITO_CONFIG.userPoolId}`);
  console.log(`   Client ID: ${COGNITO_CONFIG.clientId}`);
}

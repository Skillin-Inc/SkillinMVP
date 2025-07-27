import "dotenv/config";

const AWS_REGION = process.env.AWS_REGION || "us-east-2";
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "us-east-2_BNd40QYUH";
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || "4c40i6g29b45emna6k7st0dnfv";

export const cognitoConfig = {
  region: AWS_REGION,
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID,
};

export function validateCognitoConfig(): void {
  const issues: string[] = [];

  if (!AWS_REGION) {
    issues.push("AWS_REGION is not configured");
  } else if (typeof AWS_REGION !== "string" || AWS_REGION.trim() === "") {
    issues.push("AWS_REGION is empty or invalid");
  }

  if (!COGNITO_USER_POOL_ID) {
    issues.push("COGNITO_USER_POOL_ID is not configured");
  } else if (typeof COGNITO_USER_POOL_ID !== "string" || COGNITO_USER_POOL_ID.trim() === "") {
    issues.push("COGNITO_USER_POOL_ID is empty or invalid");
  }

  if (!COGNITO_CLIENT_ID) {
    issues.push("COGNITO_CLIENT_ID is not configured");
  } else if (typeof COGNITO_CLIENT_ID !== "string" || COGNITO_CLIENT_ID.trim() === "") {
    issues.push("COGNITO_CLIENT_ID is empty or invalid");
  }

  if (issues.length > 0) {
    const errorMessage = `Cognito configuration validation failed:\n${issues
      .map((issue) => `  - ${issue}`)
      .join("\n")}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  console.log(`   AWS Region: ${AWS_REGION}`);
  console.log(`   User Pool ID: ${COGNITO_USER_POOL_ID}`);
  console.log(`   Client ID: ${COGNITO_CLIENT_ID}`);
}

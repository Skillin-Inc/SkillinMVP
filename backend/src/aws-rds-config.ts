import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import "dotenv/config";

// AWS RDS Configuration
const AWS_REGION = process.env.AWS_REGION || "us-east-2";
const RDS_SECRET_NAME = process.env.RDS_SECRET_NAME || "rds!cluster-d1aab255-8b30-49d0-a107-f2cc5e0c5cc6";

// RDS Connection Details (for when secrets only contain username/password)
const RDS_HOST = process.env.RDS_HOST;
const RDS_PORT = process.env.RDS_PORT ? parseInt(process.env.RDS_PORT) : 5432;
const RDS_DATABASE = process.env.RDS_DATABASE || "postgres";
const RDS_ENGINE = process.env.RDS_ENGINE || "postgres";

// Initialize AWS Secrets Manager client
export const secretsManagerClient = new SecretsManagerClient({
  region: AWS_REGION,
});

// Export configuration for use in other modules
export const rdsConfig = {
  region: AWS_REGION,
  secretName: RDS_SECRET_NAME,
};

/**
 * Validates environment configuration for AWS RDS
 * @throws Error if configuration is invalid
 */
export function validateEnvironmentConfig(): void {
  console.log("🔍 Validating environment configuration...");

  const issues: string[] = [];

  // Check AWS Region
  if (!AWS_REGION) {
    issues.push("AWS_REGION is not configured");
  } else if (typeof AWS_REGION !== "string" || AWS_REGION.trim() === "") {
    issues.push("AWS_REGION is empty or invalid");
  }

  // Check RDS Secret Name
  if (!RDS_SECRET_NAME) {
    issues.push("RDS_SECRET_NAME is not configured");
  } else if (typeof RDS_SECRET_NAME !== "string" || RDS_SECRET_NAME.trim() === "") {
    issues.push("RDS_SECRET_NAME is empty or invalid");
  }

  // Check if we have either AWS config or fallback
  const hasFallback = !!process.env.DATABASE_URL;
  if (!AWS_REGION || !RDS_SECRET_NAME) {
    if (!hasFallback) {
      issues.push("Neither AWS Secrets Manager configuration nor DATABASE_URL fallback is available");
    } else {
      console.log("⚠️  AWS configuration incomplete, but DATABASE_URL fallback is available");
    }
  }

  // Check RDS connection details (required for partial secrets)
  if (AWS_REGION && RDS_SECRET_NAME && !hasFallback) {
    if (!RDS_HOST) {
      console.log("⚠️  RDS_HOST not configured - assuming complete secret format");
    } else {
      console.log("✅ RDS connection details configured for partial secrets");
      console.log(`   RDS Host: ${RDS_HOST}`);
      console.log(`   RDS Port: ${RDS_PORT}`);
      console.log(`   RDS Database: ${RDS_DATABASE}`);
    }
  }

  if (issues.length > 0) {
    const errorMessage = `Environment configuration validation failed:\n${issues
      .map((issue) => `  - ${issue}`)
      .join("\n")}`;
    console.error("❌ " + errorMessage);
    throw new Error(errorMessage);
  }

  console.log("✅ Environment configuration validation passed");
  console.log(`   AWS Region: ${AWS_REGION}`);
  console.log(`   RDS Secret: ${RDS_SECRET_NAME}`);
  if (hasFallback) {
    console.log("   DATABASE_URL fallback: Available");
  }
}

/**
 * Sleep function for retry delays
 * @param ms - Milliseconds to sleep
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry configuration for AWS operations
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Retrieves database credentials from AWS Secrets Manager with retry logic
 * @returns Promise<string> - The secret string containing database credentials
 * @throws Error if secret retrieval fails after all retries
 */
export async function getRDSSecret(): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(
          RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
          RETRY_CONFIG.maxDelayMs
        );
        console.log(
          `⏳ Retrying RDS secret retrieval in ${delay}ms (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1})`
        );
        await sleep(delay);
      }

      console.log(`🔐 Retrieving RDS secret: ${RDS_SECRET_NAME} from region: ${AWS_REGION} (attempt ${attempt + 1})`);

      const command = new GetSecretValueCommand({
        SecretId: RDS_SECRET_NAME,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      });

      const response = await secretsManagerClient.send(command);

      if (!response.SecretString) {
        throw new Error("Secret string is empty or undefined");
      }

      console.log("✅ Successfully retrieved RDS secret");
      return response.SecretString;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (error instanceof Error) {
        if (error.name === "ResourceNotFoundException") {
          throw new Error(
            `RDS secret not found: ${RDS_SECRET_NAME}. Please verify the secret exists in region ${AWS_REGION}`
          );
        }
        if (error.name === "UnauthorizedOperation" || error.name === "AccessDenied") {
          throw new Error(`Access denied when retrieving RDS secret. Please check AWS credentials and IAM permissions`);
        }
        if (error.name === "InvalidRequestException") {
          throw new Error(`Invalid request when retrieving RDS secret: ${error.message}`);
        }
      }

      console.error(`❌ Attempt ${attempt + 1} failed:`, error);

      // If this is the last attempt, don't continue
      if (attempt === RETRY_CONFIG.maxRetries) {
        break;
      }
    }
  }

  // All retries failed
  console.error(`❌ All ${RETRY_CONFIG.maxRetries + 1} attempts failed to retrieve RDS secret`);
  throw new Error(
    `Failed to retrieve RDS secret after ${RETRY_CONFIG.maxRetries + 1} attempts: ${
      lastError?.message || "Unknown error"
    }`
  );
}

/**
 * Interface for partial RDS secret structure (only credentials)
 */
export interface RDSCredentials {
  username: string;
  password: string;
}

/**
 * Interface for complete RDS secret structure
 */
export interface RDSSecretData {
  username: string;
  password: string;
  engine: string;
  host: string;
  port: number;
  dbname: string;
  dbClusterIdentifier: string;
}

/**
 * Parses the RDS secret JSON string to extract database connection parameters
 * Handles both complete secrets and partial secrets (username/password only)
 * @param secretString - The JSON string from AWS Secrets Manager
 * @returns RDSSecretData - Parsed database connection parameters
 * @throws Error if parsing fails or required fields are missing
 */
export function parseRDSSecret(secretString: string): RDSSecretData {
  try {
    console.log("🔧 Parsing RDS secret data...");

    const secretData = JSON.parse(secretString);

    // DEBUG: Show the actual keys in the secret (without sensitive values)
    console.log("🔍 DEBUG: Actual keys in AWS secret:", Object.keys(secretData));
    console.log("🔍 DEBUG: Sample values (password hidden):");
    Object.keys(secretData).forEach((key) => {
      if (key.toLowerCase().includes("password")) {
        console.log(`  - ${key}: [HIDDEN]`);
      } else {
        console.log(`  - ${key}: ${secretData[key]}`);
      }
    });

    // Validate required credential fields
    const requiredCredentials = ["username", "password"];
    const missingCredentials = requiredCredentials.filter((field) => !secretData[field]);

    if (missingCredentials.length > 0) {
      throw new Error(`Missing required credential fields in RDS secret: ${missingCredentials.join(", ")}`);
    }

    // Check if this is a complete secret or partial secret
    const hasConnectionDetails = secretData.host && secretData.port && secretData.dbname;

    let parsedSecret: RDSSecretData;

    if (hasConnectionDetails) {
      // Complete secret with all connection details
      console.log("✅ Complete RDS secret detected (includes connection details)");

      // Validate engine type
      if (secretData.engine && secretData.engine !== "postgres") {
        console.warn(`⚠️  Expected postgres engine, got: ${secretData.engine}`);
      }

      // Validate port is a number
      const port = parseInt(secretData.port);
      if (isNaN(port) || port <= 0 || port > 65535) {
        throw new Error(`Invalid port number: ${secretData.port}`);
      }

      parsedSecret = {
        username: secretData.username,
        password: secretData.password,
        engine: secretData.engine || "postgres",
        host: secretData.host,
        port: port,
        dbname: secretData.dbname,
        dbClusterIdentifier: secretData.dbClusterIdentifier || "",
      };
    } else {
      // Partial secret (only credentials), get connection details from environment
      console.log("✅ Partial RDS secret detected (credentials only)");
      console.log("🔧 Getting connection details from environment variables...");

      // Validate that we have connection details in environment
      if (!RDS_HOST) {
        throw new Error("RDS_HOST environment variable is required when using partial secrets");
      }

      parsedSecret = {
        username: secretData.username,
        password: secretData.password,
        engine: RDS_ENGINE,
        host: RDS_HOST,
        port: RDS_PORT,
        dbname: RDS_DATABASE,
        dbClusterIdentifier: "",
      };

      console.log(`✅ Using connection details from environment:`);
      console.log(`   Host: ${RDS_HOST}`);
      console.log(`   Port: ${RDS_PORT}`);
      console.log(`   Database: ${RDS_DATABASE}`);
      console.log(`   Engine: ${RDS_ENGINE}`);
    }

    console.log(
      `✅ Successfully parsed RDS secret for database: ${parsedSecret.dbname} at ${parsedSecret.host}:${parsedSecret.port}`
    );
    return parsedSecret;
  } catch (error) {
    console.error("❌ Failed to parse RDS secret:", error);

    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in RDS secret: ${error.message}`);
    }

    throw new Error(`Failed to parse RDS secret: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Builds a PostgreSQL connection string from RDS secret data
 * @param secretData - Parsed RDS secret data
 * @returns string - PostgreSQL connection string
 */
export function buildConnectionString(secretData: RDSSecretData): string {
  try {
    console.log("🔗 Building PostgreSQL connection string...");

    // Encode username and password to handle special characters
    const encodedUsername = encodeURIComponent(secretData.username);
    const encodedPassword = encodeURIComponent(secretData.password);
    const encodedHost = encodeURIComponent(secretData.host);
    const encodedDbName = encodeURIComponent(secretData.dbname);

    // Build PostgreSQL connection string
    const connectionString = `postgresql://${encodedUsername}:${encodedPassword}@${encodedHost}:${secretData.port}/${encodedDbName}`;

    console.log(`✅ Built connection string for ${secretData.host}:${secretData.port}/${secretData.dbname}`);
    return connectionString;
  } catch (error) {
    console.error("❌ Failed to build connection string:", error);
    throw new Error(`Failed to build connection string: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fallback to environment variable if AWS Secrets Manager is unavailable
 * @returns string | null - DATABASE_URL from environment or null if not set
 */
function getFallbackConnectionString(): string | null {
  const fallbackUrl = process.env.DATABASE_URL;
  if (fallbackUrl) {
    console.log("🔄 Using fallback DATABASE_URL from environment variables");
    return fallbackUrl;
  }
  return null;
}

/**
 * Complete function to get RDS connection string from AWS Secrets Manager with fallback
 * @returns Promise<string> - PostgreSQL connection string
 * @throws Error if both AWS Secrets Manager and fallback fail
 */
export async function getRDSConnectionString(): Promise<string> {
  try {
    console.log("🚀 Getting RDS connection string from AWS Secrets Manager...");

    // Step 1: Retrieve secret from AWS Secrets Manager
    const secretString = await getRDSSecret();

    // Step 2: Parse the secret JSON
    const secretData = parseRDSSecret(secretString);

    // Step 3: Build connection string
    const connectionString = buildConnectionString(secretData);

    console.log("🎉 Successfully obtained RDS connection string");
    return connectionString;
  } catch (error) {
    console.error("❌ Failed to get RDS connection string from AWS Secrets Manager:", error);

    // Try fallback to environment variable
    console.log("🔄 Attempting fallback to environment variables...");
    const fallbackConnectionString = getFallbackConnectionString();

    if (fallbackConnectionString) {
      console.log("✅ Using fallback DATABASE_URL connection string");
      return fallbackConnectionString;
    }

    // No fallback available
    console.error("❌ No fallback connection string available");
    throw new Error(
      `Failed to get database connection string. AWS Secrets Manager failed: ${
        error instanceof Error ? error.message : String(error)
      }. No DATABASE_URL fallback configured.`
    );
  }
}

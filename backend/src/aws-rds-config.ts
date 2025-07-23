import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import "dotenv/config";

const AWS_REGION = process.env.AWS_REGION || "us-east-2";
const RDS_SECRET_NAME = process.env.RDS_SECRET_NAME || "rds!cluster-d1aab255-8b30-49d0-a107-f2cc5e0c5cc6";

const RDS_HOST = process.env.RDS_HOST;
const RDS_PORT = process.env.RDS_PORT ? parseInt(process.env.RDS_PORT) : 5432;
const RDS_DATABASE = process.env.RDS_DATABASE || "postgres";
const RDS_ENGINE = process.env.RDS_ENGINE || "postgres";

export const secretsManagerClient = new SecretsManagerClient({
  region: AWS_REGION,
});

export const rdsConfig = {
  region: AWS_REGION,
  secretName: RDS_SECRET_NAME,
};

export function validateEnvironmentConfig(): void {
  const issues: string[] = [];

  if (!AWS_REGION) {
    issues.push("AWS_REGION is not configured");
  } else if (typeof AWS_REGION !== "string" || AWS_REGION.trim() === "") {
    issues.push("AWS_REGION is empty or invalid");
  }

  if (!RDS_SECRET_NAME) {
    issues.push("RDS_SECRET_NAME is not configured");
  } else if (typeof RDS_SECRET_NAME !== "string" || RDS_SECRET_NAME.trim() === "") {
    issues.push("RDS_SECRET_NAME is empty or invalid");
  }

  if (!AWS_REGION || !RDS_SECRET_NAME) {
    issues.push("AWS Secrets Manager configuration is not available");
  }

  if (issues.length > 0) {
    const errorMessage = `Environment configuration validation failed:\n${issues
      .map((issue) => `  - ${issue}`)
      .join("\n")}`;
    console.error("error " + errorMessage);
    throw new Error(errorMessage);
  }

  console.log(`   AWS Region: ${AWS_REGION}`);
  console.log("   RDS Secret: [HIDDEN]");
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

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
          `Retrying RDS secret retrieval in ${delay}ms (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1})`
        );
        await sleep(delay);
      }

      console.log(`Retrieving RDS secret from region: ${AWS_REGION} (attempt ${attempt + 1})`);

      const command = new GetSecretValueCommand({
        SecretId: RDS_SECRET_NAME,
        VersionStage: "AWSCURRENT",
      });

      const response = await secretsManagerClient.send(command);

      if (!response.SecretString) {
        throw new Error("Secret string is empty or undefined");
      }

      return response.SecretString;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

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

      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (attempt === RETRY_CONFIG.maxRetries) {
        break;
      }
    }
  }

  console.error(`All ${RETRY_CONFIG.maxRetries + 1} attempts failed to retrieve RDS secret`);
  throw new Error(
    `Failed to retrieve RDS secret after ${RETRY_CONFIG.maxRetries + 1} attempts: ${
      lastError?.message || "Unknown error"
    }`
  );
}

export interface RDSCredentials {
  username: string;
  password: string;
}

export interface RDSSecretData {
  username: string;
  password: string;
  engine: string;
  host: string;
  port: number;
  dbname: string;
  dbClusterIdentifier: string;
}

export function parseRDSSecret(secretString: string): RDSSecretData {
  try {
    const secretData = JSON.parse(secretString);

    console.log("DEBUG: Actual keys in AWS secret:", Object.keys(secretData));
    console.log("DEBUG: Sample values (password hidden):");
    Object.keys(secretData).forEach((key) => {
      if (key.toLowerCase().includes("password")) {
        console.log(`  - ${key}: [HIDDEN]`);
      } else {
        console.log(`  - ${key}: ${secretData[key]}`);
      }
    });

    const requiredCredentials = ["username", "password"];
    const missingCredentials = requiredCredentials.filter((field) => !secretData[field]);

    if (missingCredentials.length > 0) {
      throw new Error(`Missing required credential fields in RDS secret: ${missingCredentials.join(", ")}`);
    }

    const hasConnectionDetails = secretData.host && secretData.port && secretData.dbname;

    let parsedSecret: RDSSecretData;

    if (hasConnectionDetails) {
      if (secretData.engine && secretData.engine !== "postgres") {
        console.warn(`⚠️  Expected postgres engine, got: ${secretData.engine}`);
      }

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
      console.log("Getting connection details from environment variables...");

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

      console.log(`   Host: ${RDS_HOST}`);
      console.log(`   Port: ${RDS_PORT}`);
      console.log(`   Database: ${RDS_DATABASE}`);
      console.log(`   Engine: ${RDS_ENGINE}`);
    }

    return parsedSecret;
  } catch (error) {
    console.error("❌ Failed to parse RDS secret:", error);

    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in RDS secret: ${error.message}`);
    }

    throw new Error(`Failed to parse RDS secret: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function buildConnectionString(secretData: RDSSecretData): string {
  try {
    const encodedUsername = encodeURIComponent(secretData.username);
    const encodedPassword = encodeURIComponent(secretData.password);
    const encodedHost = encodeURIComponent(secretData.host);
    const encodedDbName = encodeURIComponent(secretData.dbname);

    const connectionString = `postgresql://${encodedUsername}:${encodedPassword}@${encodedHost}:${secretData.port}/${encodedDbName}`;

    return connectionString;
  } catch (error) {
    console.error("Failed to build connection string:", error);
    throw new Error(`Failed to build connection string: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getRDSConnectionString(): Promise<string> {
  try {
    const secretString = await getRDSSecret();

    const secretData = parseRDSSecret(secretString);

    const connectionString = buildConnectionString(secretData);

    return connectionString;
  } catch (error) {
    console.error("Failed to get RDS connection string from AWS Secrets Manager");

    throw new Error(
      `Failed to get database connection string. AWS Secrets Manager failed: ${
        error instanceof Error ? error.message : String(error)
      }.`
    );
  }
}

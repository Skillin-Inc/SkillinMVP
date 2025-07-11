// src/aws-db-config.ts
import { Pool, PoolConfig } from "pg";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import "dotenv/config";

interface DatabaseCredentials {
  username: string;
  password: string;
  engine: string;
  host: string;
  port: number;
  dbname?: string;
  dbInstanceIdentifier: string;
}

// AWS configuration
const AWS_CONFIG = {
  secretName: process.env.AWS_SECRET_NAME || "rds!cluster-d1aab255-8b30-49d0-a107-f2cc5e0c5cc6",
  region: process.env.AWS_REGION || "us-east-2",
};

// Secrets Manager client
const secretsClient = new SecretsManagerClient({
  region: AWS_CONFIG.region,
});

// Database connection pool (singleton)
let databasePool: Pool | null = null;

// Get database credentials from AWS Secrets Manager
async function getDatabaseCredentials(): Promise<DatabaseCredentials> {
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: AWS_CONFIG.secretName,
        VersionStage: "AWSCURRENT",
      })
    );

    if (!response.SecretString) {
      throw new Error("No secret string found in the response");
    }

    const secret = JSON.parse(response.SecretString) as DatabaseCredentials;
    return secret;
  } catch (error) {
    console.error("Error retrieving database credentials from AWS Secrets Manager:", error);
    throw error;
  }
}

// Create database connection pool
async function createDatabasePool(): Promise<Pool> {
  try {
    const credentials = await getDatabaseCredentials();

    const poolConfig: PoolConfig = {
      user: credentials.username,
      password: credentials.password,
      host: credentials.host,
      port: credentials.port,
      database: credentials.dbname || "postgres", // fallback to default database name
      ssl: {
        rejectUnauthorized: false, // Required for Aurora
      },
      max: 20, // maximum number of clients in the pool
      idleTimeoutMillis: 30000, // close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
    };

    const pool = new Pool(poolConfig);

    // Test the connection
    const client = await pool.connect();
    console.log("Successfully connected to AWS RDS Aurora PostgreSQL database");
    client.release();

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });

    return pool;
  } catch (error) {
    console.error("Error connecting to AWS RDS database:", error);
    throw error;
  }
}

// Get database pool (singleton pattern)
export async function getDatabasePool(): Promise<Pool> {
  if (!databasePool) {
    databasePool = await createDatabasePool();
  }
  return databasePool;
}

// Close database connection pool
export async function closeDatabasePool(): Promise<void> {
  if (databasePool) {
    await databasePool.end();
    databasePool = null;
    console.log("Database connection pool closed");
  }
}

// Export configuration for testing/debugging
export { AWS_CONFIG };

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

class AWSDatabase {
  private pool: Pool | null = null;
  private secretName = process.env.AWS_SECRET_NAME || "rds!cluster-d1aab255-8b30-49d0-a107-f2cc5e0c5cc6";
  private region = process.env.AWS_REGION || "us-east-2";
  private client: SecretsManagerClient;

  constructor() {
    this.client = new SecretsManagerClient({
      region: this.region,
    });
  }

  private async getSecretValue(): Promise<DatabaseCredentials> {
    try {
      const response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: this.secretName,
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

  async getPool(): Promise<Pool> {
    if (this.pool) {
      return this.pool;
    }

    try {
      const credentials = await this.getSecretValue();

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

      this.pool = new Pool(poolConfig);

      // Test the connection
      const client = await this.pool.connect();
      console.log("Successfully connected to AWS RDS Aurora PostgreSQL database");
      client.release();

      // Handle pool errors
      this.pool.on("error", (err) => {
        console.error("Unexpected error on idle client", err);
      });

      return this.pool;
    } catch (error) {
      console.error("Error connecting to AWS RDS database:", error);
      throw error;
    }
  }

  async closePool(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log("Database connection pool closed");
    }
  }
}

// Export singleton instance
export const awsDatabase = new AWSDatabase();

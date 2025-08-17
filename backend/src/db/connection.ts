// Database connection management
import { Pool } from "pg";
import "dotenv/config";
import { getRDSConnectionString } from "../aws-rds-config";
import { QueryParam } from "./types";

let pool: Pool | null = null;

async function initializePool(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  try {
    const connectionString = await getRDSConnectionString();

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    await executeQuery("SELECT NOW()");

    return pool;
  } catch (error) {
    console.error("Failed to initialize database connection pool");
    pool = null;
    throw error;
  }
}

export async function getPool(): Promise<Pool> {
  if (!pool) {
    return await initializePool();
  }
  return pool;
}

export async function executeQuery(text: string, params?: QueryParam[]) {
  const dbPool = await getPool();
  return await dbPool.query(text, params);
}

import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { getRDSConnectionString } from "./src/aws-rds-config";

import "dotenv/config";
async function setupDatabase() {
  let pool: Pool | null = null;

  try {
    console.log("🔄 Getting RDS connection string...");
    const connectionString = await getRDSConnectionString();

    pool = new Pool({
      connectionString,
    });

    console.log("Connecting to db...");

    await pool.query("SELECT NOW()");
    console.log("Successfully connected to db");

    const schemaPath = path.join(__dirname, "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("Setting up db schema...");
    await pool.query(schema);
    console.log("Successfully set up db schema");

    const dataPath = path.join(__dirname, "database", "data.sql");
    const data = fs.readFileSync(dataPath, "utf8");

    console.log("Inserting sample data...");
    await pool.query(data);
    console.log("Successfully inserted sample data");

    console.log("Db setup complete");
  } catch (error) {
    console.error("Db setup failed:");
    console.error(error);
    console.error("Please check your db connection and try again.");
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

setupDatabase();

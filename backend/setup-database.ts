import { Pool } from "pg";
import fs from "fs";
import path from "path";

import "dotenv/config";
async function setupDatabase() {
  const pool = new Pool({
    host: process.env.PG_HOST || "localhost",
    port: Number(process.env.PG_PORT) || 5432,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  });

  try {
    console.log("Connecting to db...");

    await pool.query("SELECT NOW()");
    console.log("Successfully connected to db");

    const schemaPath = path.join(__dirname, "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("Setting up db schema...");
    await pool.query(schema);
    console.log("Successfully set up db schema");

    console.log("Db setup complete");
  } catch (error) {
    console.error("Db setup failed:");
    console.error(error);
    console.error("Please check your db connection and try again.");
  } finally {
    await pool.end();
  }
}

setupDatabase();

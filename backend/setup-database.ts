import fs from "fs";
import path from "path";
import { getDatabasePool, closeDatabasePool } from "./src/aws-db-config";
import "dotenv/config";

async function setupDatabase() {
  // Use AWS RDS database connection
  const pool = await getDatabasePool();

  try {
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
    await closeDatabasePool();
  }
}

setupDatabase();

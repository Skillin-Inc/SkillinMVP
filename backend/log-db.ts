import { Pool } from "pg";
import { getRDSConnectionString } from "./src/aws-rds-config";
import "dotenv/config";

const TABLES = ["users", "messages", "categories", "courses", "lessons", "progress"];

async function logDB() {
  let pool: Pool | null = null;

  try {
    const connectionString = await getRDSConnectionString();
    pool = new Pool({
      connectionString,
    });

    await pool.query("SELECT NOW()");

    for (const tableName of TABLES) {
      try {
        console.log(`Table: ${tableName.toUpperCase()}`);
        console.log("--------------------------------");

        const result = await pool.query(`SELECT * FROM "${tableName}" LIMIT 5`);

        if (result.rows.length === 0) {
          console.log("   (No entries found)");
        } else {
          result.rows.forEach((row, index) => {
            console.log(`   Entry ${index + 1}:`, JSON.stringify(row, null, 2));
          });
        }
      } catch (error) {
        console.error(`Error querying table ${tableName}:`, error);
        console.log("");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to connect to database:", error.name);
    } else {
      console.error("Failed to connect to database");
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

logDB();

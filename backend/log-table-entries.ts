import { Pool } from "pg";
import { getRDSConnectionString } from "./src/aws-rds-config";
import "dotenv/config";

const TABLES = ["users", "messages", "categories", "courses", "lessons", "progress"];

async function logTableEntries() {
  let pool: Pool | null = null;

  try {
    console.log("🔍 Connecting to database to log table entries...");

    // Get database connection
    const connectionString = await getRDSConnectionString();
    pool = new Pool({
      connectionString,
    });

    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✅ Successfully connected to database\n");

    // Log entries for each table
    for (const tableName of TABLES) {
      try {
        console.log(`📋 Table: ${tableName.toUpperCase()}`);
        console.log("=".repeat(50));

        const result = await pool.query(`SELECT * FROM "${tableName}" LIMIT 5`);

        if (result.rows.length === 0) {
          console.log("   (No entries found)");
        } else {
          result.rows.forEach((row, index) => {
            console.log(`   Entry ${index + 1}:`, JSON.stringify(row, null, 2));
          });
        }

        console.log(`   Total entries found: ${result.rows.length}/5\n`);
      } catch (error) {
        console.error(`   ❌ Error querying table ${tableName}:`, error);
        console.log("");
      }
    }

    console.log("🎉 Finished logging table entries!");
  } catch (error) {
    console.error("❌ Failed to connect to database:");
    console.error(error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the logging function
logTableEntries();

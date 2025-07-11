// test-aws-connection.ts
import { getDatabasePool, closeDatabasePool } from "./src/aws-db-config";
import "dotenv/config";

async function testConnection() {
  console.log("Testing AWS RDS Aurora PostgreSQL connection...");

  try {
    // Get the pool and test the connection
    const pool = await getDatabasePool();

    // Test basic query
    const result = await pool.query("SELECT NOW() as current_time, version() as postgres_version");

    console.log("✅ Connection successful!");
    console.log("📅 Current time:", result.rows[0].current_time);
    console.log("🐘 PostgreSQL version:", result.rows[0].postgres_version);

    // Test if tables exist
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    if (tablesResult.rows.length > 0) {
      console.log("📋 Existing tables:");
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.tablename}`);
      });
    } else {
      console.log("⚠️  No tables found. You may need to run the database setup script.");
    }
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error(error);

    if (error instanceof Error) {
      if (error.message.includes("Authentication")) {
        console.log("\n💡 Tip: Check your AWS credentials and make sure they have access to Secrets Manager");
      } else if (error.message.includes("timeout")) {
        console.log("\n💡 Tip: Check your network connection and RDS security groups");
      } else if (error.message.includes("does not exist")) {
        console.log("\n💡 Tip: Make sure the secret name is correct in your configuration");
      }
    }
  } finally {
    // Clean up the connection
    await closeDatabasePool();
    console.log("Connection closed.");
  }
}

// Run the test
testConnection();

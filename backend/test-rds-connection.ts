import "dotenv/config";
import { getRDSConnectionString, validateEnvironmentConfig } from "./src/aws-rds-config";
import { Pool } from "pg";

/**
 * Test script to validate RDS Aurora connection
 * Run with: npm run test-rds
 */
async function testRDSConnection(): Promise<void> {
  console.log("🧪 Testing RDS Aurora connection...");

  try {
    // Step 1: Validate environment configuration
    console.log("\n📋 Step 1: Validating environment configuration");
    validateEnvironmentConfig();

    // Step 2: Get connection string
    console.log("\n🔗 Step 2: Getting RDS connection string");
    const connectionString = await getRDSConnectionString();
    console.log("✅ Connection string obtained successfully");

    // Step 3: Test database connection
    console.log("\n🔌 Step 3: Testing database connection");
    const pool = new Pool({
      connectionString,
      max: 1, // Single connection for testing
      connectionTimeoutMillis: 10000,
    });

    // Test basic connectivity
    const result = await pool.query("SELECT NOW() as current_time, version() as db_version");
    console.log("✅ Database connection successful");
    console.log(`   Current time: ${result.rows[0].current_time}`);
    console.log(`   Database version: ${result.rows[0].db_version}`);

    // Test basic table query to ensure schema exists
    console.log("\n📊 Step 4: Testing database schema");
    const schemaTest = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("✅ Database schema accessible");
    console.log(`   Found ${schemaTest.rows.length} tables in public schema:`);
    schemaTest.rows.forEach((row) => console.log(`     - ${row.table_name}`));

    // Clean up
    await pool.end();

    console.log("\n🎉 RDS Aurora connection test completed successfully!");
  } catch (error) {
    console.error("\n❌ RDS Aurora connection test failed:");
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testRDSConnection();

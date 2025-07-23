import "dotenv/config";
import { getRDSConnectionString, validateEnvironmentConfig } from "./src/aws-rds-config";
import { Pool } from "pg";

async function testRDSConnection(): Promise<void> {
  try {
    validateEnvironmentConfig();

    const connectionString = await getRDSConnectionString();

    const pool = new Pool({
      connectionString,
      max: 1,
      connectionTimeoutMillis: 10000,
    });

    const result = await pool.query("SELECT NOW() as current_time, version() as db_version");
    console.log(`   Current time: ${result.rows[0].current_time}`);
    console.log(`   Database version: ${result.rows[0].db_version}`);

    const schemaTest = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`   Found ${schemaTest.rows.length} tables in public schema:`);
    schemaTest.rows.forEach((row) => console.log(`     - ${row.table_name}`));

    await pool.end();
  } catch (error) {
    if (error instanceof Error) {
      console.error("RDS Aurora connection test failed:", error.message);
    } else {
      console.error("RDS Aurora connection test failed");
    }

    process.exit(1);
  }
}

testRDSConnection();

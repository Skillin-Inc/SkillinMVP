import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { getRDSConnectionString } from "./src/aws-rds-config";
import { resetUserPool, validateCognitoConfig, CognitoUserData } from "./src/services/cognitoService";

import "dotenv/config";

// Demo users data (matching the database inserts)
const DEMO_USERS: CognitoUserData[] = [
  {
    username: "student@email.com",
    email: "student@email.com",
    firstName: "Demo",
    lastName: "Student",
    password: "Password123!",
    userType: "student",
  },
  {
    username: "teacher@email.com",
    email: "teacher@email.com",
    firstName: "Demo",
    lastName: "Teacher",
    password: "Password123!",
    userType: "teacher",
  },
  {
    username: "admin@email.com",
    email: "admin@email.com",
    firstName: "Demo",
    lastName: "Admin",
    password: "Password123!",
    userType: "admin",
  },
];

async function setupDatabase() {
  let pool: Pool | null = null;

  try {
    console.log("🚀 Starting database and Cognito setup...");

    // Step 1: Validate Cognito configuration
    console.log("\n🔍 Step 1: Validating Cognito configuration...");
    validateCognitoConfig();

    // Step 2: Set up database
    console.log("\n🔄 Step 2: Getting RDS connection string...");
    const connectionString = await getRDSConnectionString();

    pool = new Pool({
      connectionString,
    });

    console.log("🔌 Connecting to database...");
    await pool.query("SELECT NOW()");
    console.log("✅ Successfully connected to database");

    const schemaPath = path.join(__dirname, "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("🏗️ Setting up database schema...");
    await pool.query(schema);
    console.log("✅ Successfully set up database schema");

    const dataPath = path.join(__dirname, "database", "data.sql");
    const data = fs.readFileSync(dataPath, "utf8");

    console.log("📊 Inserting sample data...");
    await pool.query(data);
    console.log("✅ Successfully inserted sample data");

    // Step 3: Reset Cognito User Pool
    console.log("\n👥 Step 3: Resetting Cognito User Pool...");
    await resetUserPool(DEMO_USERS);
    console.log("✅ Successfully reset Cognito User Pool");

    console.log("\n🎉 Database and Cognito setup complete!");
    console.log("\n📋 Created demo users:");
    DEMO_USERS.forEach((user) => {
      console.log(`   - ${user.userType}: ${user.email} (${user.username})`);
    });
    console.log("\n🔐 Default password for all demo users: Password123!");
  } catch (error) {
    console.error("\n❌ Setup failed:");
    console.error(error);
    console.error("Please check your configuration and try again.");
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

setupDatabase();

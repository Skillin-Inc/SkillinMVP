import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { getRDSConnectionString } from "./src/aws-rds-config";
import {
  resetUserPool,
  validateCognitoConfig,
  CognitoUserData,
  CreatedCognitoUser,
} from "./src/services/cognitoService";

import "dotenv/config";

const DEMO_USERS: CognitoUserData[] = [
  {
    username: "student@email.com",
    email: "student@email.com",
    firstName: "Demo",
    lastName: "Student",
    password: "Pass123!",
    userType: "student",
  },
  {
    username: "teacher@email.com",
    email: "teacher@email.com",
    firstName: "Demo",
    lastName: "Teacher",
    password: "Pass123!",
    userType: "teacher",
  },
  {
    username: "admin@email.com",
    email: "admin@email.com",
    firstName: "Demo",
    lastName: "Admin",
    password: "Pass123!",
    userType: "admin",
  },
];

async function insertDatabaseUsers(pool: Pool, createdUsers: CreatedCognitoUser[]) {
  const student = createdUsers.find((u) => u.userType === "student");
  const teacher = createdUsers.find((u) => u.userType === "teacher");
  const admin = createdUsers.find((u) => u.userType === "admin");

  if (!student || !teacher || !admin) {
    throw new Error("Could not find all required user types");
  }

  const userInsertQuery = `
    INSERT INTO "users" (
      "id", "first_name", "last_name", "email", "phone_number", "username", 
      "user_type", "date_of_birth",
      "is_paid", "stripe_customer_id", "subscription_status",
      "subscription_start_date", "subscription_end_date", "cancel_at_period_end"
    ) VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14),
      ($15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28),
      ($29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42)
  `;

  await pool.query(userInsertQuery, [
    // student
    student.sub,
    student.firstName,
    student.lastName,
    student.email,
    "1231231234",
    "studentdemo",
    "student",
    "1995-03-15",
    false,
    null,
    "inactive",
    null,
    null,
    false,
    // teacher
    teacher.sub,
    teacher.firstName,
    teacher.lastName,
    teacher.email,
    "5551234567",
    "teacherdemo",
    "teacher",
    "1988-07-22",
    false,
    null,
    "inactive",
    null,
    null,
    false,
    // admin
    admin.sub,
    admin.firstName,
    admin.lastName,
    admin.email,
    "9998887777",
    "admindemo",
    "admin",
    "1980-12-01",
    false,
    null,
    "inactive",
    null,
    null,
    false,
  ]);

  return {
    studentId: student.sub,
    teacherId: teacher.sub,
    adminId: admin.sub,
  };
}

async function insertSampleData(pool: Pool, userIds: { studentId: string; teacherId: string; adminId: string }) {
  const categoriesQuery = `
    INSERT INTO "categories" ("id", "title") VALUES 
      ('550e8400-e29b-41d4-a716-446655440000', 'Poker'),
      ('550e8400-e29b-41d4-a716-446655440001', 'Sports Betting'),
      ('550e8400-e29b-41d4-a716-446655440002', 'Basketball'),
      ('550e8400-e29b-41d4-a716-446655440003', 'Pickleball'),
      ('550e8400-e29b-41d4-a716-446655440004', 'Gaming'),
      ('550e8400-e29b-41d4-a716-446655440005', 'Cooking'),
      ('550e8400-e29b-41d4-a716-446655440006', 'Personal Finance'),
      ('550e8400-e29b-41d4-a716-446655440007', 'Self Care'),
      ('550e8400-e29b-41d4-a716-446655440008', 'Dating'),
      ('550e8400-e29b-41d4-a716-446655440009', 'Communication'),
      ('550e8400-e29b-41d4-a716-44665544000a', 'Snowboarding'),
      ('550e8400-e29b-41d4-a716-44665544000b', 'Skiing')
  `;
  await pool.query(categoriesQuery);

  const coursesQuery = `
    INSERT INTO "courses" ("id", "teacher_id", "category_id", "title", "description") VALUES
      ('330e8400-e29b-41d4-a716-446655440000', $1, '550e8400-e29b-41d4-a716-446655440000', 'Poker Fundamentals', 'Learn the basic skills of poker including hand rankings, betting strategies, and table etiquette. Perfect for beginners who want to master the fundamentals of poker.'),
      ('330e8400-e29b-41d4-a716-446655440001', $1, '550e8400-e29b-41d4-a716-446655440002', 'Basketball Skills Development', 'Comprehensive basketball training focusing on shooting, dribbling, passing, and defensive techniques. Build your skills from the ground up with professional coaching.'),
      ('330e8400-e29b-41d4-a716-446655440002', $1, '550e8400-e29b-41d4-a716-446655440005', 'Cooking Basics', 'Master essential cooking techniques, knife skills, and recipe fundamentals. Learn to create delicious meals from scratch with confidence.')
  `;
  await pool.query(coursesQuery, [userIds.teacherId]);

  const lessonsQuery = `
    INSERT INTO "lessons" ("id", "teacher_id", "course_id", "title", "description", "video_url") VALUES
      ('440e8400-e29b-41d4-a716-446655440000', $1, '330e8400-e29b-41d4-a716-446655440000', 'Hand Rankings and Basic Rules', 'Learn the hierarchy of poker hands and fundamental rules of the game to get started playing confidently.', 'https://example.com/poker-basics'),
      ('440e8400-e29b-41d4-a716-446655440001', $1, '330e8400-e29b-41d4-a716-446655440000', 'Betting Strategies', 'Master basic betting strategies including when to bet, call, raise, or fold based on your hand strength.', 'https://example.com/betting-strategies'),
      ('440e8400-e29b-41d4-a716-446655440002', $1, '330e8400-e29b-41d4-a716-446655440001', 'Shooting Form and Technique', 'Perfect your shooting form with proper hand placement, follow-through, and consistent release. Build muscle memory for accurate shooting.', 'https://example.com/shooting-form'),
      ('440e8400-e29b-41d4-a716-446655440003', $1, '330e8400-e29b-41d4-a716-446655440001', 'Ball Handling and Dribbling', 'Develop advanced ball handling skills including crossovers, behind-the-back moves, and maintaining control under pressure.', 'https://example.com/ball-handling'),
      ('440e8400-e29b-41d4-a716-446655440004', $1, '330e8400-e29b-41d4-a716-446655440002', 'Knife Skills and Safety', 'Learn proper knife handling techniques, cutting methods, and safety practices essential for every cook.', 'https://example.com/knife-skills'),
      ('440e8400-e29b-41d4-a716-446655440005', $1, '330e8400-e29b-41d4-a716-446655440002', 'Basic Cooking Methods', 'Master fundamental cooking techniques including sautéing, roasting, boiling, and grilling to create versatile dishes.', 'https://example.com/cooking-methods')
  `;
  await pool.query(lessonsQuery, [userIds.teacherId]);
}

async function setupDatabase() {
  let pool: Pool | null = null;

  try {
    validateCognitoConfig();

    const connectionString = await getRDSConnectionString();

    pool = new Pool({
      connectionString,
    });

    await pool.query("SELECT NOW()");

    const schemaPath = path.join(__dirname, "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);

    const createdUsers = await resetUserPool(DEMO_USERS);

    const userIds = await insertDatabaseUsers(pool, createdUsers);

    await insertSampleData(pool, userIds);

    createdUsers.forEach((user) => {
      console.log(`   - ${user.userType}: ${user.email} (sub: ${user.sub})`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    console.error("Setup failed:");
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

setupDatabase();

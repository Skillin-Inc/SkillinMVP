import { z } from "zod";
import "dotenv/config";

const environmentSchema = z.object({
  // server
  PORT: z.string().default("8080").transform(Number),
  FRONTEND_URL: z.string().default("http://ec2-18-220-186-167.us-east-2.compute.amazonaws.com/"),

  // aws
  AWS_REGION: z.string().default("us-east-2"),
  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS Access Key ID is required"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS Secret Access Key is required"),

  // cognito
  COGNITO_USER_POOL_ID: z.string().min(1, "Cognito user pool ID is required"),
  COGNITO_CLIENT_ID: z.string().min(1, "Cognito client ID is required"),

  // database
  RDS_SECRET_NAME: z.string().default("rds!cluster-d1aab255-8b30-49d0-a107-f2cc5e0c5cc6"),
  RDS_HOST: z.string().optional(),
  RDS_PORT: z.string().default("5432").transform(Number),
  RDS_DATABASE: z.string().default("postgres"),
  RDS_ENGINE: z.string().default("postgres"),

  // stripe
  STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "Stripe webhook secret is required"),
  STRIPE_PRICE_ID: z.string().min(1, "Stripe price ID is required"),
});

function validateEnvironment() {
  try {
    return environmentSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Environment validation failed:");
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const config = validateEnvironment();

export const serverConfig = {
  port: config.PORT,
  frontendUrl: config.FRONTEND_URL,
};

export const awsConfig = {
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
};

export const cognitoConfig = {
  userPoolId: config.COGNITO_USER_POOL_ID,
  clientId: config.COGNITO_CLIENT_ID,
  region: config.AWS_REGION,
};

export const databaseConfig = {
  secretName: config.RDS_SECRET_NAME,
  host: config.RDS_HOST,
  port: config.RDS_PORT,
  database: config.RDS_DATABASE,
  engine: config.RDS_ENGINE,
};

export const stripeConfig = {
  secretKey: config.STRIPE_SECRET_KEY,
  webhookSecret: config.STRIPE_WEBHOOK_SECRET,
  priceId: config.STRIPE_PRICE_ID,
};

import jwt, { JwtHeader } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Request, Response, NextFunction } from "express";
import { cognitoConfig } from "../config/environment";

// JWKS client for Cognito public keys
const client = jwksClient({
  jwksUri: `https://cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}/.well-known/jwks.json`,
});

// Get the signing key
function getKey(header: JwtHeader, callback: (err: Error | null, key?: string) => void): void {
  client.getSigningKey(header.kid!, (err: Error | null, key?: jwksClient.SigningKey) => {
    if (err) return callback(err);
    if (!key) return callback(new Error("No signing key found"));
    const signingKey = key.getPublicKey(); // returns PEM string
    callback(null, signingKey);
  });
}

// Updated interface - remove optional attributes
interface DecodedToken {
  sub: string;
  email: string;
  "cognito:username": string;
  [key: string]: unknown;
}

// Verify Cognito JWT token
export function verifyCognitoToken(token: string): Promise<DecodedToken> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: cognitoConfig.clientId,
        issuer: `https://cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}`,
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as DecodedToken);
        }
      }
    );
  });
}

// Middleware to verify Cognito JWT token
export async function cognitoAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = await verifyCognitoToken(token);

    // Only set basic info from token - get the rest from database
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      username: decoded["cognito:username"] || decoded.email,
      userType: "student", // Default - should be overridden by database lookup if needed
      firstName: "", // Will be empty - get from database if needed
      lastName: "", // Will be empty - get from database if needed
    };
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: "Invalid token" });
  }
}

// Optional: Middleware for specific user types
export function requireUserType(allowedTypes: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!allowedTypes.includes(req.user.userType)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}

// Extend Express Request type to include `user`
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      sub: string;
      email: string;
      username: string;
      userType: string;
      firstName: string;
      lastName: string;
    };
  }
}

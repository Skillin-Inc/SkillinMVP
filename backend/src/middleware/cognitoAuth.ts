import jwt, { JwtHeader } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Request, Response, NextFunction } from "express";

// Cognito configuration
const COGNITO_CONFIG = {
  region: "us-west-2",
  userPoolId: "us-west-2_Q82pOf5Ya",
  clientId: "4vaofjh7b609c95ffo825hmdap",
};

// JWKS client for Cognito public keys
const client = jwksClient({
  jwksUri: `https://cognito-idp.${COGNITO_CONFIG.region}.amazonaws.com/${COGNITO_CONFIG.userPoolId}/.well-known/jwks.json`,
});

// Get the signing key
function getKey(header: JwtHeader, callback: (err: Error | null, key?: string) => void): void {
  client.getSigningKey(header.kid!, (err: Error | null, key: any) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey(); // returns PEM string
    callback(null, signingKey);
  });
}

// Verify Cognito JWT token
export function verifyCognitoToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: COGNITO_CONFIG.clientId,
        issuer: `https://cognito-idp.${COGNITO_CONFIG.region}.amazonaws.com/${COGNITO_CONFIG.userPoolId}`,
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      }
    );
  });
}

// Middleware to verify Cognito JWT token
export function cognitoAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  verifyCognitoToken(token)
    .then((decoded) => {
      req.user = {
        sub: decoded.sub,
        email: decoded.email,
        username: decoded["cognito:username"],
        userType: "student",
        firstName: decoded.given_name,
        lastName: decoded.family_name,
      };
      next();
    })
    .catch((err) => {
      console.error("Token verification failed:", err);
      res.status(401).json({ error: "Invalid token" });
    });
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
declare global {
  namespace Express {
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
}

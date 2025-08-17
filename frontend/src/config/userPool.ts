import { CognitoUserPool } from "amazon-cognito-identity-js";
import { COGNITO_CONFIG } from "./cognitoConfig";

export const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_CONFIG.UserPoolId,
  ClientId: COGNITO_CONFIG.ClientId,
});

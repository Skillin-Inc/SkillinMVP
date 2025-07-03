import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from "amazon-cognito-identity-js";
import { COGNITO_CONFIG } from "../config/cognitoConfig";

const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_CONFIG.UserPoolId,
  ClientId: COGNITO_CONFIG.ClientId,
});

export const signUp = (email: string, password: string, firstName?: string, lastName?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "given_name", Value: firstName }), // why is this red and it works
      new CognitoUserAttribute({ Name: "family_name", Value: lastName }), // why is this red and it works
    ];

    userPool.signUp(email, password, attributes, [], (err, result) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export const confirmSignUp = (email: string, code: string): Promise<void> => {
  const user = new CognitoUser({ Username: email, Pool: userPool });
  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export const signIn = (email: string, password: string): Promise<{ user: CognitoUser; session: any }> => {
  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const user = new CognitoUser({ Username: email, Pool: userPool });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve({ user, session });
      },
      onFailure: (err) => {
        reject(err);
      },
      mfaRequired: (codeDeliveryDetails) => {
        // You can handle MFA here if you're using SMS/email 2FA
        reject({ mfaRequired: true, codeDeliveryDetails });
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // Optional: handle if forced password change is required
        reject({ newPasswordRequired: true, userAttributes, requiredAttributes });
      },
    });
  });
};

export const signOut = (email: string) => {
  const user = new CognitoUser({ Username: email, Pool: userPool });
  user.signOut();
};

export const forgotPassword = (email: string): Promise<void> => {
  const user = new CognitoUser({ Username: email, Pool: userPool });
  return new Promise((resolve, reject) => {
    user.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
};

export const confirmForgotPassword = (email: string, code: string, newPassword: string): Promise<void> => {
  const user = new CognitoUser({ Username: email, Pool: userPool });
  return new Promise((resolve, reject) => {
    user.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
};

export const getCurrentSession = (): Promise<any> => {
  const user = userPool.getCurrentUser();
  if (!user) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    user.getSession((err: Error | null, session: any) => {
      if (err) return reject(err);
      resolve(session);
    });
  });
};

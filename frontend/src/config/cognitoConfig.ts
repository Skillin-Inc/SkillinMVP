export const COGNITO_CONFIG = {
  region: "us-east-2",

  // Cognito User Pool information
  UserPoolId: "us-east-2_ce7KAadKf",
  ClientId: "5hqpvuhen3vutlbe21l20pvf8k", // SkillinMVP app client (no secret)

  // Frontend callback and logout URLs
  RedirectUri: "https://d84l1y8p4kdic.cloudfront.net",
  LogoutUri: "https://d84l1y8p4kdic.cloudfront.net",

  // Cognito hosted domain for login/logout endpoints
  HostedDomain: "https://us-east-2ce7kaadkf.auth.us-east-2.amazoncognito.com",
};

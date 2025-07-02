export const COGNITO_CONFIG = {
  region: "us-west-2",

  // Cognito User Pool information
  UserPoolId: "us-west-2_Q82pOf5Ya", // replace with your actual pool ID
  ClientId: "4vaofjh7b609c95ffo825hmdap", // replace with your actual client ID

  // Frontend callback and logout URLs
  RedirectUri: "https://d84l1y8p4kdic.cloudfront.net/callback",
  LogoutUri: "https://d84l1y8p4kdic.cloudfront.net",

  // Cognito hosted domain for login/logout endpoints
  HostedDomain: "https://us-west-2.auth.us-west-2.amazoncognito.com",
};

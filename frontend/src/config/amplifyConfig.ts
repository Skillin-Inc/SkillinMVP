import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import AsyncStorage from "@react-native-async-storage/async-storage";

const amplifyConfig = {
  Auth: {
    Cognito: {
      region: "us-east-2",
      userPoolId: "us-east-2_RfYpNAXPY",
      userPoolClientId: "7tfv0pidql9j7rovt1e4q6ot89",
      signUpVerificationMethod: "code" as const,
      loginWith: {
        email: true,
        username: false,
      },
    },
  },
};

console.log("Configuring Amplify with:", amplifyConfig);

// Configure token storage for React Native BEFORE configuring Amplify
cognitoUserPoolsTokenProvider.setKeyValueStorage(AsyncStorage);

try {
  Amplify.configure(amplifyConfig);
  console.log("Amplify configured successfully");

  // Test if the configuration is actually valid
  console.log("Testing Amplify configuration...");
  const currentConfig = Amplify.getConfig();
  console.log("Current Amplify config:", JSON.stringify(currentConfig, null, 2));
} catch (configError) {
  console.error("Error configuring Amplify:", configError);
}

export default amplifyConfig;

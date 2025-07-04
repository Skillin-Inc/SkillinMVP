import { createStackNavigator } from "@react-navigation/stack";

import TeacherAuthStack from "./TeacherAuthStack";
import Welcome from "../screens/auth/Welcome";
import StudentInfo from "../screens/auth/StudentInfo";
import StudentAccount from "../screens/auth/StudentAccount";
import Login from "../screens/auth/Login";
import ForgotPassword from "../screens/auth/ForgotPassword";
import ResetPassword from "../screens/auth/ResetPassword";
import RegisterPayment from "../screens/auth/RegisterPayment";
import EmailConfirmation from "../screens/auth/EmailConfirmation";

import { AuthStackParamList } from "../types";

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="StudentInfo" component={StudentInfo} />
      <Stack.Screen name="StudentAccount" component={StudentAccount} />
      <Stack.Screen name="RegisterPayment" component={RegisterPayment} />
      <Stack.Screen name="TeacherNavigator" component={TeacherAuthStack} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="EmailConfirmation" component={EmailConfirmation} />
    </Stack.Navigator>
  );
}

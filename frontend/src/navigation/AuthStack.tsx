import { createStackNavigator } from "@react-navigation/stack";

import TeacherNavigator from "./TeacherSignupStack";
import Welcome from "../screens/auth/Welcome";
import Register from "../screens/auth/Register";
import Login from "../screens/auth/Login";
import RegisterPayment from "../screens/auth/RegisterPayment";

import { AuthStackParamList } from "../types";

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="RegisterPayment" component={RegisterPayment} />
      <Stack.Screen name="TeacherNavigator" component={TeacherNavigator} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}

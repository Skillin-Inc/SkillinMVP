// src/Navigation.tsx
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { AuthContext } from "../hooks/AuthContext";
import AuthStack from "./AuthStack";
import TeacherAuthStack from "./TeacherAuthStack";
import StudentStack from "./StudentStack";
import TeacherStack from "./TeacherStack";
import AdminStack from "./AdminStack";
import { RootStackParamList } from "../types/navigation";
import SubscriptionGate from "../screens/shared/SubscriptionGate"; 

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user,isPaid, freeMode, checkPaidStatus, setFreeMode } = useContext(AuthContext);

  const shouldBlock = !freeMode && !isPaid;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user && (
          <>
            <Stack.Screen name="AuthStack" component={AuthStack} />
            <Stack.Screen name="TeacherAuthStack" component={TeacherAuthStack} />
          </>
        )}

        {user && shouldBlock && (
          <Stack.Screen
            name="SubscriptionGate"
            component={SubscriptionGate}
            initialParams={{
              user,
              checkPaidStatus,
              setFreeMode,
              BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL!,
            }}
          />
        )}
        {user?.userType === "student" && <Stack.Screen name="StudentStack" component={StudentStack} />}
        {user?.userType === "teacher" && <Stack.Screen name="TeacherStack" component={TeacherStack} />}
        {user?.userType === "admin" && <Stack.Screen name="AdminStack" component={AdminStack} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

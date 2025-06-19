// src/Navigation.tsx
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { AuthContext } from "../hooks/AuthContext";

import AuthStack from "./AuthStack";
import TeacherAuthStack from "./TeacherAuthStack";
import StudentStack from "./StudentStack";
import TeacherStack from "./TeacherStack";
import AdminTabs from "./AdminTabs";
import { RootStackParamList } from "../types/navigation";

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user && (
          <>
            <Stack.Screen name="AuthStack" component={AuthStack} />
            <Stack.Screen name="TeacherAuthStack" component={TeacherAuthStack} />
          </>
        )}
        {user?.userType === "student" && <Stack.Screen name="StudentStack" component={StudentStack} />}
        {user?.userType === "teacher" && <Stack.Screen name="TeacherStack" component={TeacherStack} />}
        {user?.userType === "admin" && <Stack.Screen name="AdminStack" component={AdminTabs} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

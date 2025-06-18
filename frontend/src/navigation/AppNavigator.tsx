// src/Navigation.tsx
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { AuthContext } from "../hooks/AuthContext";

import AuthStack from "./AuthStack";
import TeacherAuthStack from "./TeacherAuthStack";
import StudentStack from "./StudentStack";
import TeacherStack from "./TeacherStack";
import { RootStackParamList } from "../types/navigation";

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);
  const isTeacher = user?.is_teacher || false;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="AuthStack" component={AuthStack} />
            <Stack.Screen name="TeacherAuthStack" component={TeacherAuthStack} />
          </>
        ) : isTeacher ? (
          <Stack.Screen name="TeacherStack" component={TeacherStack} />
        ) : (
          <Stack.Screen name="StudentStack" component={StudentStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

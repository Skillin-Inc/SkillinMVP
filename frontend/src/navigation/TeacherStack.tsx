import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import TeacherTabs from "./TeacherTabs";
import TeacherCreateCourse from "../screens/teachers/TeacherCreateCourse";
import Chat from "../screens/shared/Chat";
import { TeacherStackParamList } from "../types/navigation";
import Profile from "../screens/shared/Profile";

const Stack = createStackNavigator<TeacherStackParamList>();

export default function TeacherStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
      <Stack.Screen name="StudentProfile" component={Profile} />

      <Stack.Screen name="TeacherCreateCourse" component={TeacherCreateCourse} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}

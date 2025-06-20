import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import TeacherTabs from "./TeacherTabs";
import TeacherCreateCourse from "../screens/teachers/TeacherCreateCourse";
import TeacherCoursesList from "../screens/teachers/TeacherCoursesList";
import TeacherCourse from "../screens/teachers/TeacherCourse";
import TeacherLesson from "../screens/teachers/TeacherLesson";
import TeacherStats from "../screens/teachers/TeacherStats";
import Chat from "../screens/shared/Chat";
import { TeacherStackParamList } from "../types/navigation";

const Stack = createStackNavigator<TeacherStackParamList>();

export default function TeacherStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
      <Stack.Screen name="TeacherCreateCourse" component={TeacherCreateCourse} />
      <Stack.Screen name="TeacherCoursesList" component={TeacherCoursesList} />
      <Stack.Screen name="TeacherCourse" component={TeacherCourse} />
      <Stack.Screen name="TeacherLesson" component={TeacherLesson} />
      <Stack.Screen name="TeacherStats" component={TeacherStats} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}

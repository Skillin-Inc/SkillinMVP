import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import StudentTabs from "./StudentTabs";
import StudentTopicDetail from "../screens/students/StudentTopicDetail";
import StudentAltCategoryDetail from "../screens/students/StudentAltCategoryDetail";
import Chat from "../screens/shared/Chat";
import { StudentStackParamList } from "../types/navigation";

const Stack = createStackNavigator<StudentStackParamList>();

export default function StudentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="StudentTabs" component={StudentTabs} />
      <Stack.Screen name="StudentTopicDetail" component={StudentTopicDetail} />
      <Stack.Screen name="StudentAltCategoryDetail" component={StudentAltCategoryDetail} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}

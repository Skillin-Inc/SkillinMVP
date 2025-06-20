// navigation/const TeacherAuthStack.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TeacherStart from "../screens/teacherAuth/TeacherStart";
import TeacherPayouts from "../screens/teacherAuth/TeacherPayouts";
import TeacherInfo from "../screens/teacherAuth/TeacherInfo";
import TeacherExperience from "../screens/teacherAuth/TeacherExperience";
import TeacherSubmit from "../screens/teacherAuth/TeacherSubmit";
import { TeacherAuthStackParamList } from "../types/navigation";

const Stack = createStackNavigator<TeacherAuthStackParamList>();

export default function TeacherAuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TeacherStart" component={TeacherStart} />
      <Stack.Screen name="TeacherPayouts" component={TeacherPayouts} />
      <Stack.Screen name="TeacherInfo" component={TeacherInfo} />
      <Stack.Screen name="TeacherExperience" component={TeacherExperience} />
      <Stack.Screen name="TeacherSubmit" component={TeacherSubmit} />
    </Stack.Navigator>
  );
}

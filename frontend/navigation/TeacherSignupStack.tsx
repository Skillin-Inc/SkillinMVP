// navigation/const TeacherSignupStack.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import ApplicationStartScreen from "../src/screens/teacherSignup/ApplicationStart";
import PersonalInfoScreen from "../src/screens/teacherSignup/PersonalInfo";
import TeachingExperienceScreen from "../src/screens/teacherSignup/TeachingExperienceScreen";

const TeacherSignupStack = createStackNavigator();

export function TeacherNavigator() {
  return (
    <TeacherSignupStack.Navigator screenOptions={{ headerShown: false }}>
      <TeacherSignupStack.Screen name="ApplicationStart" component={ApplicationStartScreen} />
      <TeacherSignupStack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <TeacherSignupStack.Screen name="TeachingExperience" component={TeachingExperienceScreen} />

      {/* More teacher-only screens */}
    </TeacherSignupStack.Navigator>
  );
}

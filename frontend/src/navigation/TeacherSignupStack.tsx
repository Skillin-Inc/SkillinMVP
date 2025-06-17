// navigation/const TeacherSignupStack.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import TeacherStart from "../screens/teacherAuth/TeacherStart";
import TeacherPayouts from "../screens/teacherAuth/TeacherPayouts";
import TeacherInfo from "../screens/teacherAuth/TeacherInfo";
import TeacherExperience from "../screens/teacherAuth/TeacherExperience";
import TeacherSubmit from "../screens/teacherAuth/TeacherSubmit";
import { TeacherStackParamList } from "../types";

const TeacherSignupStack = createStackNavigator<TeacherStackParamList>();

export default function TeacherNavigator() {
  return (
    <TeacherSignupStack.Navigator screenOptions={{ headerShown: false }}>
      <TeacherSignupStack.Screen name="TeacherStart" component={TeacherStart} />
      <TeacherSignupStack.Screen name="TeacherPayouts" component={TeacherPayouts} />
      <TeacherSignupStack.Screen name="TeacherInfo" component={TeacherInfo} />
      <TeacherSignupStack.Screen name="TeacherExperience" component={TeacherExperience} />
      <TeacherSignupStack.Screen name="TeacherSubmit" component={TeacherSubmit} />
    </TeacherSignupStack.Navigator>
  );
}
